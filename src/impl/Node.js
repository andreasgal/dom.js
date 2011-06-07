defineLazyProperty(impl, "Node", function() {
    // All nodes have a nodeType and an ownerDocument.
    // Once inserted, they also have a parentNode.
    // This is an abstract class; all nodes in a document are instances
    // of a subtype, so all the properties are defined by more specific
    // constructors.
    function Node() {}

    Node.prototype = Object.create(Object.prototype, {
	
	parentElement: attribute(function() {
	    return (this.parentNode && this.parentNode.nodeType===ELEMENT_NODE)
		? this.parentNode
		: null
	}),
	
	hasChildNodes: constant(function() {  // Overridden in leaf.js
	    return this.childNodes.length > 0;
	}),

	firstChild: attribute(function() {
	    return this.childNodes.length === 0
		? null
		: this.childNodes[0];
	}),
	
	lastChild: attribute(function() {
	    return this.childNodes.length === 0
		? null
		: this.childNodes[this.childNodes.length-1];
	}),

	previousSibling: attribute(function() {
	    if (!this.parentNode) return null;
	    let sibs = this.parentNode.childNodes, i = this.index;
	    return i === 0
		? null
		: sibs[i-1]
	}),

	nextSibling: attribute(function() {
	    if (!this.parentNode) return null;
	    let sibs = this.parentNode.childNodes, i = this.index;
	    return i+1 === sibs.length
		? null
		: sibs[i+1]
	}),

	insertBefore: constant(function insertBefore(child, refChild) {
	    let parent = this;
	    if (refChild === null) return this.appendChild(child);
	    if (refChild.parentNode !== parent) NotFoundError();
	    if (child.isAncestor(parent)) HierarchyRequestError();
	    if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
	    parent.ensureSameDoc(child);
	    child.insert(parent, refChild.index);
	    return child;
	}),


	appendChild: constant(function(child) {
	    let parent = this;
	    if (child.isAncestor(parent)) HierarchyRequestError();
	    if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
	    parent.ensureSameDoc(child);
	    child.insert(parent, parent.childNodes.length);
	    return child;
	}),

	removeChild: constant(function removeChild(child) {
	    let parent = this;
	    if (child.parentNode !== parent) NotFoundError();
	    child.remove();
	    return child;
	}),

	replaceChild: constant(function replaceChild(newChild, oldChild) {
	    let parent = this;
	    if (oldChild.parentNode !== parent) NotFoundError();
	    if (newChild.isAncestor(parent)) HierarchyRequestError();
	    parent.ensureSameDoc(newChild);

	    let refChild = oldChild.nextSibling;
	    oldChild.remove();
	    return parent.insertBefore(newChild, refChild);
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
		// The spec's algorithm says to call adoptNode
		// unconditionally, which will remove it from its current
		// location in the document even it if is not changing
		// documents.  I don't do that here because that would cause a
		// lot of unnecessary uproot and reroot mutation events.
		if (that.ownerDocument !== ownerdoc)
		    ownerdoc.adoptNode(that);
	    }
	    
	    // XXX: this step does not seem necessary.
	    // If mutation events are added, however, it becomes necessary
	    if (that.ownerDocument !== ownerdoc) HierarchyRequestError();
	}),

	// Remove this node from its parent
	remove: constant(function remove() {
	    // Remove this node from its parents array of children
	    splice(this.parentNode.childNodes, this.index, 1);
	    // Forget this node's parent
	    delete this.parentNode;
	    // Send mutation events if necessary
	    if (this.rooted) this.ownerDocument.mutateRemove(this);
	}),

	// Insert this node as a child of parent at the specified index,
	// firing mutation events as necessary
	insert: constant(function insert(parent, index) {
	    let child = this, kids = parent.childNodes;

	    // Special case for document fragments
	    if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
		let  c;
		while(c = child.firstChild)	c.insert(parent, index++);
		return;
	    }

	    // If both the child and the parent are rooted, then we want to
	    // transplant the child without uprooting and rerooting it.
	    if (child.rooted && parent.rooted) {
		// Remove the child from its current position in the tree
		// without calling remove(), since we don't want to uproot it.
		let curpar = child.parentNode, curidx = child.index;
		splice(child.parentNode.childNodes, child.index, 1);

		// And insert it as a child of its new parent
		child.parentNode = parent;
		splice(kids, index, 0, child);
		child._index = index;              // Optimization

		// Generate a move mutation event
		parent.ownerDocument.mutateMove(child);
	    }
	    else {
		// If the child already has a parent, it needs to be
		// removed from that parent, which may also uproot it
		if (child.parentNode) child.remove();
		
		// Now insert the child into the parent's array of children
		child.parentNode = parent;
		splice(kids, index, 0, child);
		child._index = index;              // Optimization
		
		// And root the child if necessary
		if (parent.rooted) parent.ownerDocument.mutateInsert(child);
	    }
	}),

    });

    return Node;
});