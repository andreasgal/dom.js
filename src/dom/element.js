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

    getAttribute: constant(function(qname) {
	if (this.isHTML) qname = toLowerCase(qname);
	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.name === qname)
		return attr.value;
	}
	return null;
    }),

    getAttributeNS: constant(function(ns, lname) {
	for(let i = 0, n = this.attributes.length; i < n; i++) {
	    let attr = this.attributes[i];
	    if (attr.namespaceURI === ns && attr.localName === lname)
		return attr.value;
	}
	return null;
    }),

});