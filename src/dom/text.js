const text = (function() {
    function text(doc, data) {
	this.ownerDocument = doc;
	this.data = _data;
    }
    
    var nodeValue = attribute(function() { return this._data; },
			      function(v) { 
				  this._data = v;
				  if (this.rooted)
				      this.ownerDocument.mutateValue(this);
			      });
    
    text.prototype = Object.create(leaf.prototype, {
	nodeType: constant(TEXT_NODE),
	nodeName: constant("#text"),
	// These three attributes are all the same.
	// The data attribute has a [TreatNullAs=EmptyString] but we'll
	// implement that in the wrapper level
	nodeValue: nodeValue,
	textContent: nodeValue,
	data: nodeValue,
    });

    return text;
}());