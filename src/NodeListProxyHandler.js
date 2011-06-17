function NodeListProxyHandler(list) {
    // This handler expects an object with a length property and an item() 
    // method.  If we pass it a plain array, it will add the item() method
    // 
    // We should avoid reading the length property of the list when possible
    // because in lazy implementsions such as impl/FilteredElementList, 
    // reading the length forces the filter to process the entire document
    // tree undoing the laziness.  
    if (isArray(list)) {
        if (!hasOwnProperty(list, "item"))
            list.item = function(n) { return list[n]; };
    }

    this.list = list;
    this.localprops = Object.create(idl.NodeList.prototype);
}

// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
NodeListProxyHandler.prototype = {
    isIndex: function(name) { return String(toULong(name)) === name; },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (this.isIndex(name)) {
            // If the index is greater than the length, then we'll just
            // get null or undefined here and do nothing. That is better
            // than testing length.
            let v = this.list.item(name);
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
            O.getOwnPropertyDescriptor(Object.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },
    getOwnPropertyNames: function getOwnPropertyNames() {
        let r = [];
        for (let i = 0, n = this.list.length; i < n; i++)
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
        if (this.isIndex(name)) 
            throw new TypeError(
                "can't set or create indexed properties '" + name + "'");

        O.defineProperty(this.localprops, name, desc);
    },
    delete: function(name) {
        // Can't delete index properties
        if (this.isIndex(name)) {
            // If an item exists at that index, return false: won't delete it
            // Otherwise, if no item, then the index was out of bounds and
            // we return true to indicate that the deletion was "successful"
            return !this.list.time(name);
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
        let r = [];
        for (let i = 0, n = this.list.length; i < n; i++)
            push(r, String(i));
        for(name in this.localprops) push(r, name);
        return r;
    }
};
