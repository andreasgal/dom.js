// DOM node type constants
const ELEMENT_NODE = 1;
const ATTRIBUTE_NODE = 2; // Historical, but we use it in wrap()
const TEXT_NODE = 3;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;


// All nodes have a nodeType and an ownerDocument.
// Once inserted, they also have a parentNode.
// This is an abstract class; all nodes in a document are instances
// of a subtype, so all the properties are defined by more specific
// constructors.
function node() {}

node.prototype = Object.create(eventtarget.prototype);

/*
 * XXX: just put the event target stuff here on the node
 *
    addEventListener: function addEventListener(type, listener, capture) {
	nyi();
    },
    removeEventListener: function addEventListener(type, listener, capture) {
	nyi();
    },
    dispatchEvent: function dispatchEvent(event) {
	nyi(); 
    }
*/