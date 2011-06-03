function text(doc, data) {
    this.ownerDocument = doc;
    this.data = data;
}

text.prototype = Object.create(leaf.prototype, {
    nodeType: constant(TEXT_NODE),
    nodeName: constant("#text"),
    nodeValue: attribute(function() { return this.data; },
			 function(v) { 
			     this.data = v;
			     if (this.rooted)
				 this.ownerDocument.mutateValue(this);
			 }),
});

