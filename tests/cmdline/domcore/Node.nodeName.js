/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.nodeName";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var HTMLNS = "http://www.w3.org/1999/xhtml",
      SVGNS = "http://www.w3.org/2000/svg"
  assert_equals(document.createElementNS(HTMLNS, "I").nodeName, "I")
  assert_equals(document.createElementNS(HTMLNS, "i").nodeName, "I")
  assert_equals(document.createElementNS(SVGNS, "svg").nodeName, "svg")
  assert_equals(document.createElementNS(SVGNS, "SVG").nodeName, "SVG")
  assert_equals(document.createElementNS(HTMLNS, "x:b").nodeName, "X:B")
}, "For elements, nodeName should return the same as tagName.");

testdc(function() {
  assert_equals(document.createTextNode("foo").nodeName, "#text")
}, "For text nodes, nodeName should return \"#text\"");



test();

