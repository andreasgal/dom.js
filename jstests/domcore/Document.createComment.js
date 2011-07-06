/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.createComment";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var c = document.createComment("a -- b");
  assert_true(c instanceof Comment);
  assert_true(c instanceof Node);
  assert_equals(c.ownerDocument, document);
  assert_equals(c.data, "a -- b");
  assert_equals(c.nodeValue, "a -- b");
  assert_equals(c.textContent, "a -- b");
  assert_equals(c.length, 6);
  assert_equals(c.nodeType, 8);
  assert_equals(c.nodeName, "#comment");
  assert_equals(c.hasChildNodes(), false);
  assert_equals(c.childNodes.length, 0);
  assert_equals(c.firstChild, null);
  assert_equals(c.lastChild, null);
});


test();

