/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.getElementByTagNameNS";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  assert_true(document.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "html") instanceof NodeList, "NodeList")
  assert_false(document.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "html") instanceof HTMLCollection, "HTMLCollection")
  assert_true(document.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "html") !== document.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "html"), "no caching")
});


test();

