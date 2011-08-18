

var doc = document.implementation.createHTMLDocument("hello");

var node = document.createElement("foo");

var node2 = doc.importNode(node, true);
assert(node2.ownerDocument === doc);

var node3 = document.adoptNode(node2);
assert(node3.ownerDocument === document, node3.ownerDocument);

