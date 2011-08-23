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
        if (n === lastkey)
            return lastvalue;

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
        return n
            ? unwrap(n)
            : null;
    }

    // Return the interface object (a DOM node) for the implementation object n,
    // creating it if necessary. Most implementation objects define the type
    // of wrapper they require by defining an _idlName property.  When the
    // implementation object is an array, however, it is the second argument
    // to this wrap() method that defines the wrapper type.
    // XXX
    // I don't like the special case for arrays.  Does that apply to anything
    // other than childNodes?  Can I just define an _idlName property manually
    // on every array that might get wrapped?
    function wrap(n, idltype) {
        if (n === null) return null;

        // If n doesn't have a wrapper already, create one.
        if (!n._idl) {
/*
            // If n defines its own wrapper type, use that.
            // Otherwise, use the type that IDL expects.
            let type = n._idlName
                ? idl[n._idlName]
                : idltype;
*/
            n._idl = idl[n._idlName].factory(n);         // Create the wrapper
            wmset(idlToImplMap, n._idl, n);   // Remember it for unwrap()
        }

        return n._idl;
   }

   return [unwrap, unwrapOrNull, wrap];
}());