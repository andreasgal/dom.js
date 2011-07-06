/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "CharacterData.deleteData";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testNode(node) {
  testdc(function() {
    assert_throws("INDEX_SIZE_ERR", function() { node.deleteData(5, 10) })
    assert_throws("INDEX_SIZE_ERR", function() { node.deleteData(5, 0) })
    node.deleteData(2, 10)
    assert_equals(node.data, "te")
    node.data = "test"
    node.deleteData(1, 1)
    assert_equals(node.data, "tst")
  })
}

testdc(function() {
  testNode(document.createTextNode("test"))
  testNode(document.createComment("test"))
});


test();

