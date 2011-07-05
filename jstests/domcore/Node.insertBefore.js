/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

startTest();
TITLE   = "Node.insertBefore";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testHRE(node) {
  testdc(function() {
    assert_throws("HIERARCHY_REQUEST_ERR", function() { node.insertBefore(document.createTextNode("fail"), null) })
    assert_throws(new TypeError(), function() { node.insertBefore(null, null) })
  })
}
testdc(function() {
  assert_throws("HIERARCHY_REQUEST_ERR", function() { document.body.insertBefore(document.body, document.getElementById("log")) })
  assert_throws("HIERARCHY_REQUEST_ERR", function() { document.body.insertBefore(document.documentElement, document.getElementById("log")) })

  assert_throws(new TypeError(), function() { document.body.insertBefore(null, null) })

  assert_throws(new TypeError(), function() { document.body.insertBefore(null, document.body.firstChild) })

  assert_throws(new TypeError(), function() { document.body.insertBefore({'a':'b'}, document.body.firstChild) })

  document.body.setAttribute("abc", "pass")
  var attr = document.body.attributes[0]
  testHRE(attr)
  assert_equals(attr.value, "pass")
  assert_equals(attr.childNodes.length, 1)
  assert_equals(attr.childNodes[0].nodeValue, "pass")

  testHRE(document.createTextNode("Foo"))
})


test();

