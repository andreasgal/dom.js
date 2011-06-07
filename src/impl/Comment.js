defineLazyProperty(impl, "Comment", function() {
    function Comment(doc, data) {
	this.ownerDocument = doc;
	this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
			      function(v) { 
				  this._data = v;
				  if (this.rooted)
				      this.ownerDocument.mutateValue(this);
			      });
    
    Comment.prototype = Object.create(impl.Leaf.prototype, {
	nodeType: constant(COMMENT_NODE),
	nodeName: constant("#comment"),
	nodeValue: nodeValue,
	textContent: nodeValue,
	data: nodeValue,
    });
    
    return Comment;
});