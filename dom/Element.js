defineLazyProperty(global, "Element", function() {
    return DOM.Element.interface;
}, true);

defineLazyProperty(DOM, "Element", function() {
    return implementIDLInterface({
        name: "Element",
        superclass: DOM.Node,
        init: function(impl) { },
	members: {
	    // readonly attribute DOMString? namespaceURI;
	    get namespaceURI() { nyi(); },

	    // readonly attribute DOMString? prefix;
	    get prefix() { nyi(); },

	    // readonly attribute DOMString localName;
	    get localName() { nyi(); },

	    // readonly attribute DOMString tagName;
	    get tagName() { nyi(); },

	    //  readonly attribute Attr[] attributes;
	    get attribute() { nyi(); },

	    // DOMString? getAttribute(DOMString qualifiedName);
	    getAttribute: function getAttribute(qname) { nyi(); },

	    // DOMString? getAttributeNS(DOMString namespace,
	    //                           DOMString localName);
	    getAttributeNS: function getAttributeNS(ns, lname) {nyi()},

	    // void setAttribute(DOMString qualifiedName, DOMString value);
	    setAttribute: function setAttribute(qname, value) { nyi(); },

	    // void setAttributeNS(DOMString namespace, 
	    //                     DOMString qualifiedName, DOMString value);
	    setAttributeNS: function setAttributeNS(ns, qname, value) {nyi();},

	    // void removeAttribute(DOMString qualifiedName);
	    removeAttribute: function removeAttribute(qname) { nyi(); },

	    // void removeAttributeNS(DOMString namespace, DOMString localName);
	    removeAttributeNS: function removeAttributeNS(ns, lname) {nyi();},

	    // boolean hasAttribute(DOMString qualifiedName);
	    hasAttribute: function hasAttribute(qname) { nyi(); },

	    // boolean hasAttributeNS(DOMString namespace, DOMString localName);
	    hasAttributeNS: function hasAttributeNS(ns, lname) { nyi(); },

	    // NodeList getElementsByTagName(DOMString qualifiedName);
	    getElementsByTagName: function getElementsByTagName(qname) {nyi();},

	    // NodeList getElementsByTagNameNS(DOMString namespace,
	    //                                 DOMString localName);
	    getElementsByTagNameNS: function getElementsByTagNameNS(ns, lname){
		nyi();
	    },

	    // NodeList getElementsByClassName(DOMString classNames);
	    getElementsByClassName: function getElementsByClassName(classes) {
		nyi();
	    },

	    // readonly attribute HTMLCollection children;
	    get children() { nyi(); },

	    // readonly attribute Element? firstElementChild;
	    get firstElementChild() { nyi(); },

	    // readonly attribute Element? lastElementChild;
	    get lastElementChild() { nyi(); },

	    // readonly attribute Element? previousElementSibling;
	    get previousElementSibling() { nyi(); },

	    // readonly attribute Element? nextElementSibling;
	    get nextElementSibling() { nyi(); },

	    // readonly attribute unsigned long childElementCount;
	    get childElementCount() { nyi(); },
	}
    });
});
