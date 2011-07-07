/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

var SECTION = "dom.js -- DOM core";
startTest();
var TITLE   = "Document.createProcessingInstruction";

writeHeaderToLog( SECTION + ": "+ TITLE);


//From Document-createProcessingInstruction.html
testdc(function() {
  assert_throws("NOT_SUPPORTED_ERR", function() { document.createProcessingInstruction("A", "B") })
});


//From Document-createProcessingInstruction.xhtml
// That means that this test has to run on an XML document
testdc(function() {
    var d = document.implementation.createDocument();
  var invalid = [
        ["A", "?>"],
        ["\u00B7A", "x"],
        ["\u00D7A", "x"],
        ["A\u00D7", "x"],
        ["\\A", "x"],
        ["\f", "x"],
        [0, "x"],
        ["0", "x"]
      ],
      valid = [
        ["xml:fail", "x"],
        ["A\u00B7A", "x"],
        ["a0", "x"]
      ]

  for (var i = 0, il = invalid.length; i < il; i++) {
    assert_throws("INVALID_CHARACTER_ERR", function() { d.createProcessingInstruction(invalid[i][0], invalid[i][1]) })
  }
  for (var i = 0, il = valid.length; i < il; ++i) {
    var pi = d.createProcessingInstruction(valid[i][0], valid[i][1]);
    assert_equals(pi.target, valid[i][0]);
    assert_equals(pi.data, valid[i][1]);
    assert_equals(pi.ownerDocument, d);
  }
});


test();

