/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.parentNode";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  // need to test for more node types
  var el = document.createElement("div")
  el.setAttribute("foo", "bar")
  var a = el.attributes[0]
  assert_equals(a.firstChild.parentNode, a)
});


test();

