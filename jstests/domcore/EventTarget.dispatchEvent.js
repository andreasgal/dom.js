/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "EventTarget.dispatchEvent";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var e = document.createEvent("Event")
  assert_equals(e.type, "", "Event type should be empty string before initialization")
  assert_throws("INVALID_STATE_ERR", function() { document.dispatchEvent(e) })
});


test();

