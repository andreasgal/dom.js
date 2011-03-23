/*
 * Copyright 2011, Andreas Gal. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

(function(global) {
    // Take a snapshot of all API functions we might call. Some of the code
    // below might run after initialization, at which point user code might
    // have redirected them.
    var Object_prototype = Object.prototype;
    var Object_defineProperty = Object.defineProperty;
    var Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var Object_getPrototypeOf = Object.getPrototypeOf;
    var Object_keys = Object.keys;

    // Lookup the implementation object associated with an interface object.
    function $$(map, obj) {
	if (typeof obj == "object" && obj && (obj = map.get(obj)))
	    return obj;
	throw new DOMException(DOMException.NOT_FOUND_ERR);
    }

    // Make a data property.
    function DATA(v) {
	return { value: v, writable: true, configurable: true, enumerable: true };
    }

    // Make an accessor property (read-only).
    function GET(get) {
	return { get: get, configurable: true, enumerable: true };
    }

    // Make an accessor property (read-write).
    function GETSET(get, set) {
	return { get: get, set: set, configurable: true, enumerable: true };
    }

    function TurnUndefinedIntoNull(v) {
	if (typeof v == "undefined")
	    return null;
	return v;
    }

    // Most DOM constructors are useless when called directly. We keep them in
    // an internal list and install dummy constructors on the global object.
    var constructors = {};

    // Add a resolve hook for a DOM class. Many DOM classes are not used, and it
    // would needlessly slow down page loads to eagerly initialize all of them.
    // Instead we install a getter that will initialize the DOM class and then
    // replaces itself with a data property for fast subsequent accesses.
    function AddResolveHook(obj, name, hook) {
	function get() {
	    var constructor = hook();
	    try {
		Object_defineProperty(obj, name, constructor);
	    } catch (e) {};
	    return constructor;
	}
	function set(value) {
	    // The class is being overwritten without ever having been
	    // resolved. Just blow away the resolve hook.
	    try {
		Object_defineProperty(obj, name, value);
	    } catch (e) {};
	}

	Object_defineProperty(obj, name, GETSET(get, set));

	// If the resolve hook was set on the internal constructors object,
	// install a dummy constructor on the global object.
	if (obj == constructors) {
	    function dummy() {
		throw new DOMException(DOMException.WRONG_DOCUMENT_ERR);
	    }

	    dummy.prototype = Object_getPrototypeOf(hook);
	    Object_defineProperty(obj, name, DATA(dummy));
	}
    }

    AddResolveHook(global, "DOMException", function() {
	function DOMException(code) {
	    this.code = code;
	}

	// DOM Level 1
	DOMException.INDEX_SIZE_ERR                 = 1;
	DOMException.DOMSTRING_SIZE_ERR             = 2;
	DOMException.HIERARCHY_REQUEST_ERR          = 3;
	DOMException.WRONG_DOCUMENT_ERR             = 4;
	DOMException.INVALID_CHARACTER_ERR          = 5;
	DOMException.NO_DATA_ALLOWED_ERR            = 6;
	DOMException.NO_MODIFICATION_ALLOWED_ERR    = 7;
	DOMException.NOT_FOUND_ERR                  = 8;
	DOMException.NOT_SUPPORTED_ERR              = 9;
	DOMException.INUSE_ATTRIBUTE_ERR            = 10;

	// DOM Level 2
	DOMException.INVALID_STATE_ERR              = 11;
	DOMException.SYNTAX_ERR                     = 12;
	DOMException.INVALID_MODIFICATION_ERR       = 13;
	DOMException.NAMESPACE_ERR                  = 14;
	DOMException.INVALID_ACCESS_ERR             = 15;

	// DOM Level 3
	DOMException.VALIDATION_ERR                 = 16;
	DOMException.TYPE_MISMATCH_ERR              = 17;

	DOMException.prototype = {
	    toString: function() { return "[object DOMException]"; },
	}

	return DOMException;
    });

    AddResolveHook(global, "DOMStringList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function DOMStringList(strings) {
	    map.set(this, strings);
	}

	var funs = {
	    item: function(index) { return TurnUndefinedIntoNull($(this)[index]); },
	    contains: function(str) { return $(this).some(function(e) { return e == str; }); },
	    toString: function() { return "[object DOMStringList]"; }
	};
	var getters = {
	    length: function() { return $(this).length; }
	};
	var ownProps = {};
	for (var fun in funs)
	    ownProps[fun] = DATA(funs[fun]);
	for (var getter in getters)
	    ownProps[getter] = GET(getters[getter]);

	function getOwnPropertyDescriptor(name) {
	    var strings = $(this);
	    if (name >= 0 && name < strings.length)
		return GET(function () { return strings[name]; });
	    var desc = ownProps[name];
	    if (desc)
		return desc;
	}
	function getOwnPropertyNames() {
	    var strings = $(this);
	    var result = [];
	    for (var i = 0; i < strings.length; ++i)
		result.push("" + i);
	    return result.concat(Object_keys(ownProps));
	}
	function hasOwn(name) {
	    var strings = $(this);
	    return (name >= 0 && name < strings.length) ||
		(name in ownProps);
	}

	DOMStringList.prototype = Proxy.create({
	    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
	    getPropertyDescriptor: function(name) {
		return getOwnPropertyDescriptor.call(this, name) ||
		       Object_getOwnPropertyDescriptor(Object_prototype);
	    },
	    getOwnPropertyNames: getOwnPropertyNames,
	    defineProperty: function(name, desc) {},
	    delete: function(name) {},
	    fix: function() {},
	    hasOwn: hasOwn,
	    has: function(name) {
		return hasOwn.call(this, name) || (name in Object_prototype);
	    },
	    get: function(name) {
		var strings = $(this);
		if (name >= 0 && name < strings.length)
		    return strings[name];
		var getter = getters[name];
		if (getter)
		    return getter.call(this);
		var fun = funs[name];
		if (fun)
		    return fun;
		return Object_prototype[name];
	    },
	    set: function(name, value) {},
	    enumerate: getOwnPropertyNames,
	    keys: getOwnPropertyNames,
	    toString: function() { return "[object DOMStringList]"; }
	});

	return DOMStringList;
    });

    AddResolveHook(global, "NameList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function NameList(names, namespaces) {
	    map.set(this, { names: names, namespaces: namespaces });
	}

	NameList.prototype = ({
	    get length() {
		return $(this).names.length;
	    },
	    getName: function(index) {
		return TurnUndefinedIntoNull($(this).names[index]);
	    },
	    getNamespaceURI: function(index) {
		return TurnUndefinedIntoNull($(this).namespaces[index]);
	    },
	    contains: function(str) {
		return $(this).names.some(function(e) { return e == str; });
	    },
	    containsNS: function(namespace, name) {
		var impl = $(this);
		var names = impl.names;
		var namespaces = impl.namespaces;
		for (var i = 0; i < names.length; ++i) {
		    if (namespaces[i] == namespace && names[i] == name)
			return true;
		}
		return false;
	    },
	    toString: function() { return "[object NameList]"; }
	});

	return NameList;
    });
} (this));
