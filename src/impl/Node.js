defineLazyProperty(impl, "Node", function() {
    // All nodes have a nodeType and an ownerDocument.
    // Once inserted, they also have a parentNode.
    // This is an abstract class; all nodes in a document are instances
    // of a subtype, so all the properties are defined by more specific
    // constructors.
    function Node() {
    }

    Node.prototype = Object.create(Object.prototype, {
        
        // XXX: the baseURI attribute is defined by dom core, but 
        // a correct implementation of it requires HTML features, so 
        // we'll come back to this later.
        baseURI: attribute(nyi),

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

        compareDocumentPosition:constant(function compareDocumentPosition(that){
            // Basic algorithm for finding the relative position of two nodes.
            // Make a list the ancestors of each node, starting with the 
            // document element and proceeding down to the nodes themselves.
            // Then, loop through the lists, looking for the first element
            // that differs.  The order of those two elements give the
            // order of their descendant nodes.  Or, if one list is a prefix
            // of the other one, then that node contains the other.

            if (this === that) return 0;

            // If they're not owned by the same document or if one is rooted
            // and one is not, then they're disconnected.
            if (this.ownerDocument != that.ownerDocument ||
                this.root !== that.root)
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            // Get arrays of ancestors for this and that
            let these = [], those = []; 
            for(let n = this; n !== null; n = n.parentNode) push(these, n);
            for(let n = that; n !== null; n = n.parentNode) push(those, n);
            these.reverse();  // So we start with the outermost
            those.reverse();

            if (these[0] !== those[0]) // No common ancestor
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            let n = Math.min(these.length, those.length);
            for(let i = 1; i < n; i++) {
                if (these[i] !== those[i]) {
                    // We found two different ancestors, so compare
                    // their positions
                    if (these[i].index < those[i].index)
                        return DOCUMENT_POSITION_FOLLOWING;
                    else
                        return DOCUMENT_POSITION_PRECEDING;
                }
            }

            // If we get to here, then one of the nodes (the one with the
            // shorter list of ancestors) contains the other one.
            if (these.length < those.length) 
                return (DOCUMENT_POSITION_FOLLOWING + 
                        DOCUMENT_POSITION_CONTAINED_BY);
            else
                return (DOCUMENT_POSITION_PRECEDING + 
                        DOCUMENT_POSITION_CONTAINS);
        }),

        isSameNode: constant(function isSameNode(node) {
            return this === node;
        }),
        

        // This method implements the generic parts of node equality testing
        // and defers to the (non-recursive) type-specific isEqual() method
        // defined by subclasses
        isEqualNode: constant(function isEqualNode(node) {
            if (!node) return false;
            if (node.nodeType !== this.nodeType) return false;

            // Check for same number of children
            // Check for children this way because it is more efficient
            // for childless leaf nodes.
            let n; // number of child nodes
            if (!this.firstChild) {
                n = 0;
                if (node.firstChild) return false;
            }
            else {
                n = this.childNodes.length;
                if (node.childNodes.length != n) return false;
            }

            // Check type-specific properties for equality
            if (!this.isEqual(node)) return false;

            // Now check children for equality
            for(let i = 0; i < n; i++) {
                let c1 = this.childNodes[i], c2 = node.childNodes[i];
                if (!c1.isEqualNode(c2)) return false;
            }
            
            return true;
        }),

        // This method delegates shallow cloning to a clone() method
        // that each concrete subclass must implement
        cloneNode: constant(function(deep) {
            // Clone this node
            let clone = this.clone();

            // Handle the recursive case if necessary
            if (deep && this.firstChild) {
                for(let i = 0, n = this.childNodes.length; i < n; i++) {
                    clone.appendChild(this.childNodes[i].cloneNode(true));
                }
            }

            return clone;
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
            if (this.root !== that.root) return false;

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

            // Update the structure id for all ancestors
            this.parentNode.modify();

            // Forget this node's parent
            delete this.parentNode;

            // Send mutation events if necessary
            if (this.root) this.root.mutateRemove(this);
        }),

        // Remove all of this node's children.  This is a minor 
        // optimization that only calls modify() once.
        removeChildren: constant(function removeChildren() {
            let root = this.root;
            for(let i = 0, n = this.childNodes.length; i < n; i++) {
                delete this.childNodes[i].parentNode;
                if (root) root.mutateRemove(this.childNodes[i]);
            }
            this.childNodes.length = 0; // Forget all children
            this.modify();              // Update last modified type once only
        }),

        // Insert this node as a child of parent at the specified index,
        // firing mutation events as necessary
        insert: constant(function insert(parent, index) {
            let child = this, kids = parent.childNodes;

            // Special case for document fragments
            if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
                let  c;
                while(c = child.firstChild)
                    c.insert(parent, index++);
                return;
            }

            // If both the child and the parent are rooted, then we want to
            // transplant the child without uprooting and rerooting it.
            if (child.root && parent.root) {
                // Remove the child from its current position in the tree
                // without calling remove(), since we don't want to uproot it.
                let curpar = child.parentNode, curidx = child.index;
                splice(child.parentNode.childNodes, child.index, 1);
                curpar.modify();

                // And insert it as a child of its new parent
                child.parentNode = parent;
                splice(kids, index, 0, child);
                child._index = index;              // Optimization
                parent.modify();

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
                parent.modify();
                child._index = index;              // Optimization
                
                // And root the child if necessary
                if (parent.root) parent.root.mutateInsert(child);
            }
        }),


        // Return the lastModified value for this node. (For use as a
        // cache invalidation mechanism. If the node does not already
        // have one, initialize it from the owner document's modclock
        // property.  (Note that modclock does not return the actual
        // time; it is simply a counter incremented on each document
        // modification)
        lastModified: attribute(function() {
            if (!this._lastModified)
                this._lastModified = this.doc.modclock;
                
            return this._lastModified;
        }),

        // Increment the owner document's modclock and use the new
        // value to update the lastModified value for this node and
        // all of its ancestors.  Nodes that have never had their
        // lastModified value queried do not need to have a
        // lastModified property set on them since there is no
        // previously queried value to ever compare the new value
        // against, so only update nodes that already have a
        // _lastModified property.
        modify: constant(function() {
            let time = ++this.doc.modclock;
            for(let n = this; n; n = n.parentElement)
                if (n._lastModified) n._lastModified = time;

        }),

        // This attribute is not part of the DOM but is quite helpful.
        // It returns the document with which a node is associated.  Usually
        // this is the ownerDocument. But ownerDocument is null for the
        // document object itself, so this is a handy way to get the document
        // regardless of the node type
        doc: attribute(function() {
            return this.ownerDocument || this;
        })


    });

    return Node;
});