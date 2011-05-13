// This class parses mutation events received from the parser as
// messages on the specified port and uses them to add nodes to the
// specified Tree.  Since the current version of the parser only ever
// emits APPEND events, this is a pretty simple parser.
const TreeBuilder = (function() {

    function TreeBuilder(tree) {
        this.tree = tree;
        this.map = [];  // map nids to nodes
        this.map[1] = tree.document; // XXX shouldn't be hardcoded
    }

    TreeBuilder.prototype = {
        constructor: TreeBuilder,
        parse: function parse(s) {
            if (!s) return;
            let operations = s.split(FS1);
            operations.forEach(function(op) {
                if (!op) return;
                let fields = op.split(FS2);
                switch(fields[0]) {  // first field is the opcode
                case APPEND: this.append(fields); break;
                case INSERT: this.insert(fields); break;
                case MOVEA: this.moveAppend(fields); break;
                case MOVEI: this.moveInsert(fields); break;
                case REMOVE: this.remove(fields); break;
                case SETTEXT: this.text(fields); break;
                case SETATTR: this.setattr(fields); break;
                }
            }, this);
        },
        
        append: function(fields) {
            let parent = this.map[fields[1]];
            let node = this.create(fields);
            this.tree.append(node, parent);
        },

        create: function(fields) {
            let nid = fields[2],
                type = parseInt(fields[3]),
                value = fields[4],
                node,
                attrs;
            switch(type) {
            case TEXT:
                node = this.tree.text(value);
                break;
            case COMMENT:
                node = this.tree.comment(value);
                break;
            case ELEMENT:
                node = this.tree.element(value, parseAttrs(fields[5]));
                break;
            }
            this.map[nid] = node;
            return node;
        },
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
   
    return TreeBuilder;
}());
