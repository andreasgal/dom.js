function processinginstruction(doc, target, data) {
    this.ownerDocument = doc;
    this.target = target;
    this.data = data;
}


// XXX
// For PI nodes, the nodeValue, textContent and data attributes all behave
// identically.  Rather than define them all here, and then all at the 
// wrapper level again, I'll just pick one to implement here.

processinginstruction.prototype = Object.create(node.prototype, {
    nodeType: constant(PROCESSING_INSTRUCTION_NODE),
    nodeName: attribute(function() { return this.target; }),
    nodeValue: attribute(function() { return this.data; },
			 function(d) {
			     this.data = d;
			     if (this.rooted)
				 this.ownerDocument.mutateValue(this);
			 })
});