

var doc = document.implementation.createHTMLDocument("hello");

var node = document.createElement("foo");

var node2 = doc.importNode(node, true);

var node3 = document.adoptNode(node)
//assert(node3.document === doc, node3.document);