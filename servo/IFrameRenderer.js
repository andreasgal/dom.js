// Render mutation events from the dom.js instance in a specified worker
// as native DOM nodes in the specified iframe
function IFrameRenderer(worker, frame) {
    this.worker = worker;
    this.frame = frame;
    this.win = frame.contentWindow;
    this.doc = frame.contentDocument;
    this.nodes = [null, this.doc];  // Maps nid to node    

    // Remove the existing children of the document
    while(this.doc.hasChildNodes()) this.doc.removeChild(this.doc.firstChild);

    // Set up a handler for mutation events from the dom.js worker
    worker.addEventListener("message", this.handleMutation.bind(this), false);

    var self = this; // for the nested function below

    // Set up capturing event handlers on the document to pass local events
    // to the dom.js worker
    [
        "click",
        "mousedown",
        "mouseup",
        "mousemove",
        "mouseover",
        "mouseout",
        "keydown",
        "keyup",
        "keypress",
        "focus",
        "blur"
    ].forEach(function(t) {
        self.doc.addEventListener(t, self.handleEvent.bind(self), true);
    });
}

IFrameRenderer.prototype.handleEvent = function(e) {
    var event = {
        event: true,
        type: e.type,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        target: e.target._nid,
    }
    this.worker.postMessage(["event", event]);

    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
};

IFrameRenderer.prototype.handleMutation = function(event) {
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

    var message = event.data;
    
    // This class only handles mutation events from the worker
    // It doesn't handle log, warn and error commands, for example.
    if (message[0] !== "mutation") return;

    var mutation = message[1];

    var target;
    if (mutation.target) target = this.nodes[mutation.target];

    switch(mutation.type) {
    case MUTATE_VALUE:
        target.data = mutation.data;
        break;
        
    case MUTATE_ATTR:
        if (mutation.ns) {
            target.setAttributeNS(mutation.ns,
                                  mutation.prefix + ":" + mutation.name,
                                  mutation.value);
        }
        else {
            target.setAttribute(mutation.name, mutation.value);
        }
        break;

    case MUTATE_REMOVE_ATTR:
        if (mutation.ns) {
            target.removeAttributeNS(mutation.ns, mutation.name);
        }
        else {
            target.removeAttribute(mutation.name);
        }
        break;

    case MUTATE_REMOVE:
        target.parentNode.removeChild(target);
        break;
        
    case MUTATE_MOVE:
        var parent = this.nodes[mutation.parent];
        var child = parent.childNodes[mutation.index];
        parent.insertBefore(target, child);
        break;
        
    case MUTATE_INSERT:
        var parent = this.nodes[mutation.parent];
        var target = parent.childNodes[mutation.index];
        var child = DOMSTR.parse(mutation.child, parent.ownerDocument);
        this.assignNid(child, mutation.nid);
        parent.insertBefore(child, target);

        // XXX: temporary hack?
        // If we've just inserted the <head>, add a <base href>
        // so that URLs of stylesheets get resolved correctly
        // XXX: this might mess up the indexes of children in the head
        // and it could really break things
        if (child.tagName === "HEAD") {
            var base = child.ownerDocument.createElement("base");
            base.href = this.basehref;
            child.appendChild(base);
        }

        break;
    }
};

IFrameRenderer.prototype.setBaseHref = function(url) {
    this.basehref = url;
};

IFrameRenderer.prototype.assignNid = function assignNid(node, nid) {
    node._nid = nid;
    this.nodes[nid++] = node;
    
    for(var kid = node.firstChild; kid; kid = kid.nextSibling) {
        nid = this.assignNid(kid, nid);
    }
    
    return nid;
};
