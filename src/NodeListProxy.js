// A factory function for NodeList proxy objects
function NodeListProxy(list) {
    // This function expects an object with a length property and an item()
    // method.  If we pass it a plain array, it will add the item() method
    //
    // We should avoid reading the length property of the list when possible
    // because in lazy implementations such as impl/FilteredElementList,
    // reading the length forces the filter to process the entire document
    // tree undoing the laziness.
    if (isArray(list)) {
        if (!hasOwnProperty(list, "item"))
            list.item = function(n) { return list[n]; };
    }

    var handler = O.create(NodeListProxy.handler);
    handler.list = list;
    handler.localprops = O.create(null);
    var p = Proxy.create(handler, idl.NodeList.prototype);

    return p;
}

// This is the prototype object for the proxy handler object
//
// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
NodeListProxy.handler = {
    isArrayIndex: function(name) { return String(toULong(name)) === name; },

    // try adding this to make Node proxies work right
    // Need to work around the "illegal access" error
/*
    get: function(receiver, name) {

        if (this.isArrayIndex(name)) {
            return this.list.item(name);
        }
        else if (name in this.localprops) {
            return this.localprops[name];
        }
        else {
            return idl.NodeList.prototype[name]
        }
    },
*/
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (this.isArrayIndex(name)) {
            // If the index is greater than the length, then we'll just
            // get null or undefined here and do nothing. That is better
            // than testing length.
            var v = this.list.item(name);
            if (v) {
                return {
                    value: wrap(v, idl.Node),
                    writable: false,
                    enumerable: true,
                    configurable: true
                };
            }
            else {
                // We're never going to allow array index properties to be
                // set on localprops, so we don't have to do the test
                // below and can just return nothing now.
                return;
            }
        }
        return O.getOwnPropertyDescriptor(this.localprops, name);
    },
    getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(idl.NodeList.prototype, name) ||
            O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },
    getOwnPropertyNames: function getOwnPropertyNames() {
        var r = [];
        for (var i = 0, n = this.list.length; i < n; i++)
            push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
    },
    defineProperty: function(name, desc) {
        // XXX
        // The WebIDL algorithm says we should "Reject" these attempts by
        // throwing or returning false, depending on the Throw argument, which
        // is usually strict-mode dependent.  While this is being clarified
        // I'll just throw here.  May need to change this to return false
        // instead.
        if (this.isArrayIndex(name))
            throw new TypeError(
                "can't set or create indexed properties '" + name + "'");

        O.defineProperty(this.localprops, name, desc);
    },
    delete: function(name) {
        // Can't delete index properties
        if (this.isArrayIndex(name)) {
            // If an item exists at that index, return false: won't delete it
            // Otherwise, if no item, then the index was out of bounds and
            // we return true to indicate that the deletion was "successful"
            return !this.list.item(name);
        }
        return delete this.localprops[name];
    },

    // WebIDL: Host objects implementing an interface that supporst
    // indexed or named properties defy being fixed; if Object.freeze,
    // Object.seal or Object.preventExtensions is called on one, these
    // the function MUST throw a TypeError.
    //
    // Proxy proposal: When handler.fix() returns undefined, the
    // corresponding call to Object.freeze, Object.seal, or
    // Object.preventExtensions will throw a TypeError.
    fix: function() {},

    // Get all enumerable properties
    // XXX: Remove this method when this bug is fixed:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
    enumerate: function() {
        var r = [];
        for (var i = 0, n = this.list.length; i < n; i++)
            push(r, String(i));
        for(var name in this.localprops) push(r, name);
        for(var name in idl.NodeList.prototype) push(r, name);
        return r;
    }
};
