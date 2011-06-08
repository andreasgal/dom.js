defineLazyProperty(global, "DocumentFragment", function() {
    return idl.DocumentFragment.publicInterface;
}, true);

defineLazyProperty(idl, "DocumentFragment", function() {
    return implementIDLInterface({
        name: "DocumentFragment",
        superclass: idl.Node,
        members: {}
    });
});
