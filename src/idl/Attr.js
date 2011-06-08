defineLazyProperty(global, "Attr", function() {
    return idl.Attr.publicInterface;
}, true);

defineLazyProperty(idl, "Attr", function() {
    return implementIDLInterface({
        name: "Attr",
	members: {
	    // readonly attribute DOMString? namespaceURI;
	    get namespaceURI() { return unwrap(this).namespace; },

	    // readonly attribute DOMString? prefix;
	    get prefix() { return unwrap(this).prefix },

	    // readonly attribute DOMString localName;
	    get localName() { return unwrap(this).lname; },

	    // readonly attribute DOMString name;
	    get name() { return unwrap(this).qname; },

	    //          attribute DOMString value;
	    get value() { return unwrap(this).value; },
	    set value(newval) { unwrap(this).value = String(newval); }
	}
    });
});
