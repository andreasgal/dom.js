function comment(doc, data) {
    this.ownerDocument = doc;
    this.data = data;
}

comment.prototype = Object.create(leaf.prototype, {
    nodeType: constant(COMMENT_NODE),
    nodeName: constant("#comment"),
    nodeValue: attribute(function() { return this.data; },
			 function(v) { 
			     this.data = v;
			     if (this.rooted)
				 this.ownerDocument.mutateValue(this);
			 }),
});

