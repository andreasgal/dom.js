defineLazyProperty(global, "DocumentType", function() {
    return iface.DocumentType.publicInterface;
}, true);

defineLazyProperty(iface, "DocumentType", function() {
    return implementIDLInterface({
        name: "DocumentType",
        superclass: iface.Node,
	members: {
	    get name() { return unwrap(this).name; },
	    get publicId() { return unwrap(this).publicId; },
	    get systemId() { return unwrap(this).systemId; },
	}
    });
});
