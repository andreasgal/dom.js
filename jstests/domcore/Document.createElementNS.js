/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.createElementNS";

writeHeaderToLog( SECTION + ": "+ TITLE);


testdc(function() {
  var invalidNames = [
    "",
    "1foo",
    "\u0300foo",
    "}foo",
    "f}oo",
    "foo}",
    "\ufffffoo",
    "f\uffffoo",
    "foo\uffff",
    "<foo",
    "foo>",
    "<foo>",
    "f<oo"
  ],
  invalidNSQNameCombinations = [
    ["", ":foo"],
    ["", "foo:"],
    ["", "foo:foo"],
    ["http://oops/", "xml:foo"],
    ["http://oops/", "xmlns"],
    ["http://oops/", "xmlns:foo"],
    ["http://www.w3.org/2000/xmlns/", "xml:foo"],
    ["http://www.w3.org/2000/xmlns/", "foo:xmlns"]
  ]

  for (var i = 0, il = invalidNames.length; i < il; i++) {
    assert_throws("INVALID_CHARACTER_ERR", function() { document.createElementNS("", invalidNames[i]) })
  }

  for (var i = 0, il = invalidNSQNameCombinations.length; i < il; i++) {
    assert_throws("NAMESPACE_ERR", function() { document.createElementNS(invalidNSQNameCombinations[i][0], invalidNSQNameCombinations[i][1]) })
  }
});


test();

