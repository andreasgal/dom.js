// XXX: Attributes.js now calls the Attr() constructor with no value.
// Values are always set through the value attribute (or, when
// implemented rawValue to do no conversion) so that mutation events
// can be sent and other processing be done in the same way for newly
// created attributes as existing ones.

defineLazyProperty(impl, "Attr", function() {

    function Attr(elt, lname, value, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.data = value;   // See prototype for value getter/setter
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
        this.name = prefix ? prefix + ":" + lname : lname;
    }

    Attr.prototype = O.create(Object.prototype, {
        _idlName: constant("Attr"),
        value: attribute(function() { return this.data; },
                         function(v) { 
                             let oldval = this.data;
                             this.data = v;
                             if (this.ownerElement.rooted)
                                 this.ownerElement.ownerDocument.mutateAttr(
                                     this,
                                     oldval);
                         }),

        clone: constant(function clone(e) {
            return new impl.Attr(e, this.localName, this.data, 
                                 this.prefix, this.namespaceURI);
        }),

        isEqual: constant(function isEqual(n) {
            return this.localName === n.localName &&
                this.data === n.data &&
                this.prefix === n.prefix &&
                this.namespaceURI === n.namespaceURI;
        }),
    });

    return Attr;
});