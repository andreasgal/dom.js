
assert(ProcessingInstruction);
assert(DocumentType);
assert(Document);

var doctype = document.implementation.createDocumentType("foo", "bar", "baz");
var doctype2 = document.implementation.createDocumentType("foo", "bar", "baz");

assertThrows(function() {
    document.implementation.createDocumentType("asdf:foo:asdf", "bar", "baz");
});

assert(doctype.name === "foo", doctype.name);
assert(doctype.publicId === "bar", doctype.publicId);
assert(doctype.systemId === "baz", doctype.systemId);

assertThrows(function() {
    doctype.cloneNode();
});

var doc = document.implementation.createDocument(
    "http://example.com/namespace", "qual", doctype);

assertThrows(function() {
    doc.cloneNode();
});

var doc2 = document.implementation.createDocument(
    "http://example.com/namespace", "qual", doctype2);

assert(doc.isEqualNode(doc2));
assert(doctype.isEqualNode(doctype2));

assert(doc.isDefaultNamespace('http://example.com/namespace'));
var element = doc.createElementNS("foo", "bar");
var elementClone = element.cloneNode();

var proc = doc.createProcessingInstruction("target", "proc");

assertThrows(function() {
    // Make sure we catch invalid characters
    doc.createProcessingInstruction("", "");
});

assert(proc.data === "proc", proc.data);

var cloned = proc.cloneNode();

cloned.data = "clone";

assert(proc.data === "proc", proc.data);
assert(cloned.data === "clone", cloned.data);

assert(proc.target === "target");
assert(cloned.target === "target");

assertThrows(function() {
    document.implementation.createDocument("foo", "bar", doctype);
});

assertThrows(function() {
    document.implementation.createDocumentType("", "");
});

var nulldoc = document.implementation.createDocument(null, null, null);

var foo = document.createElement('foo');
doc.documentElement.appendChild(foo);
assert(doc.getElementsByTagName("foo")[0] === foo);

