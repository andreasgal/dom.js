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
	    get target() { return $(this).target },

	    // attribute DOMString data;
	    get data() { return $(this).data; },
	    set data(newval) {
		$(this).data = String(newval);
	    },
	    
	    // Node attributes that we can make concrete here
	    nodeType: PROCESSING_INSTRUCTION_NODE,

	    // This getter function should be the same as for target
	    get nodeName() { return $(this).target; },

	    // ProcessingInstruction nodes never have children, so
	    // there are a number of Node methods that we can override.
	    hasChildNodes: function hasChildNodes() { return false; },

	    // These properties will be automatically made read-only by
	    // implementIDLInterface()
	    firstChild: null,
	    lastChild: null,
	    childNodes: DOM.emptyNodeList, 

	    // These methods do nothing but throw
            insertBefore: hierarchyRequestError,
            replaceChild: hierarchyRequestError,
            removeChild: hierarchyRequestError,
            appendChild: hierarchyRequestError,

	    // These are some Node methods that behave differently for
	    // different types of nodes.  Implement specialized versions here
            get nodeValue() { nyi(); },
            set nodeValue(newval) { nyi(); },
            get textContent() { nyi(); },
            set textContent(newval) { nyi(); },

	}
    });
});
