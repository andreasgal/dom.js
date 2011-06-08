defineLazyProperty(global, "ProcessingInstruction", function() {
    return iface.ProcessingInstruction.publicInterface;
}, true);

defineLazyProperty(iface, "ProcessingInstruction", function() {
    return implementIDLInterface({
        name: "ProcessingInstruction",
        superclass: iface.Node,
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
