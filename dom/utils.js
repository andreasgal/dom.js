// Utility functions and other globals used throughout dom.js

// Take a snapshot of all API functions we might call. Some of the code
// below might run after initialization, at which point user code might
// have redirected them.
var Object_prototype = Object.prototype;
var defineProperty = Object.defineProperty;
var freeze = Object.freeze;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var keys = Object.keys;

function PropertyDescriptor() {}
PropertyDescriptor.prototype.readonly = function() {
    this.writable = false;
    return this;
}
PropertyDescriptor.prototype.hidden = function() {
    this.enumerable = false;
    return this;
}
PropertyDescriptor.prototype.fixed = function() {
    this.configurable = false;
    return this;
}
function DataProp(v) {
    var d = Object.create(PropertyDescriptor.prototype);
    d.value = v;
    d.writable = d.enumerable = d.configurable = true;
    return d; 
}
function AccessorProp(get, set) {
    var d = Object.create(PropertyDescriptor.prototype);
    d.get = get;
    if (set) d.set = set;
    d.enumerable = d.configurable = true;
    return d; 
}

const hiddenPropDesc = {writable: true,enumerable: false,configurable: true};
const constantPropDesc = {writable: false,enumerable: true,configurable: false};
const hiddenConstantPropDesc = {
    writable: false, enumerable: false, configurable: false
};

// Set o.p to v, but make the property non-enumerable
function defineHiddenProp(o,p,v) {
    hiddenPropDesc.value = v;
    Object.defineProperty(o, p, hiddenPropDesc);
}

// Set o.p to v, and make it constant
function defineConstantProp(o,p,v) {
    constantPropDesc.value = v;
    Object.defineProperty(o, p, constantPropDesc);
}

// Set o.p to v, and make it constant and non-enumerable
function defineHiddenConstantProp(o,p,v) {
    hiddenConstantPropDesc.value = v;
    Object.defineProperty(o, p, hiddenConstantPropDesc);
}

// Define a property p of the object o whose value is the return value of f().
// But don't invoke f() until the property is actually used for the first time.
// The property will be writeable, enumerable and configurable.
// If the property is made read-only before it is used, then it will throw
// an exception when used.
// Based on Andreas's AddResolveHook function.
// 
// XXX
// Extend this to allow it to define multiple lazy properties associated
// with a single function: reading any property will invoke the hook and
// define all of the properties that have not previously been redefined.
// This is needed because defineInterface creates both a constructor function
// and a public interface object. Using either one must trigger the 
// creation of both.
// XXX
// Also, we need to be able to specify a property descriptor so lazy props
// can be made non-enumerable (e.g.)
function defineLazyProperty(o, p, f) {
    defineProperty(o, p,
                   AccessorProp(function() { // the property getter
                                   var value = f();
                                   defineProperty(o, p, { value: value });
                                   return value;
                                },
                                function(value) { // the property setter
                                    defineProperty(o, p, { value: value });
                                }));
}

// Anything I want to define lazily using defineLazyProperty above has to
// be a property of something; it can't just be a local variable.  So this
// DOM object is the holder for lazy properties.  It will be used for things
// like the internal versions of constructors: DOM.Element() etc.
var DOM = {};

function nyi() { throw "Not Yet Implemented"; }

// The DOM has some nested type hierarchies and WebIDL has specific requirements
// about property attributes, etc.  This function defines a new DOM 
// interface, returning a constructor function for internal use
// and also creating an interface object that will be exposed globally.
function defineInterface(name,         // The name of the interface
                         superclass,   // The superclass constructor
                         init,         // initialization function
                         constants,    // constants defined by the interface
                         members)      // interface attributes and methods
{
    var constructor, prototype, interfaceObject;

    if (superclass) {
        constructor = function() {
            superclass.apply(this, arguments);
            init.apply(this, arguments);
        };
        prototype = Object.create(superclass.prototype);
    }
    else {
        constructor = function() {
            init.apply(this, arguments);
        };
        prototype = {};
    }
    

    // The interface object is supposed to work with instanceof, but is 
    // not supposed to be callable.  We can't conform to both requirements
    // so we make the interface object a function that throws when called.
    interfaceObject = function() { 
        throw new TypeError(name + " is not (supposed to be) a function");
    };

    // Retain references to the prototype and interface objects for internal use
    constructor.prototype = prototype;
    constructor["interface"] = interfaceObject

    // WebIDL says that the interface object has this prototype property
    defineHiddenConstantProp(interfaceObject, "prototype", prototype);
    // WebIDL also says that the prototype points back to the interface object
    // instead of the real constructor.
    defineHiddenProp(prototype, "constructor", interfaceObject);

    // Constants must be defined on both the prototype and interface objects
    // And they must read-only and non-configurable
    if (constants) {
        for(var c in constants) {
            var value = constants[c];
            defineConstantProp(prototype, c, value);
            defineConstantProp(interfaceObject, c, value);
        }
    }

    // Now copy attributes and methods onto the prototype object.
    // Members should just be an ordinary object.  Attributes should be
    // defined with getters and setters. Methods should be regular properties.
    // This will mean that the members will all be enumerable, configurable
    // and writable (unless there is no setter) as they are supposed to be.
    if (members) {
        for(var m in members)
            Object.defineProperty(prototype, m, 
                                  Object.getOwnPropertyDescriptor(members, m));
    }

    // Export the interface object
    defineHiddenProp(global, name, interfaceObject);

    // Finally, return the constructor
    return constructor;
}
