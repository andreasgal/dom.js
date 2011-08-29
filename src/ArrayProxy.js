// This is a factory function for Array proxy objects. 
//
// The function takes the idl type of the array elements as its first argument
// so we can create more specific factory functions with .bind().
//
// XXX: I used to use this for AttrArray, but that now has a custom proxy.
// This file is currently unused, but it is sure to come in handy eventually.
// 
function ArrayProxy(elementType, array) {
    let handler = O.create(ArrayProxy.handler);
    handler.elementType = elementType;  
    handler.array = array;
    handler.localprops = O.create(null);
    return Proxy.create(handler, Array.prototype);
}

ArrayProxy.handler = {
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
        for(let name in this.localprops) push(r, name);
        for(let name in Array.prototype) push(r, name);
        return r;
    }
}
