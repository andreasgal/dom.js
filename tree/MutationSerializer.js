// A Mutation.Serializer object converts invocations of it tree
// mutation methods into a string format and passes those strings to
// the specified function (which probably calls postMessage() or similar)
//
// A Mutation.Parser object parses thos tree mutation event strings
// and converts them into calls on a Tree object to build a local copy
// of the tree

const Mutation = (function() {

    const FS0 = '\x00';  // Separates one event from the next, if concatenated
    const FS1 = '\x01';  // Separates events fields from each other
    const FS2 = '\x02';  // Separates attribute names and values

    // opcodes
    const INSERT = 'I';  // Insert a new node
    const REMOVE = 'R';  // Remove a node
    const MOVE = 'M';    // Move a node
    const TEXT = 'T';    // Set node text
    const ATTR = 'A';    // Set or remove an attribute

    // convert {n1:v1,n2:v2} to n1+FS2+v1+FS2+n2+FS2+v2
    function serializeAttrs(attrs) {
        let a = [], n;
        for(n in attrs) a.push(n, attrs[n]);
        return a.join(FS2);
    }

    // convert n1+FS2+v1+FS2+n2+FS2+v2 to {n1:v1,n2:v2}
    function parseAttrs(s) {
        let a = s.split(FS2), attrs = {}, i = 0;
        while(i < a.length) {
            attrs[a[i]] = a[i+1];
            i += 2;
        }
        return attrs;
    }

    function MutationSerializer(sink) {
        this.sink = sink; // Pass all serialized mutations to this function
        this.buffer = [];
    }

    MutationSerializer.prototype = {
        constructor: MutationSerializer,
        insert: function(node, parent, position) {
            let event = INSERT + FS1 + parent.nid + FS1 + position + FS1 +
                node.nid + FS1 + node.type + FS1 + node.value;
            if (node.attrs) event += FS1 + serializeAttrs(node.attrs);
            this.buffer.push(event);
        },
        move: function(oldparent, oldpos, newparent, newpos) {
            this.buffer.push(MOVE + FS1 + oldparent.nid + FS1 + oldpos +
                             FS1 + newparent.nid + FS1 + newpos);
        },
        remove: function(parent, position) {
            this.buffer.push(REMOVE + FS1 + parent.nid + FS1 + position);
        },
        setText: function(node, text) {
            this.buffer.push(TEXT + FS1 + node.nid + FS1 + text);
        },
        setAttribute: function(node, name, value) {
            if (value !== undefined) 
                this.buffer.push(ATTR + FS1 + node.nid + FS1 +
                                 name + FS1 + value);
            else
                this.buffer.push(ATTR + FS1 + node.nid + FS1 + name);
        },
        flush: function() {
            if (this.buffer.length) {
                this.sink(this.buffer.join(FS0));
                this.buffer.length = 0;
            }
        }
    };

    function MutationParser(handler) {
        this.tree = new Tree(handler);
        // Map node ids to nodes.
        // The events we get from the parser are likely to generate sequential
        // numeric ids, so we might gets some efficiency by using an array.
        this.map = [];

        // XXX I shouldn't have to hardcode this here.
        // Perhaps the protocol should include an opcode for starting
        // a new document.
        this.map[1] = tree.document;
    }

    MutationParser.prototype = {
        constructor: MutationParser,
        parse: function(s) {
            if (!s) return;
            let operations = s.split(FS0);
            operations.forEach(function(op) {
                let fields = op.split(FS1), node;
                switch(fields[0]) {  // first field is the opcode
                case INSERT:
                  let parent = this.map[fields[1]],
                    position = parseInt(fields[2]),
                    newid = fields[3],
                    type = parseInt(fields[3]),
                    value = fields[4],
                    node, attrs;
                    switch(type) {
                    case Tree.TEXT:
                        node = tree.text(value);
                        break;
                    case Tree.COMMENT:
                        node = tree.text(value);
                        break;
                    case Tree.PROCESSING_INSTRUCTION:
                        node = tree.text(value);
                        break;
                    case Tree.DOCTYPE:
                        // XXX Do I ever really do this?
                        // Am I using attrs for public id and systemid?
                        node = tree.doctype(value);
                        break;
                    case Tree.ELEMENT:
                        node = tree.element(value, parseAttrs(fields[5]));
                        break;
                    }
                    this.map[newid] = node;
                    tree.insert(node, parent, position);
                    break;
                case REMOVE:
                    this.tree.remove(this.map[fields[1]], parseInt(fields[2]))
                    break;
                case MOVE:
                    this.tree.move(this.map[fields[1]], parseInt(fields[2]),
                                   this.map[fields[3]], parseInt(fields[5]));
                    break;
                case TEXT:
                    this.tree.setText(this.map[fields[1]], fields[2]);
                    break;
                case ATTR:
                    node = this.map[fields[1]];
                    if (fields.length == 3) {   // remove attribute
                        this.tree.deleteAttribute(node, fields[2]);
                    }
                    else {                      // set attribute
                        this.tree.setAttribute(node, fields[2], fields[3]);
                    }
                    break;
                }
            });
        }
    };


    return {
        Serializer: MutationSerializer,
        Parser: MutationParser
    };
}());
