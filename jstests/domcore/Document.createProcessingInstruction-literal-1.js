/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.createProcessingInstruction-literal-1";

writeHeaderToLog( SECTION + ": "+ TITLE);

//FIXME: Not sure that I understand this test.  The original had the following title element:
// <title>&lt;?xml?> is not a ProcessingInstruction</title>

testdc(function() {
  assert_equals(document.firstChild, document.documentElement)
})


test();

