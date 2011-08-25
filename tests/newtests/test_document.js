

notYetImplemented(function() { document.documentURI; });

notYetImplemented(function() { document.documentURI = "foo"; });

assertThrows(function() {
    // createProcessingInstruction only works for non-html docs
    document.createProcessingInstruction("foo", "bar");
});

var text = document.createTextNode("text");

assertThrows(function() {
    document.appendChild(text);
});

var element = document.createElement("foo");

assertThrows(function() {
    // already have a top-level element
    document.appendChild(element);
});

var doctype = document.implementation.createDocumentType("foo", "bar", "baz");

assertThrows(function() {
    document.appendChild(doctype);
});
