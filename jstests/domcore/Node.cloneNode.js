/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.cloneNode";

writeHeaderToLog( SECTION + ": "+ TITLE);

testdc(function() {
  assert_throws("DATA_CLONE_ERR", function() { document.cloneNode(true) });
  assert_throws("DATA_CLONE_ERR", function() { document.cloneNode(false) });
  assert_throws("DATA_CLONE_ERR", function() { document.doctype.cloneNode(true) });
  assert_throws("DATA_CLONE_ERR", function() { document.doctype.cloneNode(false) });
});

testdc(function() {
  var el = document.createElement("foo");
  el.appendChild(document.createElement("bar"));
  el.setAttribute("a", "b");
  el.setAttribute("c", "d");
  var c = el.cloneNode(false);
  assert_true(c.attributes != el.attributes);
  assert_true(c.attributes !== el.attributes);
  assert_true(c.attributes[0] !== el.attributes[0]);
  assert_equals(c.attributes.length, el.attributes.length);
  for (var i = 0, il = el.attributes.length; i < il; ++i) {
    assert_equals(c.attributes[i].name, el.attributes[i].name);
    assert_equals(c.attributes[i].prefix, el.attributes[i].prefix);
    assert_equals(c.attributes[i].namespaceURI, el.attributes[i].namespaceURI);
    assert_equals(c.attributes[i].value, el.attributes[i].value);
  }
  assert_equals(c.childNodes.length, 0);
});

test();

