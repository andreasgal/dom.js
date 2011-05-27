defineLazyProperty(global, "Element", function() {
    return DOM.Element.interface;
}, true);

defineLazyProperty(DOM, "Element", function() {
    return implementIDLInterface({
        name: "Element",
        superclass: DOM.Node,
	members: {
	    // readonly attribute DOMString? namespaceURI;
	    //
	    // The namespaceURI attribute must return the context
	    // object's namespace.
	    get namespaceURI() { nyi(); },

	    // readonly attribute DOMString? prefix;
	    //
	    // The prefix attribute must return the context object's
	    // namespace prefix.
	    get prefix() { nyi(); },

	    // readonly attribute DOMString localName;
	    //
	    // The localName attribute must return the context
	    // object's local name.
	    get localName() { nyi(); },

	    // readonly attribute DOMString tagName;
	    //
	    // The tagName attribute must run these steps:
	    //
	    //     If context object's namespace prefix is not null,
	    //     let qualified name be its namespace prefix,
	    //     followed by a ":" (U+003A), followed by its local
	    //     name. Otherwise, let qualified name be its local
	    //     name.
	    //
	    //     If the context object is in the HTML namespace and
	    //     its ownerDocument is an HTML document, let
	    //     qualified name be converted to uppercase.
	    //
	    //     Return qualified name.
	    get tagName() { 
		// XXX: still need to deal with namespace stuff
		let impl = unwrap(this), name = impl.value;
		
		if (isHTML(impl)) name = toUpperCase(name);
		return name;
	    },

	    // readonly attribute Attr[] attributes;
	    //
	    // The attributes attribute must return a read only array
	    // of the context object's associated Attr objects.
	    // 
	    // XXX: an IDL array is not the same as a JavaScript array
	    get attributes() { nyi(); },

	    // DOMString? getAttribute(DOMString qualifiedName);
	    //
	    // The getAttribute(name) method must run these steps:
	    //
	    //     If the context object is in the HTML namespace and
	    //     its ownerDocument is an HTML document, let name be
	    //     converted to lowercase.
	    //
	    //     Return the value of the first Attr in the context
	    //     object's attributes whose qualified name is name,
	    //     if the Attr is present, or null otherwise.
	    getAttribute: function getAttribute(qname) {
		let impl = unwrap(this);
		qname = String(qname);
		if (isHTML(impl)) qname = toLowerCase(qname);

		// XXX The *first* attr? Can an element really ever
		// have more than one that matches? Is this because of 
		// namespace issues? It would be a shame to have to 
		// convert from a hash to an array.  Although I need to 
		// have an array for form the attributes property above...
		return undef2null(impl.attrs[qname]);
	    },

	    // DOMString? getAttributeNS(DOMString namespace,
	    //                           DOMString localName);
	    //
	    // The getAttributeNS(namespace, localName) method must
	    // return the value of the Attr in the context object's
	    // attributes whose namespace is namespace and local name
	    // is localName, if the Attr is present, or null
	    // otherwise.
	    getAttributeNS: function getAttributeNS(ns, lname) {nyi()},

	    // void setAttribute(DOMString qualifiedName, DOMString value);
	    //
	    // The setAttribute(qualifiedName, value) method must run
	    // these steps:
	    //
	    //     If qualifiedName does not match the Name production
	    //     in XML, throw an INVALID_CHARACTER_ERR exception
	    //     and terminate these steps.
	    //
	    //     If the context object is in the HTML namespace and
	    //     its ownerDocument is an HTML document, let
	    //     qualifiedName be converted to lowercase.
	    //
	    //     If "xmlns" is a prefix match for qualifiedName,
	    //     throw a NAMESPACE_ERR and terminate these steps.
	    //
	    //     If the context object does not have an Attr object
	    //     whose local name is qualifiedName, create an Attr
	    //     object, whose local name is qualifiedName and value
	    //     is value. Append this object to the context
	    //     object's attributes.
	    //
	    //     Otherwise, set the value of the first Attr object
	    //     in the context object's attributes whose qualified
	    //     name is qualifiedName, to value.
	    setAttribute: function setAttribute(qname, value) {
		let impl = unwrap(this);
		qname = String(qname);
		
		if (!validName(qname))
		    throw new DOM.DOMException(INVALID_CHARACTER_ERR);

		if (isHTML(impl)) qname = toLowerCase(qname);

		if (substring(qname, 0, 5) === "xmlns")
		    throw new DOM.DOMException(NAMESPACE_ERR);

		// XXX Can there really be more than one matching attribute?
		// I may have to deal with this in Tree.js
		//
		// Don't set the attribute directly: the tree needs to generate
		// a mutation event
		impl.setAttribute(qname, String(value));
	    },

	    // void setAttributeNS(DOMString namespace, 
	    //                     DOMString qualifiedName, DOMString value);
	    //
	    // The setAttributeNS(namespace, qualifiedName, value)
	    // method must run these steps:
	    //
	    //     If qualifiedName does not match the Name production
	    //     in XML, throw an INVALID_CHARACTER_ERR exception
	    //     and terminate these steps.
	    //
	    //     If qualifiedName does not match the QName
	    //     production in Namespaces in XML, throw a
	    //     NAMESPACE_ERR exception and terminate these steps.
	    //
	    //     If qualifiedName contains a ":" (U+003E), then
	    //     split the string on it and let prefix be the part
	    //     before and localName the part after. Otherwise, let
	    //     prefix be null and localName be qualifiedName.
	    //
	    //     If namespace is the empty string, let namespace be
	    //     null.
	    //
	    //     If prefix is not null and namespace is null, throw
	    //     a NAMESPACE_ERR exception and terminate these
	    //     steps.
	    //
	    //     If prefix is "xml" and namespace is not the XML
	    //     namespace, throw a NAMESPACE_ERR exception and
	    //     terminate these steps.
	    //
	    //     If qualifiedName or prefix is "xmlns" and namespace
	    //     is not the XMLNS namespace, throw a NAMESPACE_ERR
	    //     exception and terminate these steps.
	    //
	    //     If namespace is the XMLNS namespace and neither
	    //     qualifiedName nor prefix is "xmlns", throw a
	    //     NAMESPACE_ERR exception and terminate these steps.
	    //
	    //     If the context object's attributes does not contain
	    //     an Attr object whose namespace is namespace and
	    //     local name is localName, create an Attr object,
	    //     whose namespace is namespace, namespace prefix is
	    //     prefix, local name is localName, and value is
	    //     value. Append this object to the context object's
	    //     attributes.
	    //
	    //     Otherwise, set the value of the Attr object in the
	    //     context object's attributes whose namespace is
	    //     namespace, and local name is localName, to value,
	    //     and set its namespace prefix to prefix.
	    setAttributeNS: function setAttributeNS(ns, qname, value) {nyi();},

	    // void removeAttribute(DOMString qualifiedName);
	    //
	    // The removeAttribute(qualifiedName) method must run the
	    // following steps:
	    //
	    //     If the context object is in the HTML namespace and
	    //     its ownerDocument is an HTML document, let
	    //     qualifiedName be converted to lowercase.
	    //
	    //     Remove the first Attr object in the context
	    //     object's attributes whose qualified name is
	    //     qualifiedName.
	    removeAttribute: function removeAttribute(qname) {
		let impl = unwrap(this);
		qname = String(qname);
		if (isHTML(impl)) qname = toLowerCase(qname);
		impl.deleteAttribute(qname);
	    },

	    // void removeAttributeNS(DOMString namespace, DOMString localName);
	    //
	    // The removeAttributeNS(namespace, localName) method must
	    // remove the Attr object in the context object's
	    // attributes whose namespace is namespace and local name
	    // is localName
	    removeAttributeNS: function removeAttributeNS(ns, lname) {nyi();},

	    // boolean hasAttribute(DOMString qualifiedName);
	    //
	    // The hasAttribute(qualifiedName) method must run these
	    // steps:
	    //
	    //     If the context object is in the HTML namespace and
	    //     its ownerDocument is an HTML document, let
	    //     qualifiedName be converted to lowercase.
	    //
	    //     Return true if context object's attributes contains
	    //     an Attr whose qualified name is qualifiedName, or
	    //     false otherwise.
	    hasAttribute: function hasAttribute(qname) {
		let impl = unwrap(this);
		qname = String(qname);
		if (isHTML(impl)) qname = toLowerCase(qname);
		return qname in impl.attrs; // attrs has no prototype
	    },

	    // boolean hasAttributeNS(DOMString namespace, DOMString localName);
	    //
	    // The hasAttributeNS(namespace, localName) method must
	    // return true if context object's attributes contains an
	    // Attr whose namespace is namespace and local name is
	    // localName, or false otherwise.
	    hasAttributeNS: function hasAttributeNS(ns, lname) { nyi(); },

	    // NodeList getElementsByTagName(DOMString qualifiedName);
	    //
	    // When the getElementsByTagName(qualifiedName) method is
	    // invoked it must return a live NodeList with the
	    // elements that the getElementsByTagName method would
	    // return when called on the context object's
	    // ownerDocument and passed the same argument, excluding
	    // any elements that are not descendants of the context
	    // object on which the method was invoked.
	    //
	    // When invoked with the same argument the same NodeList
	    // object may be returned as returned by an earlier call.
	    getElementsByTagName: function getElementsByTagName(qname) {nyi();},

	    // NodeList getElementsByTagNameNS(DOMString namespace,
	    //                                 DOMString localName);
	    //
	    // When the getElementsByTagNameNS(namespace, localName)
	    // method is invoked it must return a live NodeList with
	    // the elements that the getElementsByTagNameNS method
	    // would return when called on the context object's
	    // ownerDocument and passed the same arguments, excluding
	    // any elements that are not descendants of the context
	    // object on which the method was invoked.
	    //
	    // When invoked with the same argument the same NodeList
	    // object may be returned as returned by an earlier call.
	    getElementsByTagNameNS: function getElementsByTagNameNS(ns, lname){
		nyi();
	    },

	    // NodeList getElementsByClassName(DOMString classNames);
	    //
	    // When the getElementsByClassName(classNames) method is
	    // invoked it must return a live NodeList with the
	    // elements that the getElementsByClassName method would
	    // return when called on the context object's
	    // ownerDocument and passed the same argument, excluding
	    // any elements that are not descendants of the context
	    // object on which the method was invoked.
	    //
	    // When invoked with the same argument the same NodeList
	    // object may be returned as returned by an earlier call.
	    getElementsByClassName: function getElementsByClassName(classes) {
		nyi();
	    },

	    // readonly attribute HTMLCollection children;
	    //
	    // The children attribute must return an HTMLCollection
	    // collection, rooted at the context object, whose filter
	    // matches only elements whose parent is the context
	    // object.
	    get children() { nyi(); },

	    // readonly attribute Element? firstElementChild;
	    //
	    // The firstElementChild attribute must return the first
	    // child of the context object that is of type Element or
	    // null if there is no such node.
	    get firstElementChild() {
		let kids = unwrap(this).kids;
		if (kids) {
		    for(let i = 0, len = kids.length; i < len; i++) {
			if (kids[i].type == ELEMENT_NODE)
			    return wrap(kids[i]);
		    }
		}
		return null;
	    },

	    // readonly attribute Element? lastElementChild;
	    //
	    // The lastElementChild attribute must return the last
	    // child of the context object that is of type Element or
	    // null if there is no such node.
	    get lastElementChild() {
		let kids = unwrap(this).kids;
		if (kids) {
		    for(let i = kids.length-1; i >= 0; i--) {
			if (kids[i].type == ELEMENT_NODE)
			    return wrap(kids[i]);
		    }
		}
		return null;
	    },

	    // readonly attribute Element? previousElementSibling;
	    //
	    // The previousElementSibling attribute must return the
	    // first preceding sibling of the context object that is
	    // of type Element or null if there is no such node.
	    get previousElementSibling() {
		let impl = unwrap(this);
		if (impl.parent) {
		    let index = impl.index(), kids = impl.parent.kids;
		    for(let i = index-1; i >= 0; i--) {
			if (kids[i].type == ELEMENT_NODE)
			    return wrap(kids[i]);
		    }
		}
		return null;
	    },

	    // readonly attribute Element? nextElementSibling;
	    //
	    // The nextElementSibling attribute must return the first
	    // following sibling of the context object that is of type
	    // Element or null if there is no such node.
	    get nextElementSibling() {
		let impl = unwrap(this);
		if (impl.parent) {
		    let index = impl.index(), kids = impl.parent.kids;
		    for(let i = index+1, len = kids.length; i < len; i++) {
			if (kids[i].type == ELEMENT_NODE)
			    return wrap(kids[i]);
		    }
		}
		return null;
	    },

	    // readonly attribute unsigned long childElementCount;
	    //
	    // The childElementCount attribute must return the number
	    // of children of the context node that are Elements.
	    get childElementCount() {
		let impl = unwrap(this), kids = impl.kids, count = 0;
		if (kids) {
		    for(let i = 0, len = kids.length; i < len; i++) {
			if (kids[i].type == ELEMENT_NODE) count++;
		    }
		}
		return count;
	    },
	}
    });
});
