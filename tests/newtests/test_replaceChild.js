

var foreign = document.implementation.createHTMLDocument();
var foreignNode = foreign.createElement('div');
var node = document.createElement('div');
var anotherNode = document.createElement('span');
var htmlNode = document.createElement('html');
var comment = document.createComment('comment');
var afterComment = document.createComment('after comment');
var text = document.createTextNode("text");
var doctype = document.doctype;
var foreignDoctype = document.implementation.createDocumentType("foo", "bar", "baz");

// Can't pass reference node that's not a child of document
assertThrows(function() {
    document.replaceChild(node, foreignNode);
});

document.insertBefore(comment, document.firstChild);

// Can't use replaceChild to put a Text node before the body.
assertThrows(function() {
    document.replaceChild(text, comment);
});

// The same for Elements.
assertThrows(function() {
    document.replaceChild(anotherNode, comment);
});

document.removeChild(document.documentElement);

// Can't replace the comment before the DTD with a node
assertThrows(function() {
    document.replaceChild(anotherNode, comment);
});

document.appendChild(afterComment);

// Replace the comment with a new node to be the document node.
document.replaceChild(htmlNode, afterComment);

// Remove the doctype.
document.removeChild(document.doctype);

// Replace the new html node with a doctype.
document.replaceChild(doctype, htmlNode);

// Put the comment back again.
document.appendChild(afterComment);

// Can't add a second doctype
assertThrows(function() {
    document.replaceChild(foreignDoctype, afterComment);
});

// Replace the doctype with the htmlNode again.
document.replaceChild(htmlNode, doctype);

// Can't add a doctype after the document element
assertThrows(function() {
    document.replaceChild(foreignDoctype, afterComment);
});

// Now we have a doctype and a body again.
document.replaceChild(doctype, comment);

assert(document.doctype);
assert(document.documentElement);

var dummy = document.createComment("dummy");
var dummy2 = document.createComment("dummy2");
// Remove the document element and doctype with this weird syntax.
document.replaceChild(dummy, document.doctype);
assert(!document.doctype);
document.replaceChild(dummy2, document.documentElement);
assert(!document.documentElement);
