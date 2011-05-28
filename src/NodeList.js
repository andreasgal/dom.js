// This NodeList implementation is array-based.
// Eventually, we may need to support other implementations such as
// lazy node lists that don't go and search the tree until they are
// actually indexed.  We have to make all implementations share the same
// prototype, though, so we'll have to squeeze all implementations into
// this framework.

defineLazyProperty(global, "NodeList", function() {
    return DOM.NodeList.interface;
}, true);

defineLazyProperty(DOM, "NodeList", function() {
    // This maps the localprops object internal to ArrayNodeList() to
    // the corresponding array.  Strangely, we don't map the proxy
    // object itself to the array because when we need to use the map,
    // we're the length getter function which was retrieved through
    // the localprops object.  For the getter, the value of this is
    // the localprops, not the proxy object.
    const nodeListToArrayMap = new WeakMap();

    // Return a NodeList object based on the array a
    // It is passed as the constructor property to implementIDLInterface below
    function ArrayNodeList(a) {
	// NodeList objects must be extensible. If properties are
	// added, they're stored in this object.
	let localprops = O.create(NodeList.prototype);

	// If the specified property name is an integer index, and is in
	// the correct range for our array, then return that property name
	// as an integer.  Otherwise, return null.
	function index(name) {
	    let n = Number(name), i = Math.round(n);
	    if (i === n && i >= 0 && i < a.length) return i;
	    return null;
	}

	function hasOwn(name) {
	    return index(name) !== null || hasOwnProperty(localprops, name);
	}

	function getOwnPropDesc(name) {
	    let idx = index(name);
	    if (idx !== null) {
		return {
		    get: function() { return a[name]; },
		    enumerable: true,
		    configurable: true // Proxies require configurable props
		};
	    }
	    else return O.getOwnPropertyDescriptor(localprops, name);
	}

	let proxy = Proxy.create({
	    getOwnPropertyDescriptor: getOwnPropDesc,
	    getPropertyDescriptor: function(name) {
		var desc = call(getOwnPropDesc, this, name) ||
		    O.getOwnPropertyDescriptor(NodeList.prototype, name) ||
		    O.getOwnPropertyDescriptor(Object.prototype, name);
		if (desc) desc.configurable = true; // Proxies require this
		return desc;
	    },
	    getOwnPropertyNames: function getOwnPropertyNames() {
		let r = [];
		for (let i = 0; i < a.length; ++i) push(r, String(i));
		return concat(r, O.getOwnPropertyNames(localprops));
	    },
	    defineProperty: function(name, desc) {
		// XXX Perhaps this should throw for any integer property name
		// Not just those that are in-bounds currently.
		if (index(name) !== null) 
		    throw new TypeError(
			"can't redefine an indexed property '" +
			    name + "'");

		// If the property does not already exist and is not 
		// configurable, then throw, since proxies don't allow
		// non-configurable properties
		if (!localprops[name] && !desc.configurable)
		    throw new TypeError(
			"can't define a non-configurable property " + name);

		if (!desc.configurable)
		O.defineProperty(localprops, name, desc);
	    },
	    delete: function(name) {
		// Can't delete index properties
		if (index(name) !== null) return false;
		return delete localprops[name];
	    },

	    // By definition, NodeLists are live, so we can't really
	    // allow them to be fixed...
	    // 
	    // XXX: But WebIDL section 4.5.2 says what to do if the
	    // NodeList is non-extensible, so perhaps I do need to
	    // implement this method.
	    // Emailed public-script-coord about this issue.
	    fix: function() { },

	    hasOwn: hasOwn,

	    has: function(name) {
		return call(hasOwn, this, name) || (name in localprops);
	    },

	    get: function(receiver, name) {
		let idx = index(name);
		if (idx !== null) return wrap(a[idx]);
		return localprops[name];
	    },

	    set: function(receiver, name, value) {
		// Don't allow indexed properties to be set
		if (index(name) !== null) return false;

		// Set any expando properties on the localprops object
		localprops[name] = value;
		return true;   // success
	    },

	    // Get all enumerable properties
	    enumerate: function() {
		let r = [];
		for (let i = 0; i < a.length; ++i) push(r, String(i));
		for(name in localprops) push(r, name);
		return r;
	    },

	    // Get own properties that are also enumerable
	    keys: function() {
		let r = [];
		for (let i = 0; i < a.length; ++i) push(r, String(i));
		for(name in localprops) {
		    if (hasOwnProperty(localprops,  name)) push(r, name);
		}
		return r;
	    },
	}, NodeList.prototype);


	// Map both the proxy object and the localprops object to the array.
	// We have to do both because the NodeList.prototype.item method
	// is invoked with its this value set to the proxy object, but the
	// NodeList.prototype.length getter function is invoked on the
	// localprops object instead.
	wmset(nodeListToArrayMap, proxy, a);
	wmset(nodeListToArrayMap, localprops, a);

	return proxy;
    }

    return implementIDLInterface({
	name: "NodeList",
	init: ArrayNodeList, 
	members: {
	    // WebIDL mandates that this be a getter attribute, here
	    // on this prototype. We can't implement it in the proxy
	    // along with the array index properties, even though that
	    // would be must simpler.
	    get length() {
		return wmget(nodeListToArrayMap, this).length;
	    },
	    // WebIDL also mandates that this method be here.  
	    item: function(index) {
		/*
		 * This function can do this[index] to get the item
		 * without having to do the WeakMap lookup. But then
		 * simulating array bounds checking is required.  I
		 * don't know which would be more efficient: going
		 * through the proxy again or going through the weak
		 * map. For simplicity, we just go through the weak map.
		 */
		let r = wmget(nodeListToArrayMap, this)[index];
		if (r === undefined) return null;
		return wrap(r);
	    }
	}
    });
});
