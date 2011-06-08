// The comment interface is a subtype of CharacterData.
// It does not add any new constants or members.
defineLazyProperty(global, "Comment", function() {
    return iface.Comment.publicInterface;
}, true);

defineLazyProperty(iface, "Comment", function() {
    return implementIDLInterface({
        name: "Comment",
        superclass: iface.CharacterData,
	members: {}
    });
});
