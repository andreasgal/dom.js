/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */


startTest();
TITLE   = "CharacterData.insertData";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testNode(node) {
  testdc(function() {
    assert_throws("INDEX_SIZE_ERR", function() { node.insertData(5, "x") })
    assert_throws("INDEX_SIZE_ERR", function() { node.insertData(5, "") })
    node.insertData(2, "X")
    assert_equals(node.data, "teXst")
    node.data = "test"
    node.insertData(4, "ing")
    assert_equals(node.data, "testing")
  })
}

testdc(function() {
  testNode(document.createTextNode("test"))
  testNode(document.createComment("test"))
});

test();

