/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "DOMImplementation.createDocument";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var tests = [
    [null, null, null, null],
    [null, "", null, null],
    [null, "foo", null, null],
    [null, "1foo", null, "INVALID_CHARACTER_ERR"],
    [null, "f1oo", null, null],
    [null, "foo1", null, null],
    [null, ":foo", null, "NAMESPACE_ERR"],
    [null, "f:oo", null, "NAMESPACE_ERR"],
    [null, "foo:", null, "NAMESPACE_ERR"],
    [null, "xml", null, null],
    [null, "xmlns", null, "NAMESPACE_ERR"],
    [null, "xmlfoo", null, null],
    [null, "xml:foo", null, "NAMESPACE_ERR"],
    [null, "xmlns:foo", null, "NAMESPACE_ERR"],
    [null, "xmlfoo:bar", null, "NAMESPACE_ERR"],
    ["http://example.com/", null, null, null],
    ["http://example.com/", "", null, null],
    ["http://example.com/", "foo", null, null],
    ["http://example.com/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://example.com/", "f1oo", null, null],
    ["http://example.com/", "foo1", null, null],
    ["http://example.com/", ":foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "f:oo", null, null],
    ["http://example.com/", "foo:", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xml", null, null],
    ["http://example.com/", "xmlns", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlfoo", null, null],
    ["http://example.com/", "xml:foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlfoo:bar", null, null],
    ["/", null, null, null],
    ["/", "", null, null],
    ["/", "foo", null, null],
    ["/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["/", "f1oo", null, null],
    ["/", "foo1", null, null],
    ["/", ":foo", null, "NAMESPACE_ERR"],
    ["/", "f:oo", null, null],
    ["/", "foo:", null, "NAMESPACE_ERR"],
    ["/", "xml", null, null],
    ["/", "xmlns", null, "NAMESPACE_ERR"],
    ["/", "xmlfoo", null, null],
    ["/", "xml:foo", null, "NAMESPACE_ERR"],
    ["/", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["/", "xmlfoo:bar", null, null],
    ["http://www.w3.org/XML/1998/namespace", null, null, null],
    ["http://www.w3.org/XML/1998/namespace", "", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "f1oo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo1", null, null],
    ["http://www.w3.org/XML/1998/namespace", ":foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "f:oo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo:", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xml", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xmlns", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xmlfoo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xml:foo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xmlfoo:bar", null, null],
    ["http://www.w3.org/2000/xmlns/", null, null, null],
    ["http://www.w3.org/2000/xmlns/", "", null, null],
    ["http://www.w3.org/2000/xmlns/", "foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://www.w3.org/2000/xmlns/", "f1oo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "foo1", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", ":foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "f:oo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "foo:", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xml", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xmlns", null, null],
    ["http://www.w3.org/2000/xmlns/", "xmlfoo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xml:foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xmlns:foo", null, null],
    ["http://www.w3.org/2000/xmlns/", "xmlfoo:bar", null, "NAMESPACE_ERR"],
    ["foo:", null, null, null],
    ["foo:", "", null, null],
    ["foo:", "foo", null, null],
    ["foo:", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["foo:", "f1oo", null, null],
    ["foo:", "foo1", null, null],
    ["foo:", ":foo", null, "NAMESPACE_ERR"],
    ["foo:", "f:oo", null, null],
    ["foo:", "foo:", null, "NAMESPACE_ERR"],
    ["foo:", "xml", null, null],
    ["foo:", "xmlns", null, "NAMESPACE_ERR"],
    ["foo:", "xmlfoo", null, null],
    ["foo:", "xml:foo", null, "NAMESPACE_ERR"],
    ["foo:", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["foo:", "xmlfoo:bar", null, null],
  ]

  try { // XXX merge?!
    var tempTests = tests.concat([
      [null, null, document.implementation.createDocumentType("foo", "", ""), null],
      [null, null, document.doctype, "WRONG_DOCUMENT_ERR"], // This causes a horrible WebKit bug (now fixed in trunk).
      [null, null, function() {
          var foo = document.implementation.createDocumentType("foo", "", "");
          document.implementation.createDocument(null, null, foo);
          return foo;
       }(), "WRONG_DOCUMENT_ERR"], // DOCTYPE already associated with a document.
      [null, null, function() {
          var bar = document.implementation.createDocument(null, null, null);
          return bar.implementation.createDocumentType("bar", "", "");
       }(), null], // DOCTYPE created by a different implementation.
      [null, null, function() {
          var bar = document.implementation.createDocument(null, null, null);
          var magic = bar.implementation.createDocumentType("bar", "", "");
          bar.implementation.createDocument(null, null, magic);
          return magic;
       }(), "WRONG_DOCUMENT_ERR"], // DOCTYPE created by a different implementation and already associated with a document.
      [null, "foo", document.implementation.createDocumentType("foo", "", ""), null],
      ["foo", null, document.implementation.createDocumentType("foo", "", ""), null],
      ["foo", "bar", document.implementation.createDocumentType("foo", "", ""), null],
    ]);
    tests = tempTests;
  } catch (e) {
    assert_unreached()
  }

  for (var i in tests) {
    testdc(function() {
      var test = tests[i],
          namespaceURI = test[0],
          qualifiedName = test[1],
          doctype = test[2],
          expected = test[3]
      if (expected != null) {
        assert_throws(expected, function() { document.implementation.createDocument(namespaceURI, qualifiedName, doctype) })
      } else {
        var doc = document.implementation.createDocument(namespaceURI, qualifiedName, doctype)
        assert_equals(doc.nodeType, Node.DOCUMENT_NODE)
        assert_equals(doc.nodeType, doc.DOCUMENT_NODE)
        if(!qualifiedName) {
          assert_equals(doc.documentElement, null)
        }
        if(!doctype) {
          assert_equals(doc.doctype, null)
        }
        if(!qualifiedName && !doctype) {
          assert_equals(doc.childNodes.length, 0)
        }
      }
    })
  }
});


test();

