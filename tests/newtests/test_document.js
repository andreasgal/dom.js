

notYetImplemented(function() { document.documentURI; });

notYetImplemented(function() { document.documentURI = "foo"; });

assertThrows(function() {
    // createProcessingInstruction only works for non-html docs
    document.createProcessingInstruction("foo", "bar");
});
