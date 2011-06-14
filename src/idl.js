// This file defines functions for satisfying the requirements of WebIDL
// See also ../tools/idl2domjs

// WebIDL requires value conversions in various places.

// Convert x to an unsigned long and return it
// WebIDL currently says to use ES ToUint32() unless there is a [Clamp]
// attribute on the operation.  We can invoke the ToUint32 operation 
// with the >>> operator.
//
function toULong(x) {
    return x >>> 0;  // The >>> operator does ToUint32
}

function undef2null(x) { return x === undefined ? null : x; }

// Convert x to a string as with the String() conversion function.
// But if x is null, return the empty string insead of "null".
// If a WebIDL method argument is just DOMString, convert with String()
// But if it is [TreatNullAs=EmptyString] DOMString then use this function.
function StringOrEmpty(x) {
    return (x === null) ? "" : String(x);
}

function StringOrNull(x) {
    return (x === null) ? null : String(x);
}

function OptionalBoolean(x) {
    return (x === undefined) ? undefined : Boolean(x);
}

function OptionalObject(x) {
    return (x === undefined) ? undefined : Object(x);
}


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
// This function returns a constructor object for creating objects that 
// implement the interface. It is an internal constructor.  The interface
// property of the constructor function refers to the public interface
// object that should be made available as a global property.
// 
// XXX
// These public objects are not allowed to define any properties, so they
// don't have any initialization to do, and the idea of creating a 
// constructor for them in idl.Node or whatever is silly.  Maybe a factory
// function instead. Also, the only place that the constructor or factory
// is ever supposed to be called is in the wrap() function. So maybe just
// just Object.create(idl.Node.prototype) or something instead of 
// new idl.Node() or idl.Node().
// 
// The exception is for NodeLists and other objects that require proxies.
// Those have to be created with Proxy.create:
// Proxy.create(new idl.NodeList.proxyHandler(impl), idl.NodeList.prototype)
// 
// We can automatically generate calls to implementIDLInterface from idl
// source code.  But the proxy handlers will be hand-coded.  Any IDL interface
// with a getter (or setter, deleter, etc.) will have a proxy handler
// 
// 
// 
// 
function implementIDLInterface(o) {
    let name = o.name || "";
    let superclass = o.superclass;
    let constructor = o.init || function() {};
    let constants = o.constants || {};
    let members = o.members || {};
    let prototype, interfaceObject;

    // Set up the prototype object
    prototype = superclass ? O.create(superclass.prototype) : {};

    // The interface object is supposed to work with instanceof, but is 
    // not supposed to be callable.  We can't conform to both requirements
    // so we make the interface object a function that throws when called.
    interfaceObject = function() { 
        throw new TypeError(name + " is not (supposed to be) a function");
    };

    // Retain references to the prototype and interface objects for internal use
    constructor.prototype = prototype;
    constructor.publicInterface = interfaceObject

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
        let desc = O.getOwnPropertyDescriptor(members, m);

        // Now copy the property to the prototype object
        O.defineProperty(prototype, m, desc);
    }

    // If the interface does not already define a toString method, add one.
    // This will help to make debugging easier.
    // 
    // XXX: I'm not sure if this is legal according to WebIDL and DOM Core.
    // XXX Maybe I could move it down to an object on the prototype chain
    // above Object.prototype.  But then I'd need some way to determine
    // the type name.  Maybe the name of the public "constructor" function?
    // But then I'd have to create that function with eval, I think.
    if (!hasOwnProperty(members, "toString")) {
        prototype.toString = function() { return "[object " + name + "]"; };
    }

    // Finally, return the constructor
    // Note that this method does not export the interface object to
    // the global object. The caller should get the interface object (from the
    // interface property of the constructor) and export it appropriately.
    return constructor;
}
