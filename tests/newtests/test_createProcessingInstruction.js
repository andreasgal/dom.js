
assert(ProcessingInstruction);
assert(DocumentType);
assert(Document);

var doctype = document.implementation.createDocumentType("foo", "bar", "baz");

assert(doctype.name === "foo", doctype.name);
assert(doctype.publicId === "bar", doctype.publicId);
assert(doctype.systemId === "baz", doctype.systemId);

var doc = document.implementation.createDocument(
    "http://example.com/namespace", "qual", doctype);

assert(doc.isDefaultNamespace('http://example.com/namespace'));

var proc = doc.createProcessingInstruction("target", "proc");

assert(proc.data === "proc", proc.data);

var cloned = proc.cloneNode();

cloned.data = "clone";

assert(proc.data === "proc", proc.data);
assert(cloned.data === "clone", cloned.data);

assert(proc.target === "target");
assert(cloned.target === "target");

document.implementation.createDocument("", "");

assertThrows(function() {
    document.implementation.createDocument("foo", "bar", doctype);
});

assertThrows(function() {
    document.implementation.createDocumentType("", "");
});

