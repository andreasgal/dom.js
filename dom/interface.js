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
    // 
    // While we're at it, we also copy the original version of each member
    // into the constructor.members object so we can access the original
    // version of the member even if it has been patched by scripts.
    constructor.members = {}
    for(let m in members) {
	// Get the property descriptor of the member
	let desc = O.getOwnPropertyDescriptor(members, m);

	// Now copy the property to the prototype object
        O.defineProperty(prototype, m, desc);

	// And to the constructor.members object
	O.defineProperty(constructor.members, m, desc);
    }

    // If the interface does not already define a toString method, add one.
    // This will help to make debugging easier.
    // XXX: I'm not sure if this is legal according to WebIDL and DOM Core.
    if (!hasOwnProperty(members, "toString")) {
	prototype.toString = function() { return "[object " + name + "]"; };
    }

    // Finally, return the constructor
    // Note that this method does not export the interface object to
    // the global object. The caller should get the interface object (from the
    // interface property of the constructor) and export it appropriately.
    return constructor;
}
