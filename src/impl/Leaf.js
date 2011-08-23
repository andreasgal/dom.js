defineLazyProperty(impl, "Leaf", function() {
    // This class defines common functionality for node subtypes that
    // can never have children
    function Leaf() {}

    Leaf.prototype = O.create(impl.Node.prototype, {
        hasChildNodes: constant(function() { return false; }),
        firstChild: constant(null),
        lastChild: constant(null),
        insertBefore: constant(HierarchyRequestError),
        replaceChild: constant(HierarchyRequestError),
        removeChild: constant(HierarchyRequestError),
        appendChild: constant(HierarchyRequestError),

        // Each node must have its own unique childNodes array.  But
        // leaves always have an empty array, so initialize it lazily.
        // If the childNodes property is read, we'll return an array
        // and define a read-only property directly on the object that
        // will shadow this one. I'd like to freeze the array, too, since
        // leaf nodes can never have children, but I'll end up having to add
        // a property to refer back to the IDL NodeList wrapper.
        childNodes: attribute(function() {
            var a = [];
            a._idlName = "NodeList";
            O.defineProperty(this, "childNodes", constant(a));
            return a;
        }),
    });

    return Leaf;
});