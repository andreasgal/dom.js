/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Document.createElement";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  var HTMLNS = "http://www.w3.org/1999/xhtml",
      valid = [
        //[input, localName],
        [undefined, "undefined"],
        ["foo", "foo"],
        ["f1oo", "f1oo"],
        ["foo1", "foo1"],
        ["f\u0300oo", "f\u0300oo"],
        ["foo\u0300", "foo\u0300"],
        [":foo", ":foo"],
        ["f:oo", "f:oo"],
        ["foo:", "foo:"],
        ["xml", "xml"],
        ["xmlns", "xmlns"],
        ["xmlfoo", "xmlfoo"],
        ["xml:foo", "xml:foo"],
        ["xmlns:foo", "xmlns:foo"],
        ["xmlfoo:bar", "xmlfoo:bar"],
        ["svg", "svg"],
        ["math", "math"],
        ["FOO", "foo"]
     ],
     invalid = [
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
     ]

  for (var i = 0, il = valid.length; i < il; i++) {
    var test = valid[i],
        elt = document.createElement(test[0])
    assert_true(elt instanceof Element)
    assert_equals(elt.localName, test[1])
    assert_equals(elt.tagName, test[1].toUpperCase())
    assert_equals(elt.prefix, null)
    assert_equals(elt.namespaceURI, HTMLNS)
  }
  for (var i = 0, il = invalid.length; i < il; i++) {
    assert_throws("INVALID_CHARACTER_ERR", function() { document.createElement(invalid[i]) })
  }
});


test();

