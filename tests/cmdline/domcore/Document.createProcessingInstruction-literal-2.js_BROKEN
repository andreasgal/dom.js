/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.createProcessingInstruction-literal-2";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var pienc = document.firstChild;
  assert_true(pienc instanceof ProcessingInstruction)
  assert_equals(pienc.target, "xml-stylesheet")
  assert_equals(pienc.data, 'href="support/style.css" type="text/css"')
})

test();

