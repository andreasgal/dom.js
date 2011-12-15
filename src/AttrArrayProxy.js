// XXX
// This class is mostly the same as ArrayProxy, but it uses the item() method
// of the Attributes object instead of directly indexing an array.  Maybe
// it could be merged into a more general Array-like Proxy type.
//

// A factory function for AttrArray proxy objects
function AttrArrayProxy(attributes) {
    // This function expects an AttributesArray object (see impl/Element.js)
    // Note, though that that object just has an element property that points
    // back to the Element object.  This proxy is based on the element object.
    var handler = O.create(AttrArrayProxy.handler);
    handler.element = attributes.element;
    handler.localprops = O.create(null);
    return Proxy.create(handler, Array.prototype);
}

// This is the prototype object for the proxy handler object
//
// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
AttrArrayProxy.handler = {
    isArrayIndex: function(name) { return String(toULong(name)) === name; },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (name === "length") {
            return {
                value: this.element._numattrs,
                writable: false,
                enumerable: false,
                configurable: true
            };
        }
        if (this.isArrayIndex(name)) {
            if (name < this.element._numattrs) {
                var v = this.element._attr(name);
                if (v) {
                    return {
                        value: wrap(v),
                        writable: false,
                        enumerable: true,
                        configurable: true
                    };
                }
            }
        }
        else {
            return O.getOwnPropertyDescriptor(this.localprops, name);
        }
    },
    getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(A.prototype, name) ||
            O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },
    getOwnPropertyNames: function getOwnPropertyNames() {
        var r = ["length"];
        for (var i = 0, n = this.element._numattrs; i < n; i++)
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
        if (this.isArrayIndex(name) || name === "length")
            throw TypeError("read-only array");
        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
    },
    delete: function(name) {
        // Can't delete the length property
        if (name === "length") return false;

        // Can't delete index properties
        if (this.isArrayIndex(name)) {
            // If an item exists at that index, return false: won't delete it
            // Otherwise, if no item, then the index was out of bounds and
            // we return true to indicate that the deletion was "successful"
            var idx = toULong(name);
            return idx >= this.element._numattrs;
        }
        return delete this.localprops[name];
    },

    // WebIDL: Host objects implementing an interface that supports
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
        for (var i = 0, n = this.element._numattrs; i < n; i++)
            push(r, String(i));
        for(var name in this.localprops) push(r, name);
        for(var name in Array.prototype) push(r, name);
        return r;
    }
};
