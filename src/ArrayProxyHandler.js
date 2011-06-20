// This class is a proxy handler for read-only WebIDL array types, like the 
// Element.attributes attribute, which has type Attr[]. See WebIDL §4.2.20.
// 
// The constructor takes the array to proxy, and also the IDL type of the
// array (so the prototype can be set appropriately) and the IDL type of the
// array elements, (so they can be wrapped appropriately).
// 
// We'll probably need to define a subtype or at least a custom factory method
// for each array type that we actually need to use.
// AttrArrayProxyHandler, for example.
// 
function ArrayProxyHandler(array, arrayType, elementType) {
    this.array = array;
    this.arrayType = arrayType;
    this.elementType = elementType;
    // The arrayType.prototype will inherit from Array.prototype
    this.localprops = O.create(arrayType.prototype)
}

ArrayProxyHandler.prototype = {
    isArrayIndex: function(name) { return String(toULong(name)) === name; },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (name === "length") {
            return {
                value: this.array.length,
                writable: false,
                enumerable: false,
                configurable: true
            };
        }
        else if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            if (idx >= this.array.length) return;  // Out of bounds

            return {
                value: wrap(this.array[idx], this.elementType),
                writable: false,
                enumerable: true,
                configurable: true
            };
        }
        else {
            // We'll ensure that the property is configurable when we
            // set it, so we don't have to check that here.
            return O.getOwnPropertyDescriptor(this.localprops, name);
        }
    },

    getPropertyDescriptor: function(name) {
        // If ES6 implements Object.getPropertyDescriptor() we can use
        // that here instead of this long chain.
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(this.arrayType.prototype, name) ||
            O.getOwnPropertyDescriptor(A.prototype, name) ||
            O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },

    getOwnPropertyNames: function getOwnPropertyNames() {
        let r = [];
        for (let i = 0, n = this.array.length; i < n; i++)
            push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
    },

    defineProperty: function(name, desc) {
        // XXX
        // For now, we "Reject" by throwing TypeError.  Proxies may change
        // so we only have to return false.
        if (this.isArrayIndex(name) || name === "length")
            throw new TypeError("read only array");

        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
    },

    delete: function(name) {
        // Can't delete the length property
        if (name === "length") return false;

        // Can't delete array elements, but if they don't exist, don't complain
        if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            return idx >= this.array.length;
        }
        // Finally, try deleting an expando
        return delete this.localprops[name];
    },

    // WebIDL: Array host objects defy being fixed; if Object.freeze,
    // Object.seal or Object.preventExtensions is called on one, the
    // function MUST throw a TypeError.
    fix: function() {},

    // Get all enumerable properties
    // XXX: Remove this method when this bug is fixed:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
    enumerate: function() {
        let r = [];
        for (let i = 0, n = this.array.length; i < n; i++)
            push(r, String(i));
        for(name in this.localprops) push(r, name);
        return r;
    }
}