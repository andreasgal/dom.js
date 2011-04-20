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
    var Object_freeze = Object.freeze;
    var Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var Object_keys = Object.keys;

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

    // In contrast to all other constructors, we permit DOMExceptions to be
    // constructed manually.
    global.DOMException = DOMException;

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

    function IsNull(v) {
	return (typeof v == "undefined") && !v;
    }

    // Most DOM constructors are useless when called directly. We keep them in
    // an internal list and install dummy constructors on the global object.
    var constructors = {};

    // Add a resolve hook for a DOM class. Many DOM classes are not used, and it
    // would needlessly slow down page loads to eagerly initialize all of them.
    // Instead we install a getter that will initialize the DOM class and then
    // replaces itself with a data property for fast subsequent accesses.
    function AddResolveHook(name, hook) {
	// All resolve hooks are created on 'constructors', except for the
	// DOMImplementationRegistry object.
	var obj = (name == "DOMImplementationRegistry") ? global : constructors;

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

	if (obj == constructors) {
	    // For each constructor, define a dummy constructor on the global
	    // object. WebIDL says this is an object, but then allows it to be used
	    // on the RHS of instanceof. We make it a function instead, and throw
	    // if it is called.
	    function dummy() {
		throw new DOMException(DOMException.WRONG_DOCUMENT_ERR);
	    }

	    // If any properties were defined on the constructor, copy them
	    // onto the dummy constructor as well.
	    for (i in hook)
		dummy[i] = hook[i];

	    Object_defineProperty(global, name, DATA(dummy));
	}
    }

    function MakeArrayLikeObject(items) {
	function getOwnPropertyDescriptor(name) {
	    if (name >= 0 && name < items.length)
		return GET(function () { return items[name]; });
	}

	function getOwnPropertyNames() {
	    var result = [];
	    for (var i = 0; i < items.length; ++i)
		result.push("" + i);
	    return result;
	}

	function hasOwn(name) {
	    return name >= 0 && name < items.length;
	}

	return Proxy.create({
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
		if (name >= 0 && name < items.length)
		    return items[name];
		return Object_prototype[name];
	    },
	    set: function(name, value) {},
	    enumerate: getOwnPropertyNames,
	    keys: getOwnPropertyNames
	});
    }

    AddResolveHook("DOMStringList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function DOMStringList(items) {
	    var obj = MakeArrayLikeObject(items);
	    map.set(obj, items);
	    return obj;
	}

	DOMStringList.prototype = {
	    get length() {
		return $(this).length;
	    },
	    item: function(index) {
		return TurnUndefinedIntoNull($(this)[index]);
	    },
	    contains: function(str) {
		return $(this).some(function(e) {
			                return e == str;
		                    });
	    },
	    toString: function() {
		return "[object DOMStringList]";
	    }
	}

	return DOMStringList;
    });

    AddResolveHook("NameList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function NameList(names, namespaces) {
	    map.set(this, { names: names, namespaces: namespaces });
	}

	NameList.prototype = {
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
	    toString: function() {
		return "[object NameList]";
	    }
	};

	return NameList;
    });

    AddResolveHook("DOMImplementationList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function DOMImplementationList(items) {
	    var obj = MakeArrayLikeObject(items);
	    map.set(obj, items);
	    return obj;
	}

	DOMImplementationList.prototype = {
	    get length() {
		return $(this).length;
	    },
	    item: function(index) {
		return TurnUndefinedIntoNull($(this)[index]);
	    },
	};

	return DOMStringList;
    });

    AddResolveHook("DOMImplementationSource", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function DOMImplementationSource(implementations) {
	    map.set(this, implementations);
	}

	function ParseFeatures(string) {
	    var array = [];
	    for (s in string.split(" ")) {
		var version = Number(s);
		if (isNaN(version)) {
		    if (array.length > 0)
			array[array.length - 1].version += version;
		} else {
		    array.push({ feature: s, version: "" });
		}
	    }
	    return array;
	}

	function MatchFeatures(parsed, implementation) {
	    for (var p in parsed) {
		if (!i.hasFeature(p.feature, p.version))
		    return false;
	    }
	    return true;
	}

	DOMImplementationSource.prototype = {
	    getDOMImplementation: function(features) {
		var parsed = ParseFeatures(features);
		for (var i in $(this)) {
		    if (MatchFeatures(parsed, i))
			return i;
		}
		return null;
	    },
	    getDOMImplementationList: function(feature) {
		var array = [];
		var parsed = ParseFeatures(features);
		for (var i in $(this)) {
		    if (MatchFeatures(parsed, i))
			array.push(i);
		}
		return new constructors.DOMImplementationList(array);
	    }
	};

	return DOMImplementationSource;
    });

    AddResolveHook("DOMImplementation", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function DOMImplementation(impl) {
	    map.set(this, impl);
	}

	DOMImplementation.prototype = {
	    hasFeature: function(feature, version) {
		return impl.hasFeature(feature, version);
	    },
	    createDocumentType: function(qualifiedName, publicId, systemId) {
		return impl.createDocumentType(qualifiedName, publicId, systemId);
	    },
	    createDocument: function(namespaceURI, qualifiedName, doctype) {
		return impl.createDocument(namespaceURI, qualifiedName, doctype);
	    },
	    getFeature: function(feature, version) {
		return impl.getFeature(feature, version);
	    }
	};

	return DOMImplementation;
    });

    // We populate this below.
    var DOMImplementationSources = [];

    AddResolveHook("DOMImplementationRegistry", function() {
	return {
	    getDOMImplementation: function(features) {
		for (var s in DOMImplementationSources) {
		    var i = s.getDOMImplementation(features);
		    if (i != null)
			return i;
		}
		return null;
	    },
	    getDOMImplementationList: function(feature) {
		var array = [];
		for (var s in DOMImplementationSources) {
		    var list = s.getDOMImplementationList(features);
		    for (var n = 0; n < list.length; ++n)
			array.push(list[n]);
		}
		return new constructors.DOMImplementationList(array);
	    }
	};
    });

    AddResolveHook("NodeList", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function NodeList(items) {
	    var obj = MakeArrayLikeObject(items);
	    map.set(obj, items);
	    return obj;
	}

	NodeList.prototype = {
	    get length() {
		return $(this).length;
	    },
	    item: function(index) {
		return TurnUndefinedIntoNull($(this)[index]);
	    }
	};

	return NodeList;
    });

    AddResolveHook("Node", function() {
	var map = new WeakMap();

	function $(obj) {
	    return $$(map, obj);
	}

	function search(array, element) {
	    for (var i = 0; i < array.length; ++i)
		if (array[i] == element)
		    return i;
	    return -1;
	}

	// Return the previous or next sibling of a node by looking into the
	// parent's childNodes. The index of the current node within childNodes
	// is cached in the node, and is verified (and updated, if necessary).
	function sibling(node, step) {
	    var impl = $(node);
	    var parent = impl.parent;
	    if (parent) {
		var parentImpl = $(parent);
		var childNodes = parentImpl.childNodes;
		if (childNodes) {
		    var index = impl.cachedChildIndex;
		    if (childNodes[index] != this)
			index = impl.cachedChildIndex = search(childNodes, this);
		    index += step;
		    if (index >= 0 && index < childNodes.length)
			return childNodes[index];
		}
	    }
	    return null;
	}

	function Node(impl) {
	    map.set(this, impl);
	}

	Node.ELEMENT_NODE                = 1;
	Node.ATTRIBUTE_NODE              = 2;
	Node.TEXT_NODE                   = 3;
	Node.CDATA_SECTION_NODE          = 4;
	Node.ENTITY_REFERENCE_NODE       = 5;
	Node.ENTITY_NODE                 = 6;
	Node.PROCESSING_INSTRUCTION_NODE = 7;
	Node.COMMENT_NODE                = 8;
	Node.DOCUMENT_NODE               = 9;
	Node.DOCUMENT_TYPE_NODE          = 10;
	Node.DOCUMENT_FRAGMENT_NODE      = 11;
	Node.NOTATION_NODE               = 12;
	Node.NAMESPACE_NODE              = 13;

	Node.DOCUMENT_POSITION_EQUAL                   = 0x00;
	Node.DOCUMENT_POSITION_DISCONNECTED            = 0x01;
	Node.DOCUMENT_POSITION_PRECEDING               = 0x02;
	Node.DOCUMENT_POSITION_FOLLOWING               = 0x04;
	Node.DOCUMENT_POSITION_CONTAINS                = 0x08;
	Node.DOCUMENT_POSITION_CONTAINED_BY            = 0x10;
	Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

	Node.prototype = {
	    get nodeName() {
		return $(this).nodeName;
	    },
	    get nodeValue() {
		return TurnUndefinedIntoNull($(this).nodeValue);
	    },
	    set nodeValue(newValue) {
		if (!IsNull(newValue)) {
		    var impl = $(this);
		    if (impl.readonly)
			throw new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR);
		    impl.nodeValue = newValue;
		}
	    },
	    get nodeType() {
		return $(this).nodeType;
	    },
	    get parentNode() {
		return TurnUndefinedIntoNull($(this).parentNode);
	    },
	    get childNodes() {
		var impl = $(this);
		if (impl.cachedChildNodes)
		    return impl.cachedChildNodes;
		if (!impl.childNodes)
		    impl.childNodes = [];
		return impl.cachedChildNodes = new constructors.NodeList(impl.childNodes);
	    },
	    get firstChild() {
		var childNodes = $(this).childNodes;
		if (childNodes && childNodes.length > 0)
		    return childNodes[0];
		return null;
	    },
	    get lastChild() {
		var childNodes = $(this).childNodes;
		if (childNodes && childNodes.length > 0)
		    return childNodes[childNodes.length-1];
		return null;
	    },
	    get previousSibling() {
		return sibling(this, -1);
	    },
	    get nextSibling() {
		return sibling(this, 1);
	    },
	    get attributes() {
		var attributes = $(this).attributes;
		if (!attributes)
		    return null;
		/* TODO */
	    },
	    get ownerDocument() {
		var node = this;
		var parent;
		while (parent = $(node).parentNode)
		    node = parent;
		return TurnUndefinedIntoNull($(node).ownerDocument);
	    },
	};
    });
} (this));
