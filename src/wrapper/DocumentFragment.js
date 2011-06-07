defineLazyProperty(global, "DocumentFragment", function() {
    return wrapper.DocumentFragment.interface;
}, true);

defineLazyProperty(wrapper, "DocumentFragment", function() {
    return implementIDLInterface({
        name: "DocumentFragment",
        superclass: wrapper.Node,
	members: {}
    });
});
