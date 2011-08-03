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
    
    Comment.prototype = O.create(impl.CharacterData.prototype, {
        nodeType: constant(COMMENT_NODE),
        nodeName: constant("#comment"),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
        length: attribute(function() { return this._data.length; }),
   
        // Utility methods
        clone: constant(function clone() {
            return new impl.Comment(this.ownerDocument, this._data);
        }),
        toObject: constant(function toObject() {
            return { type: COMMENT_NODE, data: this._data };
        }),
    });
    
    return Comment;
});