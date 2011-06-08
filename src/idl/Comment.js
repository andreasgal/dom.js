// The comment interface is a subtype of CharacterData.
// It does not add any new constants or members.
defineLazyProperty(global, "Comment", function() {
    return idl.Comment.publicInterface;
}, true);

defineLazyProperty(idl, "Comment", function() {
    return implementIDLInterface({
        name: "Comment",
        superclass: idl.CharacterData,
        members: {}
    });
});
