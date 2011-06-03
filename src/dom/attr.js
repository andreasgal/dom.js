function attr(elt, lname, value, prefix, namespace) {
    // Always remember what element we're associated with.
    // We need this to property handle mutations
    this.ownerElement = elt;

    // DOM Attr objects are no longer Nodes, but we still give them a type
    // because we need that property to make the wrap() method work.
    this.nodeType = ATTRIBUTE_NODE;

    this.localName = lname;
    this.data = value;   // See prototype for value getter/setter
    this.prefix = prefix || null;
    this.namespaceURI = namespace || null;
    
    if (prefix) this.name = prefix + ":" + lname;
    else this.name = lname;
}

attr.prototype = Object.create(Object.prototype, {
    value: attribute(function() { return this.data; },
		     function(v) { 
			 this.data = v;
			 if (this.ownerElement.isrooted)
			     this.ownerElement.ownerDocument.mutateValue(this)
		     })
});