defineLazyProperty(global, "ProcessingInstruction", function() {
    return wrapper.ProcessingInstruction.interface;
}, true);

defineLazyProperty(wrapper, "ProcessingInstruction", function() {
    return implementIDLInterface({
        name: "ProcessingInstruction",
        superclass: wrapper.Node,
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
