defineLazyProperty(impl, "DocumentType", function() {
    function DocumentType(name, publicId, systemId) {
        // Unlike other nodes, doctype nodes always start off unowned
        // until inserted
        this.ownerDocument = null;
        this.name = name;  
        this.publicId = publicId || "";
        this.systemId = systemId || "";
    }

    DocumentType.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("DocumentType"),
        nodeType: constant(DOCUMENT_TYPE_NODE),
        nodeName: attribute(function() { return this.name; }),
        nodeValue: attribute(fnull, fnoop),

        // Utility methods
        clone: constant(function clone() {
            DataCloneError();
        }),
        isEqual: constant(function isEqual(n) {
            return this.name === n.name &&
                this.publicId === n.publicId &&
                this.systemId === n.systemId;
        })
    });

    return DocumentType;
});