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

    ProcessingInstruction.prototype = Object.create(impl.Leaf.prototype, {
	nodeType: constant(PROCESSING_INSTRUCTION_NODE),
	nodeName: attribute(function() { return this.target; }),
	nodeValue: nodeValue,
	textContent: nodeValue,
	data: nodeValue,
    });

    return ProcessingInstruction;
});