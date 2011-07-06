/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */


startTest();
TITLE   = "CharacterData.appendData";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testNode(node) {
  testdc(function() {
    assert_equals(node.data, "test")
    node.appendData("test")
    assert_equals(node.data, "testtest")
  })
}
testdc(function() {
  testNode(document.createTextNode("test"))
  testNode(document.createComment("test"))
})


test();

