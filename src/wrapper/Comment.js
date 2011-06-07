// The comment interface is a subtype of CharacterData.
// It does not add any new constants or members.
defineLazyProperty(global, "Comment", function() {
    return wrapper.Comment.interface;
}, true);

defineLazyProperty(wrapper, "Comment", function() {
    return implementIDLInterface({
        name: "Comment",
        superclass: wrapper.CharacterData,
	members: {}
    });
});
