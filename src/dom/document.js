function document(isHTML) {
    this.isHTML = isHTML;
    this.nodeType = DOCUMENT_NODE;
    this.documentURI = null;    // XXX what should this be?
    this.implementation = new domimplementation();


    // These will be initialized by our custom versions of
    // appendChild and insertBefore that override the inherited Node methods.
    this.doctype = null;
    this.documentElement = null;
    this.childNodes = [];
}

document.prototype = Object.create(node.prototype, {
    nodeType: constant(DOCUMENT_NODE),
    nodeName: constant("#document"),
    nodeValue: attribute(fnull, fnoop),

    compatMode: constant("CSS1Compat"),
    ownerDocument: constant(null),
    parentNode: constant(null),

    createTextNode: constant(function(data) { return new text(this, data); }),
    createComment: constant(function(data) { return new comment(this, data); }),
    createDocumentFragment: constant(function() {
	return new documentfragment(this);
    }),
    createProcessingInstruction: constant(function(target, data) {
	return new processinginstruction(this, target, data);
    }),

    createElement: constant(function(localName) {
	if (!isValidName(localName)) InvalidCharacterError();

	if (this.isHTML)
	    localName = toLowerCase(localName);

	return new element(this, localName, HTML_NAMESPACE, null);
    }),

    createElementNS: constant(function(namespace, qualifiedName) {
	if (!isValidName(qualifiedName)) InvalidCharacterError();
	if (!isValidQName(qualifiedName)) NamespaceError();
	
	let pos, prefix, localName;
	if ((pos = S.indexOf(qualifiedName, ":")) !== -1) {
	    prefix = substring(qualifiedName, 0, pos);
	    localName = substring(qualifiedName, pos+1);

	    if (namespace === "" ||
		(prefix === "xml" && namespace !== XML_NAMESPACE))
		NamespaceError();
	}
	else {
	    prefix = null;
	    localName = qualifiedName;
	}

	if (((qualifiedName === "xmlns" || prefix === "xmlns") &&
	     namespace !== XMLNS_NAMESPACE) ||
	    (namespace === XMLNS_NAMESPACE && 
	     qualifiedName !== "xmlns" &&
	     prefix !== "xmlns"))
	    NamespaceError();

	return new element(this, localName, namespace, prefix);
    }),
});
