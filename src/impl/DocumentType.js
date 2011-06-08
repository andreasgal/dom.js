defineLazyProperty(impl, "DocumentType", function() {
    function DocumentType(name, publicId, systemId) {
        // Unlike other nodes, doctype nodes always start off unowned
        // until inserted
        this.ownerDocument = null;
        this.name = name;  
        this.publicId = publicId || "";
        this.systemId = systemId || "";
    }

    DocumentType.prototype = Object.create(impl.Leaf.prototype, {
        nodeType: constant(DOCUMENT_TYPE_NODE),
        nodeName: attribute(function() { return this.name; }),
        nodeValue: attribute(fnull, fnoop),
    });

    return DocumentType;
});