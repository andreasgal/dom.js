defineLazyProperty(global, "Document", function() {
    return DOM.Document.interface;
}, true);

defineLazyProperty(DOM, "Document", function() {
    return implementIDLInterface({
        name: "Document",
        superclass: DOM.Node,
	members: {
	    // readonly attribute DOMImplementation implementation;
	    get implementation() { return DOM.implementation; },

            // attribute DOMString documentURI;
	    get documentURI() { nyi(); },
	    set documentURI(newval) { nyi(); },

	    // readonly attribute DOMString compatMode;
	    get compatMode() { return "CSS1Compat"; },

	    // readonly attribute DocumentType? doctype;
	    get doctype() { nyi(); },

	    // readonly attribute Element? documentElement;
	    get documentElement() {
		var root = unwrap(this), kids = root.kids;
		if (kids) {
		    for(let i = 0, n = kids.length; i < n; i++) {
			if (kids[i].type === ELEMENT_NODE)
			    return wrap(kids[i]);
		    }
		}
		return null;
	    },

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

	    // Element? getElementById(DOMString elementId);
	    getElementById: function getElementById(id) { nyi(); },

	    // Element createElement([TreatNullAs=EmptyString]
	    //                       DOMString localName);
	    createElement: function createElement(lname) {
		return wrap(unwrap(this).tree.element(lname));
	    },
	    
	    // Element createElementNS(DOMString namespace,
	    //                         DOMString qualifiedName);
	    createElementNS: function createElementNS(ns, qname) { nyi(); },


	    // DocumentFragment createDocumentFragment();
	    createDocumentFragment: function createDocumentFragment() {nyi();},

	    // Text createTextNode(DOMString data);
	    createTextNode: function createTextNode(data) {
		return wrap(unwrap(this).tree.text(data));
	    },

	    // Comment createComment(DOMString data);
	    createComment: function createComment(data) { 
		return wrap(unwrap(this).tree.comment(data));
	    },

	    // ProcessingInstruction createProcessingInstruction(
	    //                            DOMString target, DOMString data);
	    createProcessingInstruction:
	      function createProcessingInstruction(target, data) {
		  return wrap(unwrap(this).tree.pi(target, data));
	    },

	    // Node importNode(Node node, boolean deep);
	    importNode: function importNode(node, deep) {nyi();},

	    // Node adoptNode(Node node);
	    adoptNode: function adoptNode(node) {nyi();},

	    // Event createEvent(DOMString interface);
	    createEvent: function createEvent(interfaceName) { nyi(); },
	}
    });
});
