defineLazyProperty(impl, "Text", function() {
    function Text(doc, data) {
        this.nodeType = TEXT_NODE;
        this.ownerDocument = doc;
        this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
                              function(v) {
                                  if (v === this._data) return;
                                  this._data = v;
                                  if (this.rooted)
                                      this.ownerDocument.mutateValue(this);
                                  if (this.parentNode &&
                                      this.parentNode._textchangehook)
                                      this.parentNode._textchangehook(this);
                              });

    Text.prototype = O.create(impl.CharacterData.prototype, {
        _idlName: constant("Text"),
//        nodeType: constant(TEXT_NODE),
        nodeName: constant("#text"),
        // These three attributes are all the same.
        // The data attribute has a [TreatNullAs=EmptyString] but we'll
        // implement that at the interface level
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
        length: attribute(function() { return this._data.length; }),

        splitText: constant(function splitText(offset) {
            if (offset > this._data.length) IndexSizeError();

            var newdata = substring(this._data, offset),
                newnode = this.ownerDocument.createTextNode(newdata);
            this.data = substring(this.data, 0, offset);

            var parent = this.parentNode;
            if (parent !== null)
                parent.insertBefore(newnode, this.nextSibling);

            return newnode;
        }),

        // XXX
        // wholeText and replaceWholeText() are not implemented yet because
        // the DOMCore specification is considering removing or altering them.
        wholeText: attribute(nyi),
        replaceWholeText: constant(nyi),

        // Utility methods
        clone: constant(function clone() {
            return new impl.Text(this.ownerDocument, this._data);
        }),

    });

    return Text;
});