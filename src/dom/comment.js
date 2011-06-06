const comment = (function() {
    function comment(doc, data) {
	this.ownerDocument = doc;
	this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
			      function(v) { 
				  this._data = v;
				  if (this.rooted)
				      this.ownerDocument.mutateValue(this);
			      });
    
    comment.prototype = Object.create(leaf.prototype, {
	nodeType: constant(COMMENT_NODE),
	nodeName: constant("#comment"),
	nodeValue: nodeValue,
	textContent: nodeValue,
	data: nodeValue,
    });
    
    return comment;
}());