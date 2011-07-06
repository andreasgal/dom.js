/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.getElementByTagName";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  assert_true(document.getElementsByTagName("html") instanceof NodeList,
      "document.getElementsByTagName('html') instanceof NodeList");
  assert_false(document.getElementsByTagName("html") instanceof HTMLCollection, "HTMLCollection")
  assert_true(document.getElementsByTagName("html") !== document.getElementsByTagName("html"), "no caching")
})
testdc(function() {
  var l = document.getElementsByTagName("nosuchtag")
  l[5] = "foopy"
  assert_equals(l.item(5), null)
}, "Expandos shouldn't affect item()")
testdc(function() {
  assert_equals(document.createElementNS("http://www.w3.org/1999/xhtml", "i").localName, "i") // Sanity
  var i = document.body.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "I"))
  assert_equals(i.localName, "I")
  assert_equals(i.tagName, "I")
  assert_equals(document.getElementsByTagName("I").length, 0)
  assert_equals(document.getElementsByTagName("i").length, 0)
  assert_equals(document.body.getElementsByTagName("I").length, 0)
  assert_equals(document.body.getElementsByTagName("i").length, 0)
})
testdc(function() {
  var t = document.body.appendChild(document.createElementNS("test", "te:st"))
  assert_equals(document.getElementsByTagName("st").length, 0)
  assert_equals(document.getElementsByTagName("te:st")[0], t)
})
testdc(function() {
  var h = document.body.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "te:st"))
  assert_equals(document.getElementsByTagName("st")[0], h)
  assert_equals(document.getElementsByTagName("TE:ST").length, 0)
})


test();

