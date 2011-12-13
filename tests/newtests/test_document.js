

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

// can't add doctype when there is already one
var doctype = document.implementation.createDocumentType("foo", "bar", "baz");
assertThrows(function() {
    document.appendChild(doctype);
});
assertThrows(function() {
    document.insertBefore(doctype, document.firstChild);
});

var foreign = document.implementation.createHTMLDocument("title");
var foreignNode = document.createElement("foo");
foreign.body.appendChild(foreignNode);
var foreignText = document.createTextNode("frotz");
var another = document.createElement("bar");

// can't insert before a node that's not in the document.
assertThrows(function() {
    foreign.insertBefore(another, element);
});

// Can't add a text node at top level.
assertThrows(function() {
    foreign.insertBefore(foreignText, foreign.firstChild);
});

// Can't have a second top-level element.
assertThrows(function() {
    foreign.insertBefore(another, foreign.firstChild);
});

// can't insert element before doctype.
var blank = document.implementation.createDocument(null, null,null);
//print(blank.documentElement);
blank.appendChild(doctype);
assertThrows(function() {
    blank.insertBefore(blank.createElement("foo"), doctype);
});

// allow inserting a doctype before another child 
var blank2 = document.implementation.createDocument(null, null, null);
var doctype2 = document.implementation.createDocumentType("foo", "bar", "baz");
blank2.appendChild(document.createElement('body'));
blank2.insertBefore(doctype2, blank2.firstChild);

// allow calling insertBefore with no reference node
var blank3 = document.implementation.createDocument(null, null, null);
var docnode3 = document.createElement('html');
blank3.insertBefore(docnode3, null);
assert(blank3.documentElement === docnode3);

// can use insertBefore to insert a body before a comment
var blank4 = document.implementation.createDocument(null, null, null);
var comment4 = blank4.createComment("comment");
blank4.appendChild(comment4);
blank4.insertBefore(document.createElement('html'), comment4);
assert(document.firstChild.nodeName === "html", document.firstChild.nodeName);

assert(document.body);
assert(document.head);

assertThrows(function() {
    document.body = null;
});

// Assert document.body and head are null for non-html doc.
var doc = document.implementation.createDocument();

assert(!doc.body);
assert(!doc.head);

assertThrows(function() {
    document.adoptNode(doc);
});

var foreign = doc.createElement("foo");
var foreign2 = doc.createElement("bar");
var foreign3 = doc.createElement("bar");
var foreign4 = doc.createElement("bar");
doc.documentElement.appendChild(foreign);
assert(foreign.parentNode);
document.adoptNode(foreign);
assert(!foreign.parentNode);

assert(foreign.lastChild === null);
assert(foreign.previousSibling === null);
assert(foreign.nextSibling === null);
assert(foreign.lastChild === null);
assertThrows(function() { foreign.removeChild(foreign2); });
assertThrows(function() { doc.documentElement.removeChild(foreign, foreign2); });
assertThrows(function() { foreign3.insertBefore(foreign, foreign2); });
foreign.appendChild(foreign2);
foreign2.appendChild(foreign3);
foreign2.appendChild(foreign4);
assertThrows(function() { foreign2.insertBefore(foreign, foreign3); });
assertThrows(function() { foreign2.insertBefore(doc, foreign3); });
assertThrows(function() { foreign2.appendChild(foreign); });
assertThrows(function() { foreign2.appendChild(doc); });
assertThrows(function() { foreign2.replaceChild(foreign3, foreign); });
assertThrows(function() { foreign2.replaceChild(foreign, foreign4); });

doc.documentElement.insertBefore(foreign, null);
assert(foreign.parentNode === doc.documentElement);
var foreign2 = doc.createElement("bar");

notYetImplemented(function() { document.images; });
notYetImplemented(function() { document.embeds; });
notYetImplemented(function() { document.plugins; });
notYetImplemented(function() { document.links; });
notYetImplemented(function() { document.forms; });
notYetImplemented(function() { document.scripts; });
notYetImplemented(function() { document.URL; });
notYetImplemented(function() { document.domain; });
notYetImplemented(function() { document.domain = "foo"; });
notYetImplemented(function() { document.referrer; });
notYetImplemented(function() { document.cookie; });
notYetImplemented(function() { document.cookie = "foo"; });
notYetImplemented(function() { document.lastModified; });
// Commenting out this test because we've stubbed in a temporary
// implementation, but it still really isn't implemented
// notYetImplemented(function() { document.readyState; });
// Ditto for this one
// notYetImplemented(function() { document.title; });
notYetImplemented(function() { document.title = "foo" });
notYetImplemented(function() { document.dir; });
notYetImplemented(function() { document.dir = "foo"; });


