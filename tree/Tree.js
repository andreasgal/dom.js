// A basic set of tree construction and mutation primitives to enable
// a DOM-like, DOM-lite representation for HTML and XML documents.
// The Tree class encapsulates a single document and defines methods
// for creating, inserting, and manipulating nodes.  The nodes
// themselves are just plain objects and do not themselves have
// methods. This module defines an internal API and doesn't do error
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
// 
// Doctype nodes are like Element nodes (except with a different
// type), and the public and system ids are stored as if they were
// attributes.
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

    // Node types.  These match DOM constants
    const ELEMENT = 1;
    const TEXT = 3;
    const PROCESSING_INSTRUCTION = 7;
    const COMMENT = 8;
    const DOCUMENT = 9;
    const DOCTYPE = 10;

    // Dummy functions for handling for mutations
    const nullMutationHandler = {
        insert: function(node, parent, position) {},
        move: function(oldparent, oldpos, newparent, newpos) {},
        remove: function(node, parent, position) {},
        setText: function(node, text) {},
        setAttribute: function(node, name, value) {}
    };

    function Tree(mutationHandler) {
        // The handler object has functions that forward mutations
        // If we don't get one, then use a stub.
        this.handler = mutationHandler || nullMutationHandler;
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
            if (rooted(node)) this.handler.setAttribute(node, name, value);
        },
        deleteAttribute: function deleteAttribute(node, name) {
            assert(node.type === ELEMENT);
            delete node.attrs[name];
            if (rooted(node)) this.handler.setAttribute(node, name);
        },
        setText: function setText(node, text) {
            assert(node.type === TEXT ||
                   node.type === COMMENT || 
                   node.type === PROCESSING_INSTRUCTION);
            node.value = text;
            if (rooted(node)) this.handler.setText(node, text);
        },

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

        // Remove the specified child of the specified node
        remove: function remove(parent, position) {
            assert(parent.type === ELEMENT || parent.type === DOCUMENT);
            assert(position >= 0 && position < parent.kids.length);

            let n = parent.kids[position];
            delete n.parent;
            parent.kids.splice(position, 1);
            if (rooted(n)) this.uproot(n, parent, position);
        },

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
                if (!rooted(newparent)) this.uproot(n,oldparent,oldpos);
                else this.handler.move(oldparent, oldpos, newparent, newpos);
            }
            else {
                if (rooted(newparent)) this.root(n, newparent, newpos);
            }
        },

        // The node n has just been connected to the document
        // root. This means that insertion events must be generated
        // for it and all of its descendants
        root: function root(node, parent, position) {
            assert(!rooted(node));
            
            node.nid = this.nextid++; // mark it as rooted by assigning an id
            this.handler.insert(node, parent, position);
            
            // Now recurse to root each of the descendant nodes
            if (node.kids)
                node.kids.forEach(function(k,i) { this.root(k, node, i); });
        },

        uproot: function uproot(node, parent, position) {
            assert(rooted(node));

            this.handler.remove(parent, position);
            delete node.nid; // remove the nid prop that marks node as rooted

            // Now recurse to uproot each of the descendant nodes
            if (node.kids)
                node.kids.forEach(function(k,i) { this.uproot(k, node, i); });
        }

    }

    // A node is rooted iff it has a nid property 
    function rooted(n) { return "nid" in n; }

    return Tree;
}());

