function ActiveFormattingElements() {
    this.list = [];
}

ActiveFormattingElements.prototype.MARKER = {};

ActiveFormattingElements.prototype.insertMarker = function() {
    push(this.list, this.MARKER);
};

ActiveFormattingElements.prototype.push = function(elt) {
    // Scan backwards: if there are already 3 copies of this element before
    // we encounter a marker, then drop the last one
    var count = 0;
    for(var i = this.list.length-1; i >= 0; i--) {
        if (this.list[i] === MARKER) break;
        if (equal(elt, this.list[i])) {  // equal() is defined below
            count++;
            if (count === 3) {
                splice(this.list, i, 1);
                break;
            }
        }
    }

    // Now push the element onto the list
    push(this.list, elt);

    // This function defines equality of two elements.
    // It is different than Node.isEqualNode() because
    // it doesn't check the namespace prefix, only the namespace.
    // And it also doesn't check children.
    function equal(a, b) {
        if (a.localName !== b.localName ||
            a.namespaceURI !== b.namespaceURI) return false;
        if (a._numattrs !== b._numattrs) return false;
        for(var i = 0, n = a._numattrs; i < n; i++) {
            let aa = a._attr(i);
            if (!b.hasAttributeNS(aa.namespaceURI, aa.localName))
                return false;
            if (b.getAttributeNS(aa.namespaceURI,aa.localName) !== aa.value)
                return false;
        }

        return true;
    }
};

ActiveFormatttingElements.prototype.reconstruct = function() {
    
};
