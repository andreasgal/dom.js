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
	    get namespaceURI() {
		return unwrap(this).namespaceURI;
	    },

	    // readonly attribute DOMString? prefix;
	    //
	    // The prefix attribute must return the context object's
	    // namespace prefix.
	    get prefix() {
		return unwrap(this).prefix;
	    },

	    // readonly attribute DOMString localName;
	    //
	    // The localName attribute must return the context
	    // object's local name.
	    get localName() {
		return unwrap(this).localName;
	    },

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
	    //
	    get tagName() { 
		return unwrap(this).tagName;
	    },

	    // readonly attribute Attr[] attributes;
	    //
	    // The attributes attribute must return a read only array
	    // of the context object's associated Attr objects.
	    // 
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
		return unwrap(this).getAttribute(String(qname));
	    },

	    // DOMString? getAttributeNS(DOMString namespace,
	    //                           DOMString localName);
	    //
	    // The getAttributeNS(namespace, localName) method must
	    // return the value of the Attr in the context object's
	    // attributes whose namespace is namespace and local name
	    // is localName, if the Attr is present, or null
	    // otherwise.
	    getAttributeNS: function getAttributeNS(ns, lname) {
		return unwrap(this).getAttributeNS(String(ns), String(lname));
	    },

	    // void setAttribute(DOMString qualifiedName, DOMString value);
	    setAttribute: function setAttribute(qname, value) {
		unwrap(this).setAttribute(String(qname), String(value));
	    },

	    // void setAttributeNS(DOMString namespace, 
	    //                     DOMString qualifiedName, DOMString value);
	    setAttributeNS: function setAttributeNS(ns, qname, value) {
		unwrap(this).setAttributeNS(String(ns),
					    String(qname),
					    String(value));
	    },

	    // void removeAttribute(DOMString qualifiedName);
	    removeAttribute: function removeAttribute(qname) {
		unwrap(this).removeAttribute(String(qname));
	    },

	    // void removeAttributeNS(DOMString namespace, DOMString localName);
	    removeAttributeNS: function removeAttributeNS(ns, lname) {
		unwrap(this).removeAttributeNS(String(ns), String(lname));
	    },

	    // boolean hasAttribute(DOMString qualifiedName);
	    hasAttribute: function hasAttribute(qname) {
		return unwrap(this).hasAttribute(String(qname));
	    },

	    // boolean hasAttributeNS(DOMString namespace, DOMString localName);
	    hasAttributeNS: function hasAttributeNS(ns, lname) {
		return unwrap(this).hasAttributeNS(String(ns), String(lname));
	    },

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
		return unwrap(this).firstElementChild;
	    },

	    // readonly attribute Element? lastElementChild;
	    //
	    // The lastElementChild attribute must return the last
	    // child of the context object that is of type Element or
	    // null if there is no such node.
	    get lastElementChild() {
		return unwrap(this).lastElementChild;
	    },

	    // readonly attribute Element? previousElementSibling;
	    //
	    // The previousElementSibling attribute must return the
	    // first preceding sibling of the context object that is
	    // of type Element or null if there is no such node.
	    get previousElementSibling() {
		return unwrap(this).previousElementSibling;
	    },

	    // readonly attribute Element? nextElementSibling;
	    //
	    // The nextElementSibling attribute must return the first
	    // following sibling of the context object that is of type
	    // Element or null if there is no such node.
	    get nextElementSibling() {
		return unwrap(this).nextElementSibling;
	    },

	    // readonly attribute unsigned long childElementCount;
	    //
	    // The childElementCount attribute must return the number
	    // of children of the context node that are Elements.
	    get childElementCount() {
		return unwrap(this).childElementCount;
	    },
	}
    });
});
