// The comment interface is a subtype of CharacterData.
// It does not add any new constants or members.
defineLazyProperty(global, "Comment", function() {
    return DOM.Comment.interface;
}, true);

defineLazyProperty(DOM, "Comment", function() {
    return implementIDLInterface({
        name: "Comment",
        superclass: DOM.CharacterData,
	init: function(impl) { nyi(); },
	members: {}
    });
});
