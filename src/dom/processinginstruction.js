const processinginstruction = (function() {

    function processinginstruction(doc, target, data) {
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

    processinginstruction.prototype = Object.create(leaf.prototype, {
	nodeType: constant(PROCESSING_INSTRUCTION_NODE),
	nodeName: attribute(function() { return this.target; }),
	nodeValue: nodeValue,
	textContent: nodeValue,
	data: nodeValue,
    });

    return processinginstruction;
}());