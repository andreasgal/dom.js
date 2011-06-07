defineLazyProperty(global, "DocumentType", function() {
    return wrapper.DocumentType.interface;
}, true);

defineLazyProperty(wrapper, "DocumentType", function() {
    return implementIDLInterface({
        name: "DocumentType",
        superclass: wrapper.Node,
	members: {
	    get name() { return unwrap(this).name; },
	    get publicId() { return unwrap(this).publicId; },
	    get systemId() { return unwrap(this).systemId; },
	}
    });
});
