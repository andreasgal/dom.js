// A basic set of tree construction and mutation primitives to enable
// a DOM-like, DOM-lite representation for HTML and XML documents.
// 
// The Tree class encapsulates a single document and its root node and
// defines methods for creating, inserting, and manipulating nodes.
// Nodes are instances of the node class.  (The node() constructor has
// a lowercase name to emphasize that it creates internal objects and
// to distinguish it from the external Node.)
//
// Element nodes have a list of attributes represented by an
// attributes object that contains attribute objects.  Again,
// lowercase constructor names to distinguish these from the external
// DOM apis
//
// This module defines an internal API and doesn't do error
// checking. It assumes that the parser code and public API code that
// calls it are doing the right thing.
// 
// node objects have the following properties:
//   tree: the containing Tree object
//   type: node type: uses DOM Node type constants
//   value: tag name for elements, text content for Text, Comment, and PI nodes
//   target: for PI nodes only
//   kids: an array of child nodes
//   parent: the parent node only exists once the node is inserted
//   attrs: an attributes object
//   publicId, systemId: for doctype nodes only
// 
// Implementation-specific properties include:
//    nid: an integer nodeid for communicating with a mutation handler
//    idx: probable index of the node within its parent, computed as needed
//      and cached
//    nodelist: a cached NodeList of the node's children
// 
// This tree representation does nothing special for elements and attributes
// that use namespaces. The qname (with prefix and colon) is used as the name.
// The higher-level DOM API can split this as needed, and also search for
// the xmlns attributes that map prefixes to URIs.
//
// We need nomenclature for the two kinds of insertion in this tree
// abstraction.  Nodes can be in 3 states.  When first created they
// have no parent and are "disconnected". When inserted into another
// node, they have a parent and are "inserted". And if a node has a
// parent and is a descendant of the document element at the root of
// the tree, we say that the node is "rooted".  When an element
// becomes rooted, a mutation event is generated.  Changes to
// disconnected and inserted elements do not cause any events: only
// changes to rooted elements generate mutation events.  When an
// element becomes rooted, it get a node id (and this can be used to
// distinguish rooted from unrooted elements).  When a node becomes
// rooted, all of its descendants become rooted, too.  When a rooted
// node is removed from its parent, it becomes disconnected.  All of
// its descendants must switch to the "inserted" state.
// 

// Dummy functions for handling for mutations
const nullMutationHandler = {
    append: function(node, parent) {},
    insert: function(node, target) {},
    moveAppend: function(node, parent) {},
    moveInsert: function(node, target) {},
    remove: function(node) {},
    setText: function(node, text) {},
    setAttribute: function(node, name, value) {}
};

function Tree(mutationHandler) {
    // The handler object has functions that forward mutations
    // If we don't get one, then use a stub.
    this.mutation = mutationHandler || nullMutationHandler;
    this.root = new node(this, DOCUMENT_NODE, null);
    this.root.kids = [];
    this.root.nid = 1;
    this.nextid = 2;    // id for next node to become rooted
}

Tree.prototype = {
    constructor: Tree,
    text: function text(t) {
	return new node(this, TEXT_NODE, t);
    },
    comment: function comment(t) {  
	return new node(this, COMMENT_NODE, t);
    },
    pi: function pi(target, data) {
	var n = new node(this, PROCESSING_INSTRUCTION_NODE, data);
	n.target = target;
	return n;
    },
    element: function element(tagname) {
	var n = new node(this, ELEMENT_NODE, tagname);
	n.kids = [];
	n.attrs = [];
	return n;
    },
    doctype: function doctype(root, pubid, sysid) {
	var n = new node(this, DOCTYPE_NODE, root);
	n.publicId = pubid;
	n.systemId = sysid;
	return n;
    },

    // The node has just been connected to the document
    // root. This means that insertion events must be generated
    // for it and all of its descendants
    rootAppend: function rootAppend(node, parent) {
        assert(!node.rooted());
        
        node.nid = this.nextid++; // mark it as rooted by assigning an id
        this.mutation.append(node, parent);
        
        // Now recurse to root each of the descendant nodes
        if (node.kids) {
	    let tree = this;
            foreach(node.kids, function(k) { tree.rootAppend(k, node); });
	}
    },

    rootBefore: function rootBefore(node, target) {
        assert(!node.rooted());
        
        node.nid = this.nextid++; // mark it as rooted by assigning an id
        this.mutation.insert(node, target);
        
        // Now recurse to root each of the descendant nodes
        // Note that we switch to rootAppend for the recursion
        if (node.kids) {
	    let tree = this;
            foreach(node.kids, function(k) { tree.rootAppend(k, node); });
	}
    },

    uproot: function uproot(node) {
        assert(node.rooted());

        // Generate the mutation event to uproot this node
        this.mutation.remove(node);

        // Recursively delete the nid prop that marks this node and
        // its descendants as rooted.
        function delnid(n) {
            delete n.nid;
            if (n.kids) foreach(n.kids, delnid);
        }
        delnid(node);
    }

};

function node(tree, type, value) {
    this.tree = tree;
    this.type = type;
    this.value = value;
}

node.prototype = {
    getAttribute: function getAttribute(qname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.qname === qname) return attr.value;
	}
	return null;
    },
    getAttributeNS: function getAttributeNS(ns, lname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.namespace === namespace &&	attr.lname === lname)
		return attr.value;
	}
	return null;
    },
    setAttribute: function setAttribute(qname, value) {
        assert(this.type === ELEMENT_NODE);

	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.qname === qname) {
		attr.value = value;
		if (this.rooted()) 	// Send mutation event
		    this.tree.mutation.setAttribute(this, qname, value);
		return;
	    }
	}
	push(this.attrs, new attribute(qname, value));
	// Send mutation event
        if (this.rooted()) this.tree.mutation.setAttribute(this, qname, value);
    },
    setAttributeNS: function setAttributeNS(ns, qname, value, prefix, lname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.namespace === ns && attr.lname == lname) {
		attr.prefix = prefix;
		attr.value = value;
		// XXX: fire a mutation event
		return;

	    }
	}
	push(this.attrs, new attribute(lname, value, prefix, ns));
	// XXX: fire a mutation event
	// XXX: may need to define a new event category for namespaced attrs
    },
    removeAttribute: function deleteAttribute(qname) {
        assert(this.type === ELEMENT_NODE);

	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.qname === qname) {
		splice(this.attrs, i, 1);
		// Mutation event
		if (this.rooted()) this.tree.mutation.setAttribute(this, qname);
		return;
	    }
	}
    },
    removeAttributeNS: function deleteAttribute(ns, lname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.namespace === namespace &&	attr.lname === lname) {
		splice(this.attrs, i, 1);
		// XXX: fire a mutation event
		// XXX: may need to define a new event category
		return;
	    }
	}
    },
    hasAttribute: function hasAttribute(qname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.qname === qname) return true;
	}
	return false;
    },
    hasAttributeNS: function hasAttribute(ns, lname) {
	for(let i = 0, n = this.attrs.length; i < n; i++) {
	    let attr = this.attrs[i];
	    if (attr.namespace === namespace &&	attr.lname === lname) {
		return true;
	    }
	}
	return false;
    },
    setText: function setText(text) {
        assert(this.type === TEXT_NODE ||
               this.type === COMMENT_NODE || 
               this.type === PROCESSING_INSTRUCTION_NODE);
        this.value = text;
        if (this.rooted()) this.tree.mutation.setText(this, text);
    },

    // Append this node as the last child of parent. If this node is
    // already in the tree, it will be moved from its current location.
    // Note that this method is called on the child node unlike the
    // DOM appendChild() function that is called on the parent.
    // 
    // XXX: add adoptNode() functionality to deal with multiple documents
    // 
    append: function append(parent) {
        assert(parent.type === ELEMENT_NODE || parent.type === DOCUMENT_NODE);

        if (this.parent) {
            // The node is already inserted into the tree, so we're
            // moving it, not inserting it.  If both node and parent
            // are rooted, then we have to generate different
            // mutation events to transplant the node without uprooting
            // it.  
            if (this.rooted() && parent.rooted()) {
		let curpar = this.parent;
                let pos = this.index();
                splice(curpar.kids, pos, 1);
                this.parent = parent;
                push(parent.kids, this);
                
                this.tree.mutation.moveAppend(this, parent);
                return; // Don't fall through
            }
            else {
                // The node is not rooted, or the parent is not rooted,
                // so just remove it from its current location
                // and then fall through to the insertion code below.
                // This will uproot or root the node as needed.
                this.remove();
            }
        }

        // append node to parent
        this.parent = parent;
        push(parent.kids, this);
        
        // If the parent is rooted, root the child
        if (parent.rooted()) this.tree.rootAppend(this, parent);
    },

    // like DOM insertBefore, but called on the node that is being inserted
    // 
    // XXX: add adoptNode() functionality to deal with multiple documents
    // 
    insert: function insert(target) {
        assert(target.parent);

        // If the node is already in the tree
        if (this.parent) {
            // If we're transplanting the node
            if (this.rooted() && target.rooted()) {
                let oldpar = this.parent, 
                oldpos = this.index();
                newpar = target.parent,
                newpos = target.index();
                
                this.parent = newpar;
                splice(oldpar.kids, oldpos, 1);
                splice(newpar.kids, newpos, 0, this);
                
                this.tree.mutation.moveInsert(this, target);
                return; // Don't fall through to the insertion code
            }
            // Otherwise, we'll just remove the node and then insert
            // it again, uprooting or rooting it as needed
            else {
                this.remove();
                // fall through to the insertion code below.
            }
        }

        let parent = target.parent, pos = target.index();
        assert(pos !== -1);
        this.parent = parent;
        splice(parent.kids, pos, 0, this);
        // An optimization for repeated calls to insert with the same target.
        target.idx++;

        // If the parent is rooted, root the child
        if (parent.rooted()) this.tree.rootBefore(this, target);
    },

    // Remove this node from its parent
    remove: function remove() {
        assert(this.parent);
        let parent = this.parent, kids = parent.kids, pos = this.index();
        assert(pos !== -1)
        delete this.parent;
        splice(kids, pos, 1);
        if (this.rooted()) this.tree.uproot(this);
    },

    // A node is rooted iff it has a nid property 
    rooted: function() { return "nid" in this; },

    // Return the index of this node in its parent.
    // Throw if no parent, or if this node is not a child of its parent
    index: function() {
        // XXX if this method changes, also change the optimization in
        // the insert() method.
	assert(this.parent);
	if (this.idx == null || this.parent.kids[this.idx] != this) {
	    this.idx = A.indexOf(this.parent.kids, this);
	    assert(this.idx != -1);
	}
	return this.idx;
    },

    // Return true if this is equal to or is an ancestor of that
    isAncestor: function(that) {
        for(let e = this; e; e = e.parent) {
            if (e === that) return true;
        }
        return false;
    }
};


function attribute(lname, value, prefix, namespace) {
    // DOM Attr objects are no longer Nodes, and attribute objects aren't
    // node objects, but we still give them a type because we need that
    // property to make the wrap() method work.
    this.type = ATTRIBUTE_NODE;

    this.lname = lname;
    this.value = value;
    this.prefix = prefix || null;
    this.namespace = namespace || null;
    
    if (prefix) this.qname = prefix + ":" + lname;
    else this.qname = lname;
}
