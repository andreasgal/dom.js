function NodeListProxyHandler(list) {
    // This handler expects an object with a length property and an item() 
    // method.  If we pass it a plain array, it will add the item() method
    if (isArray(list)) {
        if (!hasOwnProperty(list, "item"))
            list.item = function(n) { return list[n]; };
    }

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
        // WebIDL seems to be moving toward forbidding the definition of
        // any indexed property, whether or not it is currently in bounds.
        if (this.isIndex(name)) 
            throw new TypeError(
                "can't redefine an indexed property '" + name + "'");

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
        if (this.isIndex(name)) {
            return wrap(this.list.item(name), idl.Node);
        }
        else {
            // I can't just return this.localprops[name] because when
            // accessing the length property, this returns the length getter
            // function from idl.NodeList.prototype (WebIDL mandates that length
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
