defineLazyProperty(impl, "Text", function() {
    function Text(doc, data) {
        this.ownerDocument = doc;
        this._data = data;
    }
    
    var nodeValue = attribute(function() { return this._data; },
                              function(v) { 
                                  this._data = v;
                                  if (this.root)
                                      this.root.mutateValue(this);
                              });
    
    Text.prototype = Object.create(impl.Leaf.prototype, {
        nodeType: constant(TEXT_NODE),
        nodeName: constant("#text"),
        // These three attributes are all the same.
        // The data attribute has a [TreatNullAs=EmptyString] but we'll
        // implement that at the interface level
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
    });

    return Text;
});