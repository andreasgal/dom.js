defineLazyProperty(impl, "Node", function() {
    // All nodes have a nodeType and an ownerDocument.
    // Once inserted, they also have a parentNode.
    // This is an abstract class; all nodes in a document are instances
    // of a subtype, so all the properties are defined by more specific
    // constructors.
    function Node() {
    }

    Node.prototype = O.create(impl.EventTarget.prototype, {

        // Node that are not inserted into the tree inherit a null parent
        // XXX
        // Can't use constant(null) here because then I couldn't set a non-null
        // value that would override the inherited constant.  Perhaps that
        // means I shouldn't use the prototype and should just set the
        // value in each node constructor?
        parentNode: { value: null, writable: true },

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
            var sibs = this.parentNode.childNodes, i = this.index;
            return i === 0
                ? null
                : sibs[i-1]
        }),

        nextSibling: attribute(function() {
            if (!this.parentNode) return null;
            var sibs = this.parentNode.childNodes, i = this.index;
            return i+1 === sibs.length
                ? null
                : sibs[i+1]
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
            var parent = this;
            if (refChild === null) return this.appendChild(child);
            if (refChild.parentNode !== parent) NotFoundError();
            if (child.isAncestor(parent)) HierarchyRequestError();
            if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
            parent.ensureSameDoc(child);
            child.insert(parent, refChild.index);
            return child;
        }),


        appendChild: constant(function(child) {
            var parent = this;
            if (child.isAncestor(parent)) HierarchyRequestError();
            if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
            parent.ensureSameDoc(child);
            child.insert(parent, parent.childNodes.length);
            return child;
        }),

        removeChild: constant(function removeChild(child) {
            var parent = this;
            if (child.parentNode !== parent) NotFoundError();
            child.remove();
            return child;
        }),

        replaceChild: constant(function replaceChild(newChild, oldChild) {
            var parent = this;
            if (oldChild.parentNode !== parent) NotFoundError();
            if (newChild.isAncestor(parent)) HierarchyRequestError();
            parent.ensureSameDoc(newChild);

            var refChild = oldChild.nextSibling;
            oldChild.remove();
            parent.insertBefore(newChild, refChild);
            return oldChild;
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
                this.rooted !== that.rooted)
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            // Get arrays of ancestors for this and that
            var these = [], those = [];
            for(var n = this; n !== null; n = n.parentNode) push(these, n);
            for(var n = that; n !== null; n = n.parentNode) push(those, n);
            these.reverse();  // So we start with the outermost
            those.reverse();

            if (these[0] !== those[0]) // No common ancestor
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            var n = Math.min(these.length, those.length);
            for(var i = 1; i < n; i++) {
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
            var n; // number of child nodes
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
            for(var i = 0; i < n; i++) {
                var c1 = this.childNodes[i], c2 = node.childNodes[i];
                if (!c1.isEqualNode(c2)) return false;
            }

            return true;
        }),

        // This method delegates shallow cloning to a clone() method
        // that each concrete subclass must implement
        cloneNode: constant(function(deep) {
            // Clone this node
            var clone = this.clone();

            // Handle the recursive case if necessary
            if (deep && this.firstChild) {
                for(var i = 0, n = this.childNodes.length; i < n; i++) {
                    clone.appendChild(this.childNodes[i].cloneNode(true));
                }
            }

            return clone;
        }),

        lookupPrefix: constant(function lookupPrefix(ns) {
            var e;
            if (ns === "") return null;
            switch(this.nodeType) {
            case ELEMENT_NODE:
                return this.locateNamespacePrefix(ns);
            case DOCUMENT_NODE:
                e = this.documentElement;
                return e ? e.locateNamespacePrefix(ns) : null;
            case DOCUMENT_TYPE_NODE:
            case DOCUMENT_FRAGMENT_NODE:
                return null;
            default:
                e = this.parentElement;
                return e ? e.locateNamespacePrefix(ns) : null;
            }
        }),


        lookupNamespaceURI: constant(function lookupNamespaceURI(prefix) {
            var e;
            switch(this.nodeType) {
            case ELEMENT_NODE:
                return this.locateNamespace(prefix);
            case DOCUMENT_NODE:
                e = this.documentElement;
                return e ? e.locateNamespace(prefix) : null;
            case DOCUMENT_TYPE_NODE:
            case DOCUMENT_FRAGMENT_NODE:
                return null;
            default:
                e = this.parentElement;
                return e ? e.locateNamespace(prefix) : null;
            }
        }),

        isDefaultNamespace: constant(function isDefaultNamespace(ns) {
            var defaultns = this.lookupNamespaceURI(null);
            if (defaultns == null) defaultns = "";
            return ns === defaultns;
        }),

        // Utility methods for nodes.  Not part of the DOM

        // Return the index of this node in its parent.
        // Throw if no parent, or if this node is not a child of its parent
        index: attribute(function() {
            assert(this.parentNode);
            var kids = this.parentNode.childNodes
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
            for(var e = that; e; e = e.parentNode) {
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
            var ownerdoc = this.ownerDocument || this;

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
            if (this.rooted) this.ownerDocument.mutateRemove(this);
        }),

        // Remove all of this node's children.  This is a minor
        // optimization that only calls modify() once.
        removeChildren: constant(function removeChildren() {
            var root = this.rooted ? this.ownerDocument : null;
            for(var i = 0, n = this.childNodes.length; i < n; i++) {
                delete this.childNodes[i].parentNode;
                if (root) root.mutateRemove(this.childNodes[i]);
            }
            this.childNodes.length = 0; // Forget all children
            this.modify();              // Update last modified type once only
        }),

        // Insert this node as a child of parent at the specified index,
        // firing mutation events as necessary
        insert: constant(function insert(parent, index) {
            var child = this, kids = parent.childNodes;

            // If we are already a child of the specified parent, then t
            // the index may have to be adjusted.
            if (child.parentNode === parent) {
                var currentIndex = child.index;
                // If we're not moving the node, we're done now
                // XXX: or do DOM mutation events still have to be fired?
                if (currentIndex === index) return;

                // If the child is before the spot it is to be inserted at,
                // then when it is removed, the index of that spot will be
                // reduced.
                if (currentIndex < index) index--;
            }

            // Special case for document fragments
            // XXX: it is not at all clear that I'm handling this correctly.
            // Scripts should never get to see partially
            // inserted fragments, I think.  See:
            // http://lists.w3.org/Archives/Public/www-dom/2011OctDec/0130.html
            if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
                var  c;
                while(c = child.firstChild)
                    c.insert(parent, index++);
                return;
            }

            // If both the child and the parent are rooted, then we want to
            // transplant the child without uprooting and rerooting it.
            if (child.rooted && parent.rooted) {
                // Remove the child from its current position in the tree
                // without calling remove(), since we don't want to uproot it.
                var curpar = child.parentNode, curidx = child.index;
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
                if (parent.rooted) parent.ownerDocument.mutateInsert(child);
            }

            // Script tags use this hook
            if (parent._addchildhook) parent._addchildhook(this);
        }),


        // Return the lastModTime value for this node. (For use as a
        // cache invalidation mechanism. If the node does not already
        // have one, initialize it from the owner document's modclock
        // property.  (Note that modclock does not return the actual
        // time; it is simply a counter incremented on each document
        // modification)
        lastModTime: attribute(function() {
            if (!this._lastModTime) {
                this._lastModTime = this.doc.modclock;
            }

            return this._lastModTime;
        }),

        // Increment the owner document's modclock and use the new
        // value to update the lastModTime value for this node and
        // all of its ancestors.  Nodes that have never had their
        // lastModTime value queried do not need to have a
        // lastModTime property set on them since there is no
        // previously queried value to ever compare the new value
        // against, so only update nodes that already have a
        // _lastModTime property.
        modify: constant(function() {
            var time = ++this.doc.modclock;
            for(var n = this; n; n = n.parentElement) {
                if (n._lastModTime) {
                    n._lastModTime = time;
                }
            }
        }),

        // This attribute is not part of the DOM but is quite helpful.
        // It returns the document with which a node is associated.  Usually
        // this is the ownerDocument. But ownerDocument is null for the
        // document object itself, so this is a handy way to get the document
        // regardless of the node type
        doc: attribute(function() {
            return this.ownerDocument || this;
        }),


        // If the node has a nid (node id), then it is rooted in a document
        rooted: attribute(function() {
            return !!this._nid;
        }),


        // Convert the children of a node to an HTML string.
        // This is used by the innerHTML getter
        // The serialization spec is at:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#serializing-html-fragments
        serialize: constant(function() {
            var s = "";
            for(var i = 0, n = this.childNodes.length; i < n; i++) {
                var kid = this.childNodes[i];
                switch(kid.nodeType) {
                case COMMENT_NODE:
                    s += "<!--" + kid.data + "-->";
                    break;
                case PROCESSING_INSTRUCTION_NODE:
                    s += "<?" + kid.target + " " + kid.data + ">";
                    break;
                case DOCUMENT_TYPE_NODE:
                    s += "<!DOCTYPE " + kid.name + ">";
                    break;
                case TEXT_NODE:
                case CDATA_SECTION_NODE:
                    var parenttag;
                    if (this.nodeType === ELEMENT_NODE &&
                        this.namespaceURI === HTML_NAMESPACE)
                        parenttag = this.tagName;
                    else
                        parenttag = "";
                    switch(parenttag) {
                    case "STYLE":
                    case "SCRIPT":
                    case "XMP":
                    case "IFRAME":
                    case "NOEMBED":
                    case "NOFRAMES":
                    case "PLAINTEXT":
                    case "NOSCRIPT":
                        s += kid.data;
                        break;
                    default:
                        s += escape(kid.data);
                        break;
                    }
                    break;
                case ELEMENT_NODE:
                    serializeElement(kid);
                    break;
                default:
                    InvalidStateError();
                }
            }

            return s;

            function serializeElement(kid) {
                var html = false, tagname;
                switch(kid.namespaceURI) {
                case HTML_NAMESPACE:
                    html = true;
                    /* fallthrough */
                case SVG_NAMESPACE:
                case MATHML_NAMESPACE:
                    tagname = kid.localName;
                    break;
                default:
                    tagname = kid.tagName;
                }

                s += '<' + tagname;

                for(var i = 0, n = kid._numattrs; i < n; i++) {
                    var a = kid._attr(i);
                    s += ' ' + attrname(a) + '="' + escapeAttr(a.value) + '"';
                }
                s += '>';

                var htmltag = html?tagname:"";
                switch(htmltag) {

                case "area":
                case "base":
                case "basefont":
                case "bgsound":
                case "br":
                case "col":
                case "command":
                case "embed":
                case "frame":
                case "hr":
                case "img":
                case "input":
                case "keygen":
                case "link":
                case "meta":
                case "param":
                case "source":
                case "track":
                case "wbr":
                    return;  // These can't have kids, so we're done

                case 'pre':
                case 'textarea':
                case 'listing':
                    s += "\n"; // Extra newline for these
                    /* fallthrough */
                default:
                    // Serialize children and add end tag for all others
                    s += kid.serialize();
                    s += "</" + tagname + ">";
                }
            }

            function escape(s) {
                return s.replace(/[&<>\u00A0]/g, function(c) {
                    switch(c) {
                    case "&": return "&amp;";
                    case "<": return "&lt;";
                    case ">": return "&gt;";
                    case "\u00A0": return "&nbsp;";
                    }
                });
            }

            function escapeAttr(s) {
                return s.replace(/[&"\u00A0]/g, function(c) {
                    switch(c) {
                    case '&': return "&amp;";
                    case '"': return "&quot;";
                    case '\u00A0': return "&nbsp;";
                    }
                });
            }

            function attrname(a) {
                switch(a.namespaceURI) {
                case null: return a.localName;
                case XML_NAMESPACE: return "xml:" + a.localName;
                case XLINK_NAMESPACE: return "xlink:" + a.localName;
                case XMLNS_NAMESPACE:
                    if (a.localName === "xmlns") return "xmlns";
                    else return "xmlns:" + a.localName;
                default:
                    return a.name;
                }
            }
        }),

    });

    return Node;
});