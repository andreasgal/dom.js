defineLazyProperty(impl, "DocumentFragment", function() {
    function DocumentFragment(doc) {
	this.ownerDocument = doc;
	this.childNodes = [];
    }

    DocumentFragment.prototype = Object.create(impl.Node.prototype, {
	nodeType: constant(DOCUMENT_FRAGMENT_NODE),
	nodeName: constant("#document-fragment"),
	nodeValue: attribute(fnull, fnoop),
    });

    return DocumentFragment;
});