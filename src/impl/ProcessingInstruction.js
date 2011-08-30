defineLazyProperty(impl, "ProcessingInstruction", function() {

    function ProcessingInstruction(doc, target, data) {
        this.ownerDocument = doc;
        this.target = target;
        this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
                              function(v) { 
                                  this._data = v;
                                  if (this.rooted)
                                      this.ownerDocument.mutateValue(this);
                              });

    ProcessingInstruction.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("ProcessingInstruction"),
        nodeType: constant(PROCESSING_INSTRUCTION_NODE),
        nodeName: attribute(function() { return this.target; }),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,

        // Utility methods
        clone: constant(function clone() {
            return new impl.ProcessingInstruction(this.ownerDocument,
                                                  this.target, this._data);
        }),
        isEqual: constant(function isEqual(n) {
            return this.target === n.target && this._data === n._data;
        }),

    });

    return ProcessingInstruction;
});