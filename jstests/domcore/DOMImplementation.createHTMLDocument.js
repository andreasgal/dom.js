/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "DOMImplementation.createHTMLDocument";

writeHeaderToLog( SECTION + ": "+ TITLE);

function checkDoc(title, expectedtitle, normalizedtitle) {
  testdc(function() {
    var doc = document.implementation.createHTMLDocument(title);
    assert_equals(doc.doctype.name, "html")
    assert_equals(doc.doctype.publicId, "")
    assert_equals(doc.doctype.systemId, "")
    assert_equals(doc.documentElement.localName, "html")
    assert_equals(doc.documentElement.firstChild.localName, "head")
    assert_equals(doc.documentElement.firstChild.childNodes.length, 1)
    assert_equals(doc.documentElement.firstChild.firstChild.localName, "title")
    assert_equals(doc.documentElement.firstChild.firstChild.firstChild.data,
    expectedtitle)
    assert_equals(doc.documentElement.lastChild.localName, "body")
    assert_equals(doc.documentElement.lastChild.childNodes.length, 0)
    assert_equals(doc.title, normalizedtitle)
  })
}
checkDoc("", "", "")
checkDoc(null, "null", "null")
checkDoc(undefined, "undefined", "undefined")
checkDoc("foo  bar baz", "foo  bar baz", "foo bar baz")
checkDoc("foo\t\tbar baz", "foo\t\tbar baz", "foo bar baz")
checkDoc("foo\n\nbar baz", "foo\n\nbar baz", "foo bar baz")
checkDoc("foo\f\fbar baz", "foo\f\fbar baz", "foo bar baz")
checkDoc("foo\r\rbar baz", "foo\r\rbar baz", "foo bar baz")


test();

