defineLazyProperty(global, "ProcessingInstruction", function() {
    return DOM.ProcessingInstruction.interface;
}, true);

defineLazyProperty(DOM, "ProcessingInstruction", function() {
    return implementIDLInterface({
        name: "ProcessingInstruction",
        superclass: DOM.Node,
	init: function(impl) {},
	members: {
	    // readonly attribute DOMString target
	    get target() { return unwrap(this).target },

	    // attribute DOMString data;
	    get data() { return unwrap(this).data; },
	    set data(newval) {
		unwrap(this).setText(String(newval));
	    },
	}
    });
});
