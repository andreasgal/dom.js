/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */


startTest();
TITLE   = "CharacterData.replaceData";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testNode(node) {
  testdc(function() {
    assert_throws("INDEX_SIZE_ERR", function() { node.replaceData(5, 1, "x") })
    assert_throws("INDEX_SIZE_ERR", function() { node.replaceData(5, 0, "") })
    node.replaceData(2, 10, "yo")
    assert_equals(node.data, "teyo")
    node.data = "test"
    node.replaceData(1, 1, "waddup")
    assert_equals(node.data, "twaddupst")
    node.replaceData(1, 1, "yup")
    assert_equals(node.data, "tyupaddupst")
  })
}
testdc(function() {
  testNode(document.createTextNode("test"))
  testNode(document.createComment("test"))
});


test();

