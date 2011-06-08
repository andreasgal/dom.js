defineLazyProperty(global, "DocumentFragment", function() {
    return iface.DocumentFragment.publicInterface;
}, true);

defineLazyProperty(iface, "DocumentFragment", function() {
    return implementIDLInterface({
        name: "DocumentFragment",
        superclass: iface.Node,
	members: {}
    });
});
