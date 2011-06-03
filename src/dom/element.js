function element(doc, localName, namespaceURI, prefix) {
    this.ownerDocument = doc;
    this.localName = localName;
    this.namespaceURI = namespaceURI;
    this.prefix = prefix;

    this.attributes = [];
    this.childNodes = [];
}

element.prototype = Object.create(node.prototype, {
    nodeType: constant(ELEMENT_NODE),
    nodeName: attribute(function() { return this.tagName; }),
    nodeValue: attribute(fnull, fnoop),
    
    isHTML: attribute(function() { 
	return this.namespaceURI === HTML_NAMESPACE &&
	    this.ownerDocument.isHTML;
    }),

    getAttribute: constant(function getAttribute(qname) {
	if (this.isHTML) qname = toLowerCase(qname);
	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.name === qname)
		return attr.value;
	}
	return null;
    }),

    hasAttribute: constant(function hasAttribute(qname) {
	return this.getAttribute(qname) !== null;
    }),


    setAttribute: constant(function setAttribute(qname, value) {
	if (!isValidName(qname)) InvalidCharacterError();
	if (this.isHTML) qname = toLowerCase(qname);
	if (substring(qname, 0, 5) === "xmlns") NamespaceError();

	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.name === qname) {
		attr.value = value;     // Setter sends mutation event for us
		return;
	    }
	}

	// The attribute doesn't already exist, so add a new one
	let newattr = new attr(this, qname, value)
	push(this.attributes, newattr);

	// Send mutation event
        if (this.root) this.root.mutateValue(newattr);
    }),

    removeAttribute: constant(function removeAttribute(qname) {
	if (this.isHTML) qname = toLowerCase(qname);

	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.name === qname) {
		splice(this.attributes, i, 1);
		// Mutation event
		if (this.root) this.root.mutateRemove(attr);
		return;
	    }
	}
    }),

    getAttributeNS: constant(function getAttributeNS(ns, lname) {
	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.namespaceURI === ns && attr.localName === lname)
		return attr.value;
	}
	return null;
    }),

    hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
	return this.getAttributeNS(ns, lname) !== null;
    }),

    setAttributeNS: constant(function setAttributeNS(ns, qname, value) {
	if (!isValidName(qname)) InvalidCharacterError();
	if (!isValidQName(qname)) NamespaceError();

	let pos = S.indexOf(qname, ":"), prefix, lname;
	if (pos === -1) {
	    prefix = null;
	    lname = qname;
	}
	else {
	    prefix = substring(qname, 0, pos);
	    lname = substring(qname, pos+1);
	}

	if (ns === "") ns = null;

	if ((prefix !== null && ns === null) ||
	    (prefix === "xml" && ns !== XML_NAMESPACE) ||
	    ((qname === "xmlns" || prefix === "xmlns") &&
	     (ns !== XMLNS_NAMESPACE)) ||
	    (ns === XMLNS_NAMESPACE && 
	     !(qname === "xmlns" || prefix === "xmlns")))
	    NamespaceError();

	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.namespaceURI === ns && attr.localName === lname) {

		// setAttributeNS can change the prefix (and therefore qname)
		// of an attribute
		if (attr.prefix !== prefix) {
		    attr.prefix = prefix;
		    attr.name = prefix + ":" + attr.localName 
		}

		attr.value = value;  // this automatically fires an event
		return;
	    }
	}
	let newattr = new attr(this, lname, value, prefix, ns)
	push(this.attributes, newattr);
	if (this.root) this.root.mutateValue(newattr);
    }),


    removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.namespaceURI === ns && attr.localName === lname) {
		splice(this.attributes, i, 1);
		if (this.root) this.root.mutateRemove(attr);
		return;
	    }
	}
    }),



});