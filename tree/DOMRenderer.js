// This class simulates a browser renderer.  It receives serialized tree
// mutation events (see MutationSerializer.js) via message events.  It doesn't
// actually render the document tree, but just uses the events to build
// a matching DOM tree.
const DOMRenderer = (function() {

    function DOMRenderer(document, root) {
        this.doc = document;

        // Map node ids to nodes.
        // The events we get from the parser are likely to generate sequential
        // numeric ids, so we might gets some efficiency by using an array.
        this.nidToNode = [];

        // XXX I shouldn't have to hardcode this here.
        // Perhaps the protocol should include an opcode for starting
        // a new document.
        this.map(1, root);
    }

    DOMRenderer.prototype = {
        constructor: DOMRenderer,
        parse: function(s) {
            if (!s) return;
            let operations = s.split(FS1);
            operations.forEach(function(op) {
                if (!op) return;
                let fields = op.split(FS2);
                switch(fields[0]) {  // first field is the opcode
                case INSERT: this.insert(fields); break;
                case APPEND: this.append(fields); break;
                case MOVEA: this.moveAppend(fields); break;
                case MOVEI: this.moveInsert(fields); break;
                case REMOVE: this.remove(fields); break;
                case SETTEXT: this.text(fields); break;
                case SETATTR: this.setattr(fields); break;
                }
            }, this);
        },

        append: function(fields) {
            let parent = this.node(fields[1]);
            let node = this.create(fields);
            parent.appendChild(node);
        },
        insert: function(fields) {
            let target = this.node(fields[1]);
            let node = this.create(fields);
            target.parentNode.insertBefore(node, target);
        },

        moveAppend: function(fields) {
            let node = this.node(fields[1]), parent = this.node(fields[2]);
            parent.appendChild(node);
        },

        moveInsert: function(fields) {
            let node = this.node(fields[1]), target = this.node(fields[2]);
            target.parentNode.insertBefore(node, target);
        },

        remove: function(fields) {
            let nid = fields[1], node = this.node(nid);
            node.parentNode.removeChild(node);
            this.unmap(nid, node); // recursively unmaps kids, too
        },

        text: function(fields) {
            this.node(fields[1]).data = fields[2];
        },
        setattr: function(fields) {
            let node = this.node(fields[1]);
            if (fields.length == 3) node.removeAttribute(fields[2]);
            else node.setAttribute(fields[2], fields[3]);
        },

        // internal method used by append() and insert()
        create: function(fields) {
            let nid = fields[2],
                type = parseInt(fields[3]),
                value = fields[4],
                node,
                attrs;
            switch(type) {
            case TEXT:
                node = this.doc.createTextNode(value);
                break;
            case COMMENT:
                // omit the content of the comment
                node = this.doc.createComment("");
                break;
/*
            case PROCESSING_INSTRUCTION:
                let parts = value.split(" ", 2);
                node = this.doc.createProcessingInstruction(
                    parts[0], parts[1]);
                break;
            case DOCTYPE:
                // XXX Do I ever really do this?
                // Am I using attrs for public id and systemid?
                // node = tree.doctype(value);
                break;
*/
            case ELEMENT:
                node = this.doc.createElement(value);
                attrs = parseAttrs(fields[5]);
                for(let a in attrs) node.setAttribute(a, attrs[a]);
                break;
            }
            this.map(nid, node);
            return node;
        },


        // Internal functions for maintaining the nid <-> node mapping
        map: function(nid, node) {
            this.nidToNode[nid] = node;
            node.__nid__ = nid;
        },
        unmap: function(node) {  
            let nid = node.__nid__;
            delete node.__nid__;
            delete this.nidToNode[nid];

            // Recursively handle all kids, too
            for(let i = 0, n = node.childNodes.length; i < n; i++)
                this.unmap(node.childNodes[i]);
        },
        node: function(nid) { return this.nidToNode[nid]; }
    };

    // convert n1+FS3+v1+FS3+n2+FS3+v2 to {n1:v1,n2:v2}
    function parseAttrs(s) {
        if (!s) return {};
        let a = s.split(FS3), attrs = {}, i = 0;
        while(i < a.length) {
            attrs[a[i]] = a[i+1];
            i += 2;
        }
        return attrs;
    }

    return DOMRenderer;
}());
