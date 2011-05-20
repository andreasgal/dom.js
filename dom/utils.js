// Utility functions and other globals used throughout dom.js

// Take a snapshot of all API functions we might call. Some of the code
// below might run after initialization, at which point user code might
// have redirected them.
let Object_prototype = Object.prototype;
let create = Object.create;
let defineProperty = Object.defineProperty;
let freeze = Object.freeze;
let getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
let getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
let keys = Object.keys;

function assert(expr, msg) {
    if (!expr) throw new Error("Assertion failed " + (msg||""));
}

// For stuff that I haven't implemented yet
function nyi() { throw "Not Yet Implemented"; }

// Use this for interface members that will be implemented by subclasses
function abstractMethod() { throw "Abstract Member"; }

// Use this for things like the appendChild method of Text nodes
function hierarchyRequestError() {
    throw new DOM.DOMException(HIERARCHY_REQUEST_ERROR);
}

const readonlyPropDesc = {writable:false,enumerable:true,configurable: true};
const hiddenPropDesc = {writable: true,enumerable: false,configurable: true};
const constantPropDesc = {writable: false,enumerable: true,configurable: false};
const hiddenConstantPropDesc = {
    writable: false, enumerable: false, configurable: false
};

// Set o.p to v, but make the property read-only
function defineReadonlyProp(o,p,v) {
    hiddenPropDesc.value = v;
    defineProperty(o, p, readonlyPropDesc);
}

// Set o.p to v, but make the property non-enumerable
function defineHiddenProp(o,p,v) {
    hiddenPropDesc.value = v;
    defineProperty(o, p, hiddenPropDesc);
}

// Set o.p to v, and make it constant
function defineConstantProp(o,p,v) {
    constantPropDesc.value = v;
    defineProperty(o, p, constantPropDesc);
}

// Set o.p to v, and make it constant and non-enumerable
function defineHiddenConstantProp(o,p,v) {
    hiddenConstantPropDesc.value = v;
    defineProperty(o, p, hiddenConstantPropDesc);
}

//
// Define a property p of the object o whose value is the return value of f().
// But don't invoke f() until the property is actually used for the first time.
// The property will be writeable, enumerable and configurable.
// If the property is made read-only before it is used, then it will throw
// an exception when used.
// Based on Andreas's AddResolveHook function.
// 
function defineLazyProperty(o, p, f, hidden, readonly) {
    defineProperty(o, p, {
        get: function() {        // When the property is first retrieved
            let realval = f();   // compute its actual value
            defineProperty(o, p, // Store that value, keeping the other
                           { value: realval }); // attributes unchanged
            return realval;      // And return the computed value
        },
        set: readonly ? undefined : function(newval) {
            // If the property is writable and is set before being read,
            // just replace the value and f() will never be invoked
            defineProperty(o, p, { value: newval });
        },
        enumerable: !hidden,
        configurable: true
    });
}

// Anything I want to define lazily using defineLazyProperty above has to
// be a property of something; it can't just be a local variable.  So this
// DOM object is the holder for lazy properties.  It will be used for things
// like the internal versions of constructors: DOM.Element() etc.
let DOM = {};

// DOM.emptyNodeList will be an object that is an instanceof NodeList
// and is always empty. Note that it inherits its length and item properties
// from an intermediate prototype rather than defining them directly
defineLazyProperty(DOM, "emptyNodeList", function() {
    return create(
	create(DOM.NodeList.prototype, {
	    length: {
		value: 0, writable: false, enumerable: true, configurable:true
	    },
	    item: function() { return null; }
	}));
});

// The DOM has some nested type hierarchies and WebIDL has specific
// requirements about property attributes, etc.  This function defines
// a new DOM interface, returning a constructor function for internal
// use and also creating an interface object that will be exposed
// globally.
// 
// This function takes a single object as its argument and looks for
// the following properties of that object:
//
//    name         // The name of the interface
//    superclass   // The superclass constructor
//    init         // initialization function
//    constants    // constants defined by the interface
//    members      // interface attributes and methods
//
// This method returns a constructor object for creating objects that 
// implement the interface. It is an internal constructor.  The interface
// property of the constructor function refers to the public interface
// object that should be made available as a global property.
// 
function implementIDLInterface(o) {
    let constructor, prototype, interfaceObject;
    let name = o.name || "";
    let superclass = o.superclass;
    let init = o.init;
    let constants = o.constants || {};
    let members = o.members || {};

    // XXX Do we even need the initialization function?
    // And do we really need to chain the constructors?
    // If all the properties are on the impl object, then all
    // the initialization will be on the implementation constructors, right?

    // Set up the constructor function and the prototype object
    if (superclass) {                            // If there is a superclass
        constructor = function() {  
            superclass.apply(this, arguments);           // constructor chain
            if (init) {
                let result = init.apply(this, arguments);
                if (result !== undefined) return result;
            }
        };
        prototype = create(superclass.prototype); // special prototype
    }
    else {                                       // Otherwise
        constructor = function() {                       // simple constructor
            if (init) {
                let result = init.apply(this, arguments);
                // We need this return for NodeList
                if (result !== undefined) return result;
            }
        };
        prototype = {};                                  // and prototype.
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
    for(let c in constants) {
        let value = constants[c];
        defineConstantProp(prototype, c, value);
        defineConstantProp(interfaceObject, c, value);
    }

    // Now copy attributes and methods onto the prototype object.
    // Members should just be an ordinary object.  Attributes should be
    // defined with getters and setters. Methods should be regular properties.
    // This will mean that the members will all be enumerable, configurable
    // and writable (unless there is no setter) as they are supposed to be.
    for(let m in members) {
	// Get the property descriptor of the member
	let desc = getOwnPropertyDescriptor(members, m);

	// WebIDL says that the members of an interface are either attributes
	// which are implemented with accessor properties or methods which
	// are regular data properties with function values and all the
	// attributes set to true.
	// 
	// For efficiency, though, when an attribute has a constant value
	// we'll sometimes use a data attribute whose value is not a function.
	// In that case, make it read-only.
	//
	// XXX Is this too much of a hack?  It seems a little brittle.
	if (desc.writable &&                  // a writable value property
	    typeof desc.value !== "function") // that is not a function
	    desc.writable = false;

	// Now copy the property to the prototype object
        defineProperty(prototype, m, desc);
    }

    // Finally, return the constructor
    // Note that this method does not export the interface object to
    // the global object. The caller should get the interface object (from the
    // interface property of the constructor) and export it appropriately.
    return constructor;
}


// WebIDL requires value conversions in various places.

// Convert x to an unsigned long and return it
// WebIDL currently says to use ES toUInt32() but the spec
// indicates that this may change.
// 
// ES spec says: 
// 
// The abstract operation ToUint32 converts its argument to one of 232
// integer values in the range 0 through 232−1, inclusive. This
// abstraction operation functions as follows:
// 1. Let number be the result of calling ToNumber on the input argument.
// 2. If number is NaN, +0, −0, +∞, or −∞, return +0.
// 3. Let posInt be sign(number) * floor(abs(number)).
// 4. Let int32bit be posInt modulo 2^32; that is, a finite integer
//    value k of Number type with positive sign and less than 2^32 in
//    magnitude such that the mathematical difference of posInt and k is
//    mathematically an integer multiple of 2^32. 
// 5. Return int32bit.
// 
// This function is just an approximation for now, since WebIDL is pending.
//
function toULong(x) {
    nyi();
}
