// The IDL interface object: can't actually construct lists with this
function NodeList() {
    throw new TypeError("NodeList is not (supposed to be) a function");
}

// This maps the localprops object internal to ArrayNodeList() to the 
// corresponding array.  Strangely, we don't map the proxy object itself to the
// array because when we need to use the map, we're the length getter function
// which was retrieved through the localprops object.  For the getter, the
// value of this is the localprops, not the proxy object.
const nodeListToArrayMap = new WeakMap();

// All node list objects must have this as their __proto__.
NodeList.prototype = {
    // WebIDL mandates that this be a getter attribute, here on this
    // prototype. We can't implement it in the proxy along with the array
    // index properties, even though that would be must simpler.
    get length() {
        return wmget(nodeListToArraymap, this).length;
    },
    // WebIDL also mandates that this method be here.  
    item: function(index) {
        /*
         * This function can do this[index] to get the item without
         * having to do the WeakMap lookup. But then simulating array
         * bounds checking is required.  I don't know which would be
         * more efficient: going through the proxy again or going
         * through the weak map. For simplicity, we just go through
         * the weak map
         */
        let r = wmget(nodeListToArrayMap, this)[index];
	if (r === undefined) return null;
	return r;
    }
};


// Return a NodeList object based on the array a
// This is a factory method, not a constructor
function ArrayNodeList(a) {
    // NodeList objects must be extensible. If properties are added, they're
    // stored in this object.
    let localprops = O.create(NodeList.prototype);

    // Map this local object to the array for the benefit of the 
    // NodeList.prototype.length getter function.  Surprisingly, that getter
    // is called on the localprops object instead of on the proxy object
    wmset(nodeListToArrayMap, localprops, a);

    // If the specified property name is an integer index, and is in
    // the correct range for our array, then return that property name
    // as an integer.  Otherwise, return null.
    function index(name) {
	let n = Number(name), i = round(n);
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
		configurable: false
	    };
	}
	else return O.getOwnPropertyDescriptor(localprops, name);
    }

    return Proxy.create({
	getOwnPropertyDescriptor: getOwnPropDesc,
	getPropertyDescriptor: function(name) {
	    return call(getOwnPropDesc, this, name) ||
		O.getOwnPropertyDescriptor(NodeList.prototype) ||
		O.getOwnPropertyDescriptor(Object.prototype);
	},
	getOwnPropertyNames: function getOwnPropertyNames() {
	    let r = [];
	    for (let i = 0; i < a.length; ++i) push(r, String(i));
	    return A.concat(r, O.getOwnPropertyNames(localprops));
	},
	defineProperty: function(name, desc) {
	    O.defineProperty(localprops, name, desc);
	},
	delete: function(name) {
	    return delete localprops[name];
	},

	// By definition, NodeLists are live, so we can't allow them to be fixed
	fix: function() {},

	hasOwn: hasOwn,

	has: function(name) {
	    return call(hasOwn, this, name) || (name in localprops);
	},

	get: function(receiver, name) {
	    if (name >= 0 && name < a.length) return a[name];
	    return localprops[name];
	},

	set: function(receiver,name, value) {
	    localprops[name] = value;
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
		if (O.hasOwnProperty(name)) push(r, name);
	    }
	    return r;
	},
    }, NodeList.prototype);
}
