defineLazyProperty(impl, "DocumentFragment", function() {
    function DocumentFragment(doc) {
        this.ownerDocument = doc;
        this.childNodes = [];
    }

    DocumentFragment.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(DOCUMENT_FRAGMENT_NODE),
        nodeName: constant("#document-fragment"),
        nodeValue: attribute(fnull, fnoop),
        // Copy the text content getter/setter from Element
        textContent: O.getOwnPropertyDescriptor(impl.Element.prototype,
                                                "textContent"),
    });

    return DocumentFragment;
});