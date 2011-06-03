function documentfragment(doc) {
    this.ownerDocument = doc;
    this.childNodes = [];
}

documentfragment.prototype = Object.create(node.prototype, {
    nodeType: constant(DOCUMENT_FRAGMENT_NODE),
    nodeName: constant("#document-fragment"),
    nodeValue: attribute(fnull, fnoop),
});