// A basic set of tree construction and mutation primitives to enable
// a DOM-like, DOM-lite representation for HTML and XML documents.
// The Tree class encapsulates a single document and defines methods
// for creating, inserting, and manipulating nodes.  The nodes
// themselves are just plain objects that do not define methods.
//
// This module defines an internal API and doesn't do error
// checking. It assumes that the parser code and public API code that
// calls it are doing the right thing.
// 
// node objects have the following properties:
//   type: node type: uses DOM Node type constants
//   value: tag name for elements, text content for Text, Comment, and PI nodes
//   kids: an array of child nodes
//   parent: the parent node only exists once the node is inserted
//   attrs: an object mapping attribute names to values.
// 
// This tree representation does nothing special for elements and attributes
// that use namespaces. The qname (with prefix and colon) is used as the name.
// The higher-level DOM API can split this as needed, and also search for
// the xmlns attributes that map prefixes to URIs.
//
// Processing Instructions are treated like Comment nodes, except with
// a different type constant.  No parsing of target vs. command.
// XXX: change this to give them target and data
// 
// Doctype nodes are like Element nodes (except with a different
// type), and the public and system ids are stored as if they were
// attributes.  XXX: really?
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
let Tree = (function() {

    function assert(expr) {
        if (!expr) throw new Error("Assertion failed");
    }

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
        this.document = {
            type:DOCUMENT,  // Node type
            kids:[],        // Node children
            nid: 1          // node id for rooted nodes
        };
        this.nextid = 2;    // id for next node to become rooted
    }

    Tree.ELEMENT = ELEMENT;
    Tree.TEXT = TEXT;
    Tree.PROCESSING_INSTRUCTION = PROCESSING_INSTRUCTION;
    Tree.COMMENT = COMMENT;
    Tree.DOCUMENT = DOCUMENT;
    Tree.DOCTYPE = DOCTYPE;

    Tree.prototype = {
        constructor: Tree,
        text: function text(t) {  return { type: TEXT, value: t }; },
        comment: function comment(t) {  return { type: COMMENT, value: t }; },
        pi: function pi(t) {return { type: PROCESSING_INSTRUCTION, value: t }},
        element: function element(tagname, attrs) {
            return { type: ELEMENT, value: tagname, kids: [], attrs:attrs||{}};
        },
        doctype: function doctype(root) {
            return { type: DOCTYPE, value:root, attrs:{} }
        },
        setAttribute: function setAttribute(node, name, value) {
            assert(node.type === ELEMENT);
            node.attrs[name] = value;
            if (rooted(node)) this.mutation.setAttribute(node, name, value);
        },
        deleteAttribute: function deleteAttribute(node, name) {
            assert(node.type === ELEMENT);
            delete node.attrs[name];
            if (rooted(node)) this.mutation.setAttribute(node, name);
        },
        setText: function setText(node, text) {
            assert(node.type === TEXT ||
                   node.type === COMMENT || 
                   node.type === PROCESSING_INSTRUCTION);
            node.value = text;
            if (rooted(node)) this.mutation.setText(node, text);
        },

        // Append node as the last child of parent. If node is
        // already in the tree, it will be moved from its current location.
        append: function append(node, parent) {
            assert(parent.type === ELEMENT || parent.type === DOCUMENT);

            if (node.parent) {
                // The node is already inserted into the tree, so we're
                // moving it, not inserting it.  If both node and parent
                // are rooted, then we have to generate different
                // mutation events to transplant the node without uprooting
                // it.  
                if (rooted(node) && rooted(parent)) {
                    let pos = node.parent.kids.indexOf(node);
                    curpar.kids.splice(pos, 1);
                    node.parent = parent;
                    parent.kids.push(node);
                    
                    this.mutation.moveAppend(node, parent);
                    return; // Don't fall through
                }
                else {
                    // The node is not rooted, or the parent is not rooted,
                    // so just remove it from its current location
                    // and then fall through to the insertion code below.
                    // This will uproot or root the node as needed.
                    this.remove(node);
                }
            }

            // append node to parent
            node.parent = parent;
            parent.kids.push(node);
            
            // If the parent is rooted, root the child
            if (rooted(parent)) this.rootAppend(node, parent);
        },

        // like DOM insertBefore
        insert: function insert(node, target) {
            assert(target.parent);

            // If the node is already in the tree
            if (node.parent) {
                // If we're transplanting the node
                if (rooted(node) && rooted(target)) {
                    let oldpar = node.parent, 
                        oldpos = oldpar.kids.indexOf(node),
                        newpar = target.parent,
                        newpos = newpar.kids.indexOf(target);
                    
                    node.parent = newpar;
                    oldpar.kids.splice(oldpos, 1);
                    newpar.kids.splice(newpos, 0, node);
                    
                    this.mutation.moveInsert(node, target);
                    return; // Don't fall through to the insertion code
                }
                // Otherwise, we'll just remove the node and then insert
                // it again, uprooting or rooting it as needed
                else {
                    this.remove(node);
                    // fall through to the insertion code below.
                }
            }

            // 
            let parent = target.parent, pos = parent.kids.indexOf(target);
            assert(pos !== -1);
            node.parent = parent;
            parent.kids.splice(pos, 0, node);

            // If the parent is rooted, root the child
            if (rooted(parent)) this.rootBefore(node, target);
        },


/*
        // Insert node into the tree as a child of the parent, at the specified
        // position within the parent's array of children
        insert: function insert(node, parent, position) {
            assert(!node.parent);
            assert(parent.type === ELEMENT || parent.type === DOCUMENT);

            if (position == undefined) position = parent.kids.length;

            assert(position >= 0);
            assert(position <= parent.kids.length);

            // Give the node a parent
            node.parent = parent;

            // Insert the node into the parent's kids array
            parent.kids.splice(position, 0, node);

            // If the parent is rooted, root the child
            if (rooted(parent)) this.root(node, parent, position);
        },
*/

        // Remove the specified child of the specified node
        remove: function remove(n) {
            assert(n.parent);
            let parent = n.parent, kids = parent.kids, pos = kids.indexOf(n);
            assert(pos !== -1)
            delete n.parent;
            kids.splice(pos, 1);
            if (rooted(n)) this.uproot(n);
        },

/*
        // Move a node from one position in the tree to another
        move: function move(oldparent, oldpos, newparent, newpos) {
            assert(oldparent.type === ELEMENT || oldparent.type === DOCUMENT);
            assert(newparent.type === ELEMENT || newparent.type === DOCUMENT);
            assert(oldpos >= 0 && oldpos < oldparent.kids.length);
            assert(newpos >= 0 && newpos <= newparent.kids.length);

            let n = oldparent.kids[oldpos];       // the node to move
            oldparent.kids.splice(oldpos, 1);     // take it out of old parent
            newparent.kids.splice(newpos, 0, n);  // insert into new parent
            n.parent = newparent;                 // remember new parent
            
            // Generate mutation events if this move roots or unroots the node
            // And also if a rooted node remains rooted.
            if (rooted(oldparent)) {
                if (!rooted(newparent)) this.uproot(n);
                else this.mutation.move(oldparent, oldpos, newparent, newpos);
            }
            else {
                if (rooted(newparent)) this.root(n, newparent, newpos);
            }
        },
*/
        // The node n has just been connected to the document
        // root. This means that insertion events must be generated
        // for it and all of its descendants
        rootAppend: function rootAppend(node, parent) {
            assert(!rooted(node));
            
            node.nid = this.nextid++; // mark it as rooted by assigning an id
            this.mutation.append(node, parent);
            
            // Now recurse to root each of the descendant nodes
            if (node.kids)
                node.kids.forEach(function(k) { this.rootAppend(k, node); });
        },

        rootBefore: function rootBefore(node, target) {
            assert(!rooted(node));
            
            node.nid = this.nextid++; // mark it as rooted by assigning an id
            this.mutation.insert(node, target);
            
            // Now recurse to root each of the descendant nodes
            // Note that we switch to rootAppend for the recursion
            if (node.kids)
                node.kids.forEach(function(k) { this.rootAppend(k, node); });
        },

        uproot: function uproot(node) {
            assert(rooted(node));

            // Generate the mutation event to uproot this node
            this.mutation.remove(node);

            // Recursively delete the nid prop that marks this node and
            // its descendants as rooted.
            function delnid(n) {
                delete n.nid;
                if (n.kids) n.kids.forEach(delnid);
            }
            delnid(node);
        }
    }

    // A node is rooted iff it has a nid property 
    function rooted(n) { return "nid" in n; }

    return Tree;
}());
