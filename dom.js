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

(function() {
    // Take a snapshot of all API functions we might call. Some of the code
    // below might run after initialization, at which point user code might
    // have redirected them.
    var Object_prototype = Object.prototype;
    var Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var Object_keys = Object.keys;

    // Lookup the implementation object associated with an interface object.
    function $$(map, obj) {
	function IsObject(v) {
	    return v && typeof v == "object";
	}

	if (IsObject(obj) && IsObject(obj = map.get(obj)))
	    return obj;

	throw new DOMException(DOMException.NOT_FOUND_ERR);
    }

    // Make a data property
    function DATA(v) {
	return { value: v, writable: true, configurable: true, enumerable: true };
    }

    // Make an accessor property (read-only)
    function GET(get) {
	return { get: get, configurable: true, enumerable: true };
    }

    // DOMException
    (function() {
	DOMException = function(code) {
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
    } ());

    // DOMStringList
    (function() {
	var DOMStringListMap = new WeakMap();

	function $(obj) {
	    return $$(DOMStringListMap, obj);
	}

	DOMStringList = function(strings) {
	    DOMStringListMap.set(this, strings);
	}

	var funs = {
	    item: function(index) { return $(this)[index]; },
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
	    keys: getOwnPropertyNames
	});
    } ());
} ());
