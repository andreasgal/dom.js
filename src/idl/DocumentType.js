defineLazyProperty(global, "DocumentType", function() {
    return idl.DocumentType.publicInterface;
}, true);

defineLazyProperty(idl, "DocumentType", function() {
    return implementIDLInterface({
        name: "DocumentType",
        superclass: idl.Node,
	members: {
	    get name() { return unwrap(this).name; },
	    get publicId() { return unwrap(this).publicId; },
	    get systemId() { return unwrap(this).systemId; },
	}
    });
});
