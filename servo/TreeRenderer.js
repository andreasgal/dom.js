var TreeRenderer = (function() {

    // Handle mutation events from the specified dom.js worker and
    // render a document tree (not the document itself) into the root element
    function TreeRenderer(worker, root) {
        this.worker = worker;
        this.root = root;
        root.id = "n1";  // Set the id of the root element to its nid

        root.textContent = "";
        worker.addEventListener("message", this.handleMutation.bind(this), false);
    }

    TreeRenderer.prototype.handleMutation = function(event) {
        var message = event.data;

        // This class only handles mutation events from the worker
        // It doesn't handle log, warn and error commands, for example.
        if (message[0] !== "mutation") return;

        var mutation = message[1];

        switch(mutation.type) {
        case MUTATE_VALUE:
            var target = document.getElementById("n" + mutation.target);
            var text = mutation.data.trim();

            var textnode = document.createElement('span');
            textnode.setAttribute("class", "textnode");
            textnode.setAttribute("title", JSON.stringify(mutation.data));
            textnode.appendChild(
                document.createTextNode(text));
            target.replaceChild(textnode, target.lastChild);
            break;

        case MUTATE_ATTR:
            // NOT IMPLEMENTED YET
            if (mutation.ns) {
                /*target.setAttributeNS(mutation.ns,
                  mutation.prefix + ":" + mutation.name,
                  mutation.value);*/
                //console.log(mutation.ns, mutation.prefix, mutation.name, mutation.value);
            }
            else {
                //console.log(mutation.name, mutation.value);
                //target.setAttribute(mutation.name, mutation.value);
            }
            break;

        case MUTATE_REMOVE_ATTR:
            // NOT IMPLEMENTED YET
            if (mutation.ns) {
                //console.log(mutation.ns, mutation.name);
                //target.removeAttributeNS(mutation.ns, mutation.name);
            }
            else {
                //console.log(mutation.name);
                //target.removeAttribute(mutation.name);
            }
            break;

        case MUTATE_REMOVE:
            var target = document.getElementById("n" + mutation.target);
            var oldclass = target.getAttribute('class') || '';
            target.setAttribute('class', oldclass + ' removed');
            break;

        case MUTATE_MOVE:
            var target = document.getElementById("n" + mutation.target);
            var parent = document.getElementById("n" + mutation.parent);
            var child = parent.childNodes[mutation.index];
            parent.insertBefore(target, child);
            break;

        case MUTATE_INSERT:
            var parsed = DOMSTR.parse(mutation.child, fakedocument);
            assign_nid(parsed, mutation.nid);
            var nodes = create_dom(parsed);
            document.getElementById("n" + mutation.parent).appendChild(nodes);
            break;
        }

    };

    // The value of a Text, Comment or PI node changed
    const MUTATE_VALUE = 1;

    // A new attribute was added or an attribute value and/or prefix changed
    const MUTATE_ATTR = 2;

    // An attribute was removed
    const MUTATE_REMOVE_ATTR = 3;

    // A node was removed
    const MUTATE_REMOVE = 4;

    // A node was moved
    const MUTATE_MOVE = 5;

    // A node (or a subtree of nodes) was inserted
    const MUTATE_INSERT = 6;

    function STextNode(value) {
        this.value = value;
    }

    function SComment(value) {
        this.comment = value;
    }

    function SProcessingInstruction(x, y) {
        this.procinstruction = [x, y];
    }

    function SDocumentType(x, y, z) {
        this.doctype = [x, y, z];
    }

    function SElement(type) {
        this.type = type;
        this.attributes = {};
        this.children = [];
    }

    SElement.prototype = {
        setAttribute: function(name, value) {
            this.attributes[name] = value;
        },
        setAttributeNS: function(ns, name, value) {
            this.attributes[ns + ":" + name] = value;
        },
        appendChild: function(child) {
            this.children.push(child);
        }
    }

    function SDocumentFragment() {
        this.fragment = true;
        this.prototype = new Element('');
    }

    function SDocument() {

    }

    SDocument.prototype = {
        createTextNode: function(txt) {
            return new STextNode(txt);
        },
        createComment: function(cmt) {
            return new SComment(cmt);
        },
        createProcessingInstruction: function(x, y) {
            return new SProcessingInstruction(x, y);
        },
        implementation: {
            createDocumentType: function(x, y, z) {
                return new SDocumentType(x, y, z);
            }
        },
        createDocumentFragment: function() {
            return new SDocumentFragment();
        },
        createElement: function(typ) {
            return new SElement(typ);
        },
        createElementNS: function(ns, typ) {
            return new SElement( ns + ":" + typ);
        }
    }

    var fakedocument = new SDocument();


    // This is used for the fake nodes below
    function assign_nid(node, nid) {
        node.nid = nid++;
        if (node.children === undefined) return;
        for(var i = 0; i < node.children.length; i++) {
            nid = assign_nid(node.children[i], nid++);
        }
        return nid;
    }

    var colors = {
        html: 'green',
        head: 'maroon',
        title: 'red',
        style: 'purple',
        script: 'blueviolet',
        body: 'orange',
        div: 'blue',
        span: 'darkgreen',
        h1: '#333333',
        h2: '#999999',
        a: 'navy',
        label: 'lightblue',
        ol: 'lime',
        ul: 'green',
        li: 'navy',
        strong: 'aqua',
        p: 'teal',
        br: 'olive'
    };

    function create_dom(tree) {
        var wrapper = document.createElement('span');
        wrapper.id = "n" + tree.nid;
        if (tree.children !== undefined) {
            wrapper.setAttribute('class', 'element');
        }

        var nodeid = document.createElement('span');
        wrapper.appendChild(nodeid);
        nodeid.setAttribute('class', 'node-id');
        nodeid.appendChild(
            document.createTextNode(tree.nid));

        var output;
        if (tree.children !== undefined) {
            // Element node
            var color = colors[tree.type];
            if (color !== undefined) {
                wrapper.setAttribute('style', 'color: ' + color);
            }
            var attributes = "";
            for (var attr in tree.attributes) {
                attributes += attr + '="' + tree.attributes[attr] + '" ';
            }
            output = "< " + tree.type + " " + attributes + ">";
            for (var i = 0; i < tree.children.length; i++) {
                var child = create_dom(tree.children[i]);
                wrapper.appendChild(child);
            }
        } else if (tree.doctype !== undefined) {
            // Doctype node
            output = "<!DOCTYPE " + tree.doctype[0] + " >";
        } else if (tree.value !== undefined) {
            // Text node
            var textnode = document.createElement('span');
            textnode.setAttribute("class", "textnode");
            textnode.appendChild(
                document.createTextNode(tree.value.trim()));
            wrapper.setAttribute("title", JSON.stringify(tree.value));
            wrapper.appendChild(textnode);
            output = null;
        } else {
            output = JSON.stringify(tree);
        }
        if (output != null) {
            wrapper.insertBefore(
                document.createTextNode(output),
                wrapper.firstChild.nextSibling
            );
        }
        return wrapper;
    }

    return TreeRenderer;
}());