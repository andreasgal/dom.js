/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE = "DOMImplementation.createDocumentType";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var tests = [
        ["foo", "", "", null],
        ["1foo", "", "", "INVALID_CHARACTER_ERR"],
        ["foo1", "", "", null],
        ["f1oo", "", "", null],
        ["@foo", "", "", "INVALID_CHARACTER_ERR"],
        ["foo@", "", "", "INVALID_CHARACTER_ERR"],
        ["f@oo", "", "", "INVALID_CHARACTER_ERR"],
        ["f:oo", "", "", null],
        [":foo", "", "", "NAMESPACE_ERR"],
        ["foo:", "", "", "NAMESPACE_ERR"],
        ["foo", "foo", "", null],
        ["foo", "", "foo", null],
        ["foo", "f'oo", "", null],
        ["foo", "", "f'oo", null],
        ["foo", 'f"oo', "", null],
        ["foo", "", 'f"oo', null],
        ["foo", "f'o\"o", "", null],
        ["foo", "", "f'o\"o", null],
        ["foo", "foo>", "", null],
        ["foo", "", "foo>", null]
     ]

  for (i in tests) {
    var test = tests[i],
        qualifiedName = test[0],
        publicId = test[1],
        systemId = test[2],
        expected = test[3]
    if (expected != null)
      assert_throws(expected, function() { document.implementation.createDocumentType(qualifiedName, publicId, systemId) })
    else
      assert_equals(document.implementation.createDocumentType(qualifiedName, publicId, systemId).nodeType, Node.DOCUMENT_TYPE_NODE)
  }
});


test();

