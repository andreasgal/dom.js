// A factory function for HTMLCollection proxy objects.
// Expects an object with a length property and item() and namedItem() methods.
// That object must also have a namedItems property that returns an object
// that maps element names to some value.
// 
// XXX: bug I can't define an expando property if there is a named property
// with the same name. I think it is a bug in the Proxy itself.  Looks like
// define property is not even being called.
// 
function HTMLCollectionProxy(collection) {
    let handler = O.create(HTMLCollectionProxy.handler);
    handler.collection = collection;
    handler.localprops = O.create(null);
    return Proxy.create(handler, idl.HTMLCollection.prototype);
}

// This is the prototype object for the proxy handler object
HTMLCollectionProxy.handler = {
    isArrayIndex: function(name) { return String(toULong(name)) === name; },

    // This is the "named property visibility algorithm" from WebIDL
    isVisible: function(name) {
        // 1) If P is not a supported property name of O, then return false.
        if (!(name in this.collection.namedItems)) return false;

        // 2) If O implements an interface that has the
        // [OverrideBuiltins] extended attribute, then return true.
        // HTMLCollection does not OverrideBuiltins, so skip this step

        // 3) If O has an own property named P, then return false.
        if (hasOwnProperty(this.localprops, name)) return false;

        // 4) Let prototype be the value of the internal [[Prototype]]
        // property of O.
        // 5) If prototype is null, then return true.
        // 6) If the result of calling the [[HasProperty]] internal
        // method on prototype with property name P is true, then
        // return false.
        if (name in idl.HTMLCollection.prototype) return false;

        // 7) Return true.
        return true;
    },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        let item;
        if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            if (idx < this.collection.length) {
                return {
                    value: wrap(this.collection.item(idx), idl.Element),
                    writable: false,
                    enumerable: true,
                    configurable: true
                };
            }
        }

        if (this.isVisible(name)) {
            return {
                value: wrap(this.collection.namedItem(name), idl.Element),
                writable: false,
                enumerable: true,
                configurable: true
            };
        }

        return O.getOwnPropertyDescriptor(this.localprops, name);
    },

    getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(idl.HTMLCollection.prototype, name) ||
            O.getOwnPropertyDescriptor(Object.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },

    getOwnPropertyNames: function getOwnPropertyNames() {
        let names = [];
        for (let i = 0, n = this.collection.length; i < n; i++)
            push(names, String(i));
        for(let n in this.collection.namedItems) 
            push(names, n);
        return concat(r, O.getOwnPropertyNames(this.localprops));
    },

    defineProperty: function(name, desc) {
        console.log("DEFINE");

        // XXX
        // For now, we "Reject" by throwing TypeError.  Proxies may change
        // so we only have to return false.
        if (this.isArrayIndex(name)) 
            throw new TypeError(
                "can't set or create indexed properties '" + name + "'");

        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
    },

    delete: function(name) {
        // Can't delete array elements, but if they don't exist, don't complain
        if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            return idx >= this.collection.length;
        }

        // Can't delete named properties 
        if (this.isVisible(name)) {
            return false;
        }

        // Finally, try deleting an expando
        return delete this.localprops[name];
    },

    fix: function() {},

    // Get all enumerable properties
    // XXX: Remove this method when this bug is fixed:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
    enumerate: function() {
        let names = [];
        for (let i = 0, n = this.collection.length; i < n; i++)
            push(names, String(i));
        for(let n in this.collection.namedItems) 
            push(names, n);
        for(let name in this.localprops)
            push(names, name);
        for(let name in idl.HTMLCollection.prototype)
            push(names, name);
        return names;
    }
};
