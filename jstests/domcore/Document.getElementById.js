/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.getElementById";

writeHeaderToLog( SECTION + ": "+ TITLE);

var elem = document.createElement('div');
elem.setAttribute('id', '');
delete elem;

testdc(function() {
  assert_equals(document.getElementById(""), null)
  // XXX needs more tests
})



test();

