// This file defines the global NodeList object and the idl.NodeList()
// constructor. That constructor expects an object that is an array
// or that has a length property and item() method.  

defineLazyProperty(global, "NodeList", function() {
    return idl.NodeList.publicInterface;
}, true);

defineLazyProperty(idl, "NodeList", function() {
    function NodeListProxyHandler(list) {
        this.list = list;
        this.localprops = Object.create(NodeList.prototype);
    }

    NodeListProxyHandler.prototype = {
        isIndex: function(name) {
            let idx = toULong(name);
            return String(idx) === name && idx < this.list.length;
        },

        getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
            if (this.isIndex(name)) {
                let self = this;
                return {
                    get: function() { return wrap(self.list.item(name)); },
                    enumerable: true,
                    configurable: true // Proxies require configurable props
                };
            }
            else {
                let desc = O.getOwnPropertyDescriptor(this.localprops, name);
                if (desc) desc.configurable = true; // Proxies require this
                return desc;
            }
        },
        getPropertyDescriptor: function(name) {
            var desc = this.getOwnPropertyDescriptor(name) ||
                O.getOwnPropertyDescriptor(NodeList.prototype, name) ||
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
            // XXX Perhaps this should throw for any integer property name
            // Not just those that are in-bounds currently.
            if (this.isIndex(name)) 
                throw new TypeError(
                    "can't redefine an indexed property '" +
                        name + "'");

            O.defineProperty(this.localprops, name, desc);
        },
        delete: function(name) {
            // Can't delete index properties
            if (this.isIndex(name)) return false;
            return delete this.localprops[name];
        },

        // By definition, NodeLists are live, so we can't really
        // allow them to be fixed...
        // 
        // XXX: But WebIDL section 4.5.2 says what to do if the
        // NodeList is non-extensible, so perhaps I do need to
        // implement this method.
        // Emailed public-script-coord about this issue.
        fix: function() { },

        hasOwn: function hasOwn(name) {
            return this.isIndex(name) || hasOwnProperty(this.localprops, name);
        },

        has: function(name) {
            return this.hasOwn(name) || (name in this.localprops);
        },

        get: function(receiver, name) {
            if (this.isIndex(name))
                return wrap(this.list.item(name));
            else {
                // I can't just return this.localprops[name] because when
                // accessing the length property, this returns the getter
                // function defined below (and WebIDL mandates that length
                // must be a getter) and then invokes that getter on the 
                // localprops object rather than on the proxy object, so the
                // call to unwrap(this) in the getter fails.  Therefore
                // I have to implement property getting explicitly through
                // the property descriptor.  
                //
                // XXX: the length property of a NodeList is probably frequently
                // accessed, so this might be a bottleneck.
                let d = 
                    O.getOwnPropertyDescriptor(this.localprops, name) ||
                    O.getOwnPropertyDescriptor(NodeList.prototype, name) ||
                    O.getOwnPropertyDescriptor(Object.prototype, name);
                if (!d) return;
                if (d.value) return d.value;
                else return d.get.call(receiver);
            }
        },

        set: function(receiver, name, value) {
            // Don't allow indexed properties to be set
            if (this.isIndex(name)) return false;

            // Set any expando properties on the localprops object
            this.localprops[name] = value;
            return true;   // success
        },

        // Get all enumerable properties
        enumerate: function() {
            let r = [];
            for (let i = 0, n = this.list.length; i < n; i++)
                push(r, String(i));
            for(name in this.localprops) push(r, name);
            return r;
        },

        // Get own properties that are also enumerable
        keys: function() {
            let r = [];
            for (let i = 0, n = this.list.length; i < n; i++)
                push(r, String(i));
            for(name in this.localprops) {
                if (hasOwnProperty(this.localprops,  name)) push(r, name);
            }
            return r;
        }
    };

    return implementIDLInterface({
        name: "NodeList",
        init: function(list) {
            // If the list is a plain array, give it an item() method
            if (isArray(list)) list.item = function(n) { return this[n]; }
            return Proxy.create(new NodeListProxyHandler(list),
                                NodeList.prototype);
        },
        members: {
            // WebIDL mandates that this be a getter attribute, here
            // on this prototype. We can't implement it in the proxy
            // along with the array index properties, even though that
            // would be must simpler.
            get length() {
                return unwrap(this).length;
            },
            // WebIDL also mandates that this method be here.  
            item: function(index) {
                return wrap(unwrap(this).item(index));
            }
        }
    });
});
