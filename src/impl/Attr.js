defineLazyProperty(impl, "Attr", function() {

    function Attr(elt, lname, value, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        // DOM Attr objects are no longer Nodes, but we still give them a type
        // because we need that property to make the wrap() method work.
        this.nodeType = ATTRIBUTE_NODE;

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.data = value;   // See prototype for value getter/setter
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
        this.name = prefix ? prefix + ":" + lname : lname;
    }

    Attr.prototype = Object.create(Object.prototype, {
        value: attribute(function() { return this.data; },
                         function(v) { 
                             let oldval = this.data;
                             this.data = v;
                             if (this.ownerElement.root)
                                 this.ownerElement.root.mutateAttr(this,oldval);
                         })
    });

    return Attr;
});