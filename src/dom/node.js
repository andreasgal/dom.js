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
function node() {
    this.parentNode = null;  // Null until inserted
}

node.prototype = Object.create(Object.prototype, {
    
    parentElement: attribute(function() {
	return (this.parentNode && this.parentNode.nodeType === ELEMENT_NODE)
	    ? this.parentNode
	    : null
    }),
    
    hasChildNodes: constant(function() {  // Overridden in leaf.js
	assert(this.childNodes !== null);
	return this.childNodes.length > 0;
    }),

    firstChild: attribute(function() {
	assert(this.childNodes !== null);
	return this.childNodes.length === 0
	    ? null
	    : this.childNodes[0];
    }),
    
    lastChild: attribute(function() {
	assert(this.childNodes !== null);
	return this.childNodes.length === 0
	    ? null
	    : this.childNodes[this.childNodes.length-1];
    }),

    previousSibling: attribute(function() {
	let sibs = this.parentNode.childNodes, i = this.index;
	return i === 0
	    ? null
	    : sibs[i-1]
    }),

    nextSibling: attribute(function() {
	let sibs = this.parentNode.childNodes, i = this.index;
	return i+1 === sibs.length
	    ? null
	    : sibs[i+1]
    }),


    // Node appendChild([NoNull] Node newChild);
    // The appendChild(newChild) method must run these steps:
    //
    //     If the context object is not a Document,
    //     DocumentFragment or Element, throw a
    //     HIERARCHY_REQUEST_ERR and terminate these steps.
    //
    //     If newChild is the context object or an ancestor of
    //     the context object throw a HIERARCHY_REQUEST_ERR
    //     and terminate these steps.
    //
    //     If newChild is a DocumentType node and its
    //     ownerDocument is not null throw a NOT_SUPPORTED_ERR
    //     exception and terminate these steps.
    //
    //     If newChild is a DocumentType node set its
    //     ownerDocument to the context object's
    //     ownerDocument.
    //
    //     If newChild is not a DocumentType node let newChild
    //     be the result of invoking the context object's
    //     ownerDocument adoptNode method with newChild as its
    //     argument.
    //
    //     Append newChild to the context object.
    //
    //     Return newChild.
    appendChild: constant(function(child) {
	let parent = this;
	if (child.isAncestor(parent)) HierarchyRequestError();
	if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();

	parent.ensureSameDoc(child);

	if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
	    let  c;
	    while(c = child.firstChild)	parent.appendChild(c);
	    return;
	}

	// If both the child and the parent are rooted, then we want to
	// transplant the child without uprooting and rerooting it.
	if (child.rooted && parent.rooted) {
	    // Remove the child from its current position in the tree
	    // without calling removeChild, since we don't want to uproot it.
	    let curpar = child.parentNode, idx = child.index;
	    splice(curpar.childNodes, i, 1);
	    // And append it to its new parent
	    child.parentNode = parent;
	    push(parent.childNodes, child);
	    // Generate a move mutation event
	    parent.ownerDocument.mutateMove(child);
	    return;
	}

	// If the child already has a parent, it needs to be removed from
	// that parent, which may also uproot it
	if (child.parentNode)
	    child.parentNode.removeChild(child);

	// Now append the child to the parent's array of children
	child.parentNode = parent;
	push(parent.childNodes, child);

	// And root the child if necessary
	if (parent.rooted) parent.ownerDocument.mutateInsert(child);
    }),


    // These are the EventTarget methods.
    // Since all nodes are event targets, we just put them here
    // rather than creating another level of prototype inheritance.
    addEventListener: constant(nyi),
    removeEventListener: constant(nyi),
    dispatchEvent: constant(nyi),

    // Utility methods for nodes.  Not part of the DOM

    // Return the index of this node in its parent.
    // Throw if no parent, or if this node is not a child of its parent
    index: attribute(function() {
	assert(this.parentNode);
	let kids = this.parentNode.childNodes
	if (this._index == undefined || kids[this._index] != this) {
	    this._index = A.indexOf(kids, this);
	    assert(this._index != -1);
	}
	return this._index;
    }),

    // Return true if this node is equal to or is an ancestor of that node
    // Note that nodes are considered to be ancestors of themselves
    isAncestor: constant(function(that) {
	// If they belong to different documents, then they're unrelated.
	if (this.ownerDocument != that.ownerDocument) return false;
	// If one is rooted and one isn't then they're not related
	if (this.rooted !== that.rooted) return false;

	// Otherwise check by traversing the parentNode chain
        for(let e = that; e; e = e.parentNode) {
            if (e === this) return true;
        }
        return false;
    }),

    // When a user agent is to ensure that two Nodes, old and new, are
    // in the same Document, it must run the following steps:
    //
    //     If new is a DocumentType, run the following steps:
    //
    //         If new's ownerDocument is not null, and it is not equal
    //         to old's ownerDocument, throw a WRONG_DOCUMENT_ERR
    //         exception and terminate these steps.
    //
    //         Otherwise, set its ownerDocument to old's
    //         ownerDocument.
    //
    //     Otherwise, invoke old's ownerDocument's adoptNode method
    //     with new as its argument.
    //
    //     If old's ownerDocument and new's ownerDocument are not the
    //     same, throw a HIERARCHY_REQUEST_ERR
    ensureSameDoc: constant(function(that) {
	// Get the owner of the node, the node itself, if it is a document
	let ownerdoc = this.ownerDocument || this;

	if (that.nodeType === DOCUMENT_TYPE_NODE) {
	    if (that.ownerDocument !== null && that.ownerDocument !== ownerdoc)
		WrongDocumentError();
	    that.ownerDocument = ownerdoc;
	}
	else {
	    // The spec's algorithm says to call adoptNode unconditionally,
	    // which will remove it from its current location in the document
	    // even it if is not changing documents.  I don't do that here
	    // because that would cause a lot of unnecessary uproot and
	    // reroot mutation events.
	    if (that.ownerDocument !== ownerdoc)
		ownerdoc.adoptNode(that);
	}
	
	if (this.ownerDocument !== that.ownerDocument) HierarchyRequestError();
    }),
});

