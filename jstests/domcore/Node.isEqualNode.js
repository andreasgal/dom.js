/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.isEqualNode";

writeHeaderToLog( SECTION + ": "+ TITLE);

function isEqualNode(node) {
  testdc(function() {
    assert_false(node.isEqualNode(null))
  })
}

testdc(function() {
    isEqualNode(document.createElement("foo"))
      //isEqualNode(document.createAttribute("foo"))
      isEqualNode(document.createTextNode("foo"))
      // XXX isEqualNode(document.createCDATASection("foo"))
      // XXX Not allowed in HTML documents
      // isEqualNode(document.createProcessingInstruction("foo", "bar"))
      isEqualNode(document.createComment("foo"))
      isEqualNode(document)
      isEqualNode(document.implementation.createDocumentType("html", "", ""))
      isEqualNode(document.createDocumentFragment())
});

test();

