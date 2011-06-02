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
	    //
	    // The createElement(localName) method must run the these
	    // steps:
	    //
	    //     If localName does not match the Name production in
	    //     XML, throw an INVALID_CHARACTER_ERR exception and
	    //     terminate these steps.
	    //
	    //     If the context object is an HTML document, let
	    //     localName be converted to lowercase.
	    //
	    //     Return a new element with no attributes, namespace
	    //     set to the HTML namespace, local name set to
	    //     localName, and ownerDocument set to the context
	    //     object.
	    //
	    createElement: function createElement(lname) {
		lname = StringOrEmpty(lname);

		if (!isValidName(lname))
		    throw new DOM.DOMException(INVALID_CHARACTER_ERR);

		let impl = unwrap(this);
		if (impl.isHTML())
		    lname = lname.toLowerCase();

		return wrap(impl.tree.element(lname, null, HTML_NAMESPACE));
	    },
	    
	    // Element createElementNS(DOMString namespace,
	    //                         DOMString qualifiedName);
	    //
	    // The createElementNS(namespace, qualifiedName) method
	    // must run these steps:
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
	    //     If prefix is not null and namespace is an empty
	    //     string, throw a NAMESPACE_ERR exception and
	    //     terminate these steps.
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
	    //     Return a new element with no attributes, namespace
	    //     set to namespace, namespace prefix set to prefix,
	    //     local name set to localName, and ownerDocument set
	    //     to the context object.
	    //
	    createElementNS: function createElementNS(ns, qname) {
		ns = String(ns);
		qname = String(qname);

		if (!isValidName(qname))
		    throw new DOM.DOMException(INVALID_CHARACTER_ERR);

		if (!isValidQName(qname))
		    throw new DOM.DOMException(NAMESPACE_ERR);

		let pos, prefix, lname;
		if ((pos = S.indexOf(qname, ":")) !== -1) {
		    prefix = substring(qname, 0, pos);
		    lname = substring(qname, pos+1);

		    if (ns === "" || (prefix === "xml" && ns !== XML_NAMESPACE))
			throw new DOM.DOMException(NAMESPACE_ERR);
		}
		else {
		    prefix = null;
		    lname = qname;
		}

		if (((qname === "xmlns" || prefix === "xmlns") &&
		     ns !== XMLNS_NAMESPACE) ||
		    (ns === XMLNS_NAMESPACE && 
		     qname !== "xmlns" &&
		     prefix !== "xmlns"))
		    throw new DOM.DOMException(NAMESPACE_ERR);

		
		return wrap(unwrap(this).tree.element(lname, prefix, ns));
	    },


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
