// dom.js uses two kinds of tree node objects.  nodes (with a
// lowercase n) are the internal data structures that hold the actual
// document data.  Nodes (with a capital N) are the public objects
// that implement DOM interfaces and do not have any properties other than the 
// accessor properties and methods defined by the DOM.
//
// Every Node must have a node to hold its actual data.
// But nodes can exist without any corresponding Node: Nodes are created
// as needed, when scripts use the DOM API to inspect the document tree.
//
// Since Node objects can't have properties, the mapping from Node to node
// is done with a WeakMap.  The mapping from node to Node is simpler:
// if a Node exists for the node, it is simply set on a property of the node.
//
// The methods in this file manage the mapping between nodes and Nodes
// 
const nodes = new WeakMap();
let lastkey = {}, lastvalue = undefined;

// Return the implementation object for the DOM Node n
// This method will throw a DOMException(NOT_FOUND_ERR) if n is
// null, undefined, a primitive, or an object with no mapping.
// This provides basic error checking for methods like Node.appendChild().
function unwrap(n) {
    // Simple optimization
    // If I ever remove or alter mappings, then this won't be valid anymore.
    if (node === lastkey) return lastvalue;

    try {
	let impl = nodes.get(node);

	// This happens if someone passes a bogus object to 
	// appendChild, for example. 
	if (!impl) throw new DOM.DOMException(NOT_FOUND_ERR);

	lastkey = node;
	lastvalue = impl;
	return impl;
    }
    catch(e) {
	// If n was null or not an object the WeakMap will raise a TypeError
	// TypeError might be the best thing to propagate, but DOM precedent
	// seems to be to do this:
	throw new DOM.DOMException(NOT_FOUND_ERR);
    }
}

// Return the interface object (a DOM node) for the implementation node n,
// creating it if necessary
function wrap(n) {
    if (!n.dom) {
	switch(n.type) {
	case ELEMENT_NODE:
	    n.dom = new DOM.Element(n);
	    break;
	case TEXT_NODE:
	    n.dom = new DOM.Text(n);
	    break;
	case COMMENT_NODE:
	    n.dom = new DOM.Comment(n);
	    break;
	case PROCESSING_INSTRUCTION_NODE:
	    n.dom = new DOM.ProcessingInstruction(n);
	    break;
	case DOCUMENT_FRAGMENT_NODE:
	case DOCUMENT_NODE:
	case DOCUMENT_TYPE_NODE:
	    // This should never occur.
	    // Nodes of these types are only created through the DOM and 
	    // should never be encountered in their bare state
	    assert(false, "unexpected bare node");
	}

	nodes.set(n, n.dom);
    }

    return n.dom;
}

