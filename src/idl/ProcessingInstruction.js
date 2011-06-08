defineLazyProperty(global, "ProcessingInstruction", function() {
    return idl.ProcessingInstruction.publicInterface;
}, true);

defineLazyProperty(idl, "ProcessingInstruction", function() {
    return implementIDLInterface({
        name: "ProcessingInstruction",
        superclass: idl.Node,
	constructor: function ProcessingInstruction() {},
	members: {
	    // readonly attribute DOMString target
	    get target() { return unwrap(this).target },

	    // attribute DOMString data;
	    get data() { return unwrap(this).data; },
	    set data(newval) {
		unwrap(this).data = String(newval);
	    },
	}
    });
});
