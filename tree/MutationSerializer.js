// A MutationSerializer object converts invocations of its tree
// mutation methods into a string format buffers them up.  The flush() method
// passes the buffered strings to the function you specify when you create
// the serializer.
const MutationSerializer = (function() {

    // convert {n1:v1,n2:v2} to n1+FS3+v1+FS3+n2+FS3+v2
    function serializeAttrs(attrs) {
        let a = [], n;
        for(n in attrs) a.push(n, attrs[n]);
        return a.join(FS3);
    }

    function MutationSerializer(sink) {
        this.sink = sink; // Pass all serialized mutations to this function
    }

    MutationSerializer.prototype = {
        constructor: MutationSerializer,
        append: function(node, parent) {
            let event = APPEND + FS2 + parent.nid + FS2 +
                node.nid + FS2 + node.type + FS2 + node.value;
            if (node.attrs) event += FS2 + serializeAttrs(node.attrs);
            this.sink(event);
        },
        insert: function(node, target) {
            let event = INSERT + FS2 + target.nid + FS2 + 
                node.nid + FS2 + node.type + FS2 + node.value;
            if (node.attrs) event += FS2 + serializeAttrs(node.attrs);
            this.sink(event);
        },
        moveAppend: function(node, parent) {
            this.sink(MOVEA + FS2 + node.nid + FS2 + parent.nid);
        },
        moveInsert: function(node, target) {
            this.sink(MOVEI + FS2 + node.nid + FS2 + target.nid);
        },
        remove: function(node) {
            this.sink(REMOVE + FS2 + node.nid);
        },
        setText: function(node, text) {
            this.sink(SETTEXT + FS2 + node.nid + FS2 + text);
        },
        setAttribute: function(node, name, value) {
            if (value !== undefined) 
                this.sink(SETATTR + FS2 + node.nid + FS2 +
                                 name + FS2 + value);
            else
                this.sink(SETATTR + FS2 + node.nid + FS2 + name);
        },
/*
        flush: function() {
            if (this.buffer.length) {
                this.sink(this.buffer.join(FS1));
                this.buffer.length = 0;
            }
        }
*/
    };

    return MutationSerializer;

/*
 
  This parser code is out of date and no longer matches the 
  serializer above.  DOMRenderer.js should be more up-to-date.

    // convert n1+FS3+v1+FS3+n2+FS3+v2 to {n1:v1,n2:v2}
    function parseAttrs(s) {
        let a = s.split(FS3), attrs = {}, i = 0;
        while(i < a.length) {
            attrs[a[i]] = a[i+1];
            i += 2;
        }
        return attrs;
    }

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
            let operations = s.split(FS1);
            operations.forEach(function(op) {
                let fields = op.split(FS2), node;
                switch(fields[0]) {  // first field is the opcode
                case APPEND:
                case INSERT:
                  let othernode = this.map[fields[1]],
                    newid = fields[2],
                    type = parseInt(fields[3]),
                    value = fields[4],
                    node, attrs;
                    switch(type) {
                    case TEXT:
                        node = tree.text(value);
                        break;
                    case COMMENT:
                        node = tree.text(value);
                        break;
                    case PROCESSING_INSTRUCTION:
                        node = tree.text(value);
                        break;
                    case DOCTYPE:
                        // XXX Do I ever really do this?
                        // Am I using attrs for public id and systemid?
                        node = tree.doctype(value);
                        break;
                    case ELEMENT:
                        node = tree.element(value, parseAttrs(fields[5]));
                        break;
                    }
                    this.map[newid] = node;
                    if (fields[0] == APPEND)
                        tree.append(node, othernode);
                    else
                        tree.insert(node, othernode);
                    break;
                case REMOVE:
                    this.tree.remove(this.map[fields[1]])
                    break;
                case MOVE:
                    this.tree.move(this.map[fields[1]], parseInt(fields[2]),
                                   this.map[fields[3]], parseInt(fields[5]));
                    break;
                case SETTEXT:
                    this.tree.setText(this.map[fields[1]], fields[2]);
                    break;
                case SETATTR:
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

*/
}());
