// The document object is the entry point to the entire DOM
defineLazyProperty(global, "document", function() {
    return wrap(new impl.DOMImplementation().createHTMLDocument(""));
});

defineLazyProperty(global, "Document", function() {
    return idl.Document.publicInterface;
}, true);

defineLazyProperty(idl, "Document", function() {
    return implementIDLInterface({
        name: "Document",
        superclass: idl.Node,
	members: {
	    // readonly attribute DOMImplementation implementation;
	    get implementation() { return wrap(unwrap(this).implementation); },

            // attribute DOMString documentURI;
	    get documentURI() { nyi(); },
	    set documentURI(newval) { nyi(); },

	    // readonly attribute DOMString compatMode;
	    get compatMode() { return "CSS1Compat"; },

	    // readonly attribute DocumentType? doctype;
	    get doctype() {
		return wrap(unwrap(this).doctype);
	    },

	    // readonly attribute Element? documentElement;
	    get documentElement() {
		return wrap(unwrap(this).documentElement);
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
		return wrap(unwrap(this).createElement(StringOrEmpty(lname)));
	    },
	    
	    // Element createElementNS(DOMString namespace,
	    //                         DOMString qualifiedName);
	    //
	    createElementNS: function createElementNS(ns, qname) {
		ns = String(ns);
		qname = String(qname);
		return wrap(unwrap(this).createElementNS(String(ns),
							 String(qname)));
	    },


	    // DocumentFragment createDocumentFragment();
	    createDocumentFragment: function createDocumentFragment() {
		return wrap(unwrap(this).createDocumentFragment());
	    },

	    // Text createTextNode(DOMString data);
	    createTextNode: function createTextNode(data) {
		return wrap(unwrap(this).createTextNode(String(data)));
	    },

	    // Comment createComment(DOMString data);
	    createComment: function createComment(data) { 
		return wrap(unwrap(this).createComment(String(data)));
	    },

	    // ProcessingInstruction createProcessingInstruction(
	    //                            DOMString target, DOMString data);
	    createProcessingInstruction: function createPI(target, data) {
		return wrap(unwrap(this).createProcessingInstruction(
		    String(target),
		    String(data)
		));
	    },

	    // Node importNode(Node node, boolean deep);
	    importNode: function importNode(node, deep) {nyi();},

	    // Node adoptNode(Node node);
	    adoptNode: function adoptNode(node) {
		unwrap(this).adoptNode(unwrap(node));
		return node;
	    },

	    // Event createEvent(DOMString interface);
	    createEvent: function createEvent(interfaceName) { nyi(); },
	}
    });
});
