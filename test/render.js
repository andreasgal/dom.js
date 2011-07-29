// dom.js and domstr.js and MutationConstants.js have been loaded.
// Hook up a mutation listener that will render the nodes in the
// dom.js document tree into a sibling iframe

var render_frame = parent.document.getElementById("renderer");
var rdoc = render_frame.contentDocument;
var nodes = {1: rdoc}; // Maps nids to nodes

// clear all nodes from the renderer document, since we'll get events
// to insert the pre-defined ones like html, head, title, body
while(rdoc.firstChild) rdoc.removeChild(rdoc.firstChild);


document.implementation.mozSetOutputMutationHandler(document, mutation_handler);

function mutation_handler(o) {
    var n, parent, child;
    switch(o.type) {
    case MUTATE_VALUE:
        n = nodes[o.target];
        n.data = o.data;
        break;

    case MUTATE_ATTR:
        n = nodes[o.target];
        if (o.namespaceURI === null && o.prefix === null)
            n.setAttribute(o.name, o.value);
        else
            n.setAttributeNS(o.namespaceURI,
                             o.prefix ? o.prefix + ":" + o.name : o.name,
                             o.value);
        break;

    case MUTATE_REMOVE_ATTR:
        n = nodes[o.target];
        if (o.ns === null)
            n.removeAttribute(o.name);
        else
            n.removeAttributeNS(o.ns, o.name);
        break;

    case MUTATE_REMOVE:
        n = nodes[o.target];
        n.parentNode.removeChild(n);
        break;

    case MUTATE_MOVE:
        n = nodes[o.target];
        parent = nodes[o.parent];
        parent.insertBefore(n, parent.childNodes[o.index]);
        break;

    case MUTATE_INSERT:
        parent = nodes[o.parent];
        // Create the new child
        child = DOMSTR.parse(o.child);  
        // Insert the child
        parent.insertBefore(child, parent.childNodes[o.index]);

        // Remember the nid of this new node and
        // recursively assign nids to its children
        setnid(child, o.nid);
        break;
    }


    // Assign the specified nid to the specified node, then recurse
    // and assign successor nids to the node's children.  Return the next
    // available nid
    function setnid(node, nid) {
        nodes[nid++] = node;
        var kids = node.childNodes;
        for(var i = 0, n = kids.length; i < n; i++) {
            nid = setnid(kids[i], nid);
        }
    }
}
