// dom.js uses two kinds of tree node objects.  nodes (with a
// lowercase n) are the internal data structures that hold the actual
// document data. They are implemented by the files in impl/* Nodes
// (with a capital N) are the public objects that implement DOM
// interfaces and do not have any properties other than the accessor
// properties and methods defined by the DOM.  They are implemented by 
// the files in idl/*
//
// Every Node must have a node to hold its actual data.
// But nodes can exist without any corresponding Node: Nodes are created
// as needed, when scripts use the DOM API to inspect the document tree.
//
// Since Node objects can't have properties, the mapping from Node to node
// is done with a WeakMap.  The mapping from node to Node is simpler:
// if a Node exists for the node, it is simply set on a property of the node.
//
// The methods in this file manage the mapping between nodes and Nodes
// 
const [unwrap, unwrapOrNull, wrap] = (function() {
    let idlToImplMap = new WeakMap(), lastkey = {}, lastvalue = undefined;

    // Return the implementation object for the DOM Node n
    // This method will throw a TypeError if n is
    // null, undefined, a primitive, or an object with no mapping.
    // This provides basic error checking for methods like Node.appendChild().
    // XXX: We used to throw NOT_FOUND_ERR here, but ms2ger's tests
    // expect TypeError
    function unwrap(n) {
        // Simple optimization
        // If I ever remove or alter mappings, then this won't be valid anymore.
        if (n === lastkey) return lastvalue;

        try {
            let impl = wmget(idlToImplMap, n);

            // This happens if someone passes a bogus object to 
            // appendChild, for example. 
            if (!impl) NotFoundError();

            lastkey = n;
            lastvalue = impl;
            return impl;
        }
        catch(e) {
            // If n was null or not an object the WeakMap will raise a TypeError
            // TypeError might be the best thing to propagate, but there is also
            // some precendent for raising a DOMException with code
            // NOT_FOUND_ERR;
            throw TypeError();
        }
    }

    function unwrapOrNull(n) {
        if (!n) return null;
        return unwrap(n);
    }

    // Return the interface object (a DOM node) for the implementation node n,
    // creating it if necessary
    function wrap(n, idltype) {
        if (n === null) return null;

        if (!n._idl) {
            if (idltype !== idl.Node) {
                n._idl = idltype.factory(n);
            }
            else {
                // Special case for Nodes. To wrap a Node, we have to create
                // an object of the appropriate subtype. 
                // 
                // XXX Once we start on HTML5, we're going to have to
                // expand this special case to handle lots of element
                // subtypes based on n.tagName, I think. This may be a general
                // issue with the DOM anywhere there is an IDL type hierarchy.
                //
                // Note that we know for sure that none of these types require
                // a proxy handler, and therefore we do not have to pass
                // the implementation object n to the factory function.
                // 
                switch(n.nodeType) {
                case ELEMENT_NODE:
                    n._idl = idl.Element.factory();
                    break;
                case TEXT_NODE:
                    n._idl = idl.Text.factory();
                    break;
                case COMMENT_NODE:
                    n._idl = idl.Comment.factory();
                    break;
                case PROCESSING_INSTRUCTION_NODE:
                    n._idl = idl.ProcessingInstruction.factory();
                    break;
                case DOCUMENT_NODE:
                    n._idl = idl.Document.factory();
                    break;
                case DOCUMENT_FRAGMENT_NODE:
                    n._idl = idl.DocumentFragment.factory();
                    break;
                case DOCUMENT_TYPE_NODE:
                    n._idl = idl.DocumentType.factory();
                    break;
                }
            }

            wmset(idlToImplMap, n._idl, n);
        }

        return n._idl;
    }

    return [unwrap, unwrapOrNull, wrap];
}());