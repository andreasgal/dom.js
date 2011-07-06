/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.hasAttributes";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var el = document.createElement("foo")
  assert_false(el.hasAttributes())
  el.setAttribute("bar", "baz");
  assert_true(el.hasAttributes())
  el.removeAttribute("bar");
  assert_false(el.hasAttributes())

  assert_false(document.hasAttributes())
  assert_false(document.doctype.hasAttributes())
  assert_false(document.createDocumentFragment().hasAttributes())
  assert_false(document.createTextNode("A").hasAttributes())
  assert_false(document.createComment("A").hasAttributes())
});

test();

