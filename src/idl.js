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

function toLong(x) {
    return x & 0xFFFFFFFF; // This should do ToInt32
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

function toCallback(x) {
    let t = typeof x;
    if (t === "function" || t === "object") return x;
    else throw TypeError("Expected callback; got: " + x);
}

function toCallbackOrNull(x) {
    return (x === null) ? null : toCallback(x);
}

// This constructor takes a single object as its argument and looks for
// the following properties of that object:
//
//    name         // The name of the interface
//    superclass   // The superclass constructor
//    proxyHandler // The proxy handler constructor, if one is needed
//    constants    // constants defined by the interface
//    members      // interface attributes and methods
//    constructor  // optional public constructor. 
//
// It returns a new object with the following properties:
//   publicInterface // The public interface to be placed in the global scope
//                   // The input constructor or a synthetic no-op one.
//   prototype       // The prototype object for the interface
//                   // Also available as publicInterface.prototype
//   factory         // A factory function for creating an instance
//
function IDLInterface(o) {
    let name = o.name || "";
    let superclass = o.superclass;
    let proxyFactory = o.proxyFactory;
    let constants = o.constants || {};
    let members = o.members || {};
    let prototype, interfaceObject;

    // Set up the prototype object
    prototype = superclass ? O.create(superclass.prototype) : {};

    if (hasOwnProperty(o, "constructor")) {
        interfaceObject = o.constructor;
    }
    else {
        // The interface object is supposed to work with instanceof, but is 
        // not supposed to be callable.  We can't conform to both requirements
        // so we make the interface object a function that throws when called.
        interfaceObject = function() { 
            throw new TypeError(name + " is not (supposed to be) a function");
        };
    }

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

    // Now set up the fields of this object
    this.prototype = prototype;
    this.publicInterface = interfaceObject;
    this.factory = proxyFactory
        ? proxyFactory
        : O.create.bind(Object, prototype, {});
}

