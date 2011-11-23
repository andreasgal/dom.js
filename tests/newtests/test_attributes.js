// The tests in this file exercise the code in src/impl/Attributes.js
// and src/AttrArrayProxy.js

// Namespaces to use in our tests
var ns = "http://namespace.example.com/custom";
var ns2 = "http://namespace.example.com/custom2";
var ns3 = "http://namespace.example.com/custom3";

// Test basic set/get/has/delete methods
// An element to test on
e = document.createElement("div");
assert(e.hasAttribute("a") === false);
assert(e.getAttribute("a") === null);
e.setAttribute("a", "1");
assert(e.hasAttribute("a") === true);
assert(e.getAttribute("a") === "1");
e.removeAttribute("a");
assert(e.hasAttribute("a") === false);
assert(e.getAttribute("a") === null);

// Same tests, with the NS versions of the methods and no prefix
e = document.createElement("div");
assert(e.hasAttributeNS(ns, "a") === false);
assert(e.getAttributeNS(ns, "a") === null);
e.setAttributeNS(ns, "a", "1");
assert(e.hasAttributeNS(ns, "a") === true);
assert(e.getAttributeNS(ns, "a") === "1");
e.removeAttributeNS(ns, "a");
assert(e.hasAttributeNS(ns,"a") === false);
assert(e.getAttributeNS(ns,"a") === null);

// Now using the NS versions of the methods and a prefix
e = document.createElement("div");
assert(e.hasAttributeNS(ns, "a") === false);
assert(e.getAttributeNS(ns, "a") === null);
e.setAttributeNS(ns, "pre:a", "1");
assert(e.hasAttributeNS(ns, "a") === true);
assert(e.getAttributeNS(ns, "a") === "1");
e.removeAttributeNS(ns, "a");
assert(e.hasAttributeNS(ns,"a") === false);
assert(e.getAttributeNS(ns,"a") === null);

// Work with non-NS attrs with the NS methods
e = document.createElement("div");
e.setAttribute("a", "1");
assert(e.hasAttributeNS("", "a") === true);
assert(e.hasAttributeNS(ns, "a") === false);
assert(e.getAttributeNS("", "a") === "1");
assert(e.getAttributeNS(ns, "a") === null);
e.removeAttributeNS(ns, "a");
assert(e.hasAttributeNS("", "a") === true);
e.removeAttributeNS("", "a");
assert(e.hasAttributeNS("", "a") === false);

// Create an attribute with a NS and access it with the non-NS methods
e = document.createElement("div");
e.setAttributeNS(ns, "prefix:a", "1");
assert(e.hasAttribute("prefix:a") === true);
assert(e.hasAttribute("a") === false);
assert(e.getAttribute("prefix:a") === "1");
assert(e.getAttribute("a") === null);
e.removeAttribute("a");
assert(e.hasAttribute("prefix:a") === true);
e.removeAttribute("prefix:a");
assert(e.hasAttribute("prefix:a") === false);

// Create multiple attributes with the same qname and observe them
// through the non-ns methods
e = document.createElement("div");
e.setAttributeNS(ns, "prefix:a", "1");
e.setAttributeNS(ns2, "prefix:a", "2");
e.setAttributeNS(ns3, "prefix:a", "3");
assert(e.attributes.length === 3);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "1");
e.setAttribute("prefix:a", "4");
assert(e.getAttribute("prefix:a") === "4");
e.removeAttribute("prefix:a");
assert(e.attributes.length === 2);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "2");
e.setAttribute("prefix:a", "4");
assert(e.getAttribute("prefix:a") === "4");
e.removeAttribute("prefix:a");
assert(e.attributes.length === 1);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "3");
e.setAttribute("prefix:a", "4");
assert(e.getAttribute("prefix:a") === "4");
e.removeAttribute("prefix:a");
assert(e.attributes.length === 0);
assert(e.hasAttribute("prefix:a") === false);
assert(e.getAttribute("prefix:a") === null);

// As above, but remove the attributes with the NS methods
e = document.createElement("div");
e.setAttributeNS(ns, "prefix:a", "1");
e.setAttributeNS(ns2, "prefix:a", "2");
e.setAttributeNS(ns3, "prefix:a", "3");
assert(e.attributes.length === 3);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "1");
e.removeAttributeNS(ns2, "a");
assert(e.attributes.length === 2);
assert(e.hasAttributeNS(ns2, "a") === false);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "1");
e.removeAttributeNS(ns,"a");
assert(e.attributes.length === 1);
assert(e.hasAttributeNS(ns, "a") === false);
assert(e.hasAttribute("prefix:a") === true);
assert(e.getAttribute("prefix:a") === "3");
e.removeAttributeNS(ns3,"a");
assert(e.attributes.length === 0);
assert(e.hasAttributeNS(ns3, "a") === false);
assert(e.hasAttribute("prefix:a") === false);
assert(e.getAttribute("prefix:a") === null);

// setAttributeNS can change the prefix of an existing attribute
// and this change should be observable through getAttribute
e = document.createElement("div");
e.setAttributeNS(ns, "foo:a", "1");
assert(e.attributes.length === 1);
assert(e.hasAttribute("foo:a") === true);
assert(e.getAttribute("foo:a") === "1");
assert(e.attributes[0].prefix === "foo");
e.setAttributeNS(ns, "bar:a", "2");
assert(e.attributes.length === 1);
assert(e.hasAttribute("foo:a") === false);
assert(e.getAttribute("foo:a") === null);
assert(e.hasAttribute("bar:a") === true);
assert(e.getAttribute("bar:a") === "2");
assert(e.attributes[0].prefix === "bar");
e.removeAttribute("bar:a");

// Attribute names are be converted to lowercase for HTML elements
e = document.createElement("div");
e.setAttribute("a", "1");
assert(e.hasAttribute("A") === true);
assert(e.getAttribute("A") === "1");
e.removeAttribute("A");
assert(e.hasAttribute("A") === false);
assert(e.getAttribute("A") === null);
e.setAttribute("A", "1");
assert(e.hasAttribute("a") === true);
assert(e.getAttribute("a") === "1");
e.removeAttribute("a");
assert(e.hasAttribute("a") === false);
assert(e.getAttribute("a") === null);

// For non-HTML elements, the lowercasing doesn't happen
e = document.createElementNS(ns, "div");
e.setAttribute("a", "1");
assert(e.hasAttribute("a") === true);
assert(e.hasAttribute("A") === false);
assert(e.getAttribute("a") === "1");
assert(e.getAttribute("A") === null);
e.removeAttribute("A");
assert(e.hasAttribute("a") === true);
assert(e.getAttribute("a") === "1");
e.removeAttribute("a");
assert(e.hasAttribute("a") === false);
assert(e.getAttribute("a") === null);
e.setAttribute("A", "1");
assert(e.hasAttribute("a") === false);
assert(e.hasAttribute("A") === true);
assert(e.getAttribute("a") === null);
assert(e.getAttribute("A") === "1");
e.removeAttribute("a");
assert(e.hasAttribute("A") === true);
assert(e.getAttribute("A") === "1");
e.removeAttribute("A");
assert(e.hasAttribute("A") === false);
assert(e.getAttribute("A") === null);

// The NS methods don't lowercase attribute names, even
// on HTML elements.  That means that a non-lc qname won't be
// seen by the non-NS methods
e = document.createElement("div");
e.setAttributeNS(ns, "foo:A", "1");
assert(e.hasAttributeNS(ns, "A") === true);
assert(e.hasAttributeNS(ns, "a") === false);
assert(e.getAttributeNS(ns, "A") === "1");
assert(e.getAttributeNS(ns, "a") === null);
assert(e.hasAttribute("foo:A") === false);
assert(e.getAttribute("foo:A") === null);
e.removeAttribute("foo:A");
assert(e.getAttributeNS(ns, "A") === "1");
e.removeAttributeNS(ns, "a");
assert(e.getAttributeNS(ns, "A") === "1");
e.removeAttributeNS(ns, "A");
assert(e.getAttributeNS(ns, "A") === null);

// test the attributes array and the Attr objects its contains
e = document.createElement("div");
var attrs = e.attributes;
assert(attrs.length === 0);
assert(attrs instanceof Array);
e.setAttribute("a", "1");
assert(attrs.length === 1);
assert(attrs[0] instanceof Attr, "attrs[0] instanceof Attr");
assert(attrs[0].namespaceURI === null);
assert(attrs[0].localName === "a");
assert(attrs[0].prefix === null);
assert(attrs[0].name === "a");
assert(attrs[0].value === "1");
e.setAttribute("b", "2");
assert(attrs.length === 2);
assert(attrs[1] instanceof Attr, "attrs[1] instanceof Attr");
assert(attrs[1].namespaceURI === null);
assert(attrs[1].localName === "b");
assert(attrs[1].prefix === null);
assert(attrs[1].name === "b");
assert(attrs[1].value === "2");
attrs[1].value = "22";
assert(e.getAttribute("b") === "22");
e.setAttributeNS(ns, "prefix:c", "3");
assert(attrs.length === 3);
assert(attrs[2] instanceof Attr, "attrs[2] instanceof Attr");
assert(attrs[2].namespaceURI === ns);
assert(attrs[2].localName === "c");
assert(attrs[2].prefix === "prefix");
assert(attrs[2].name === "prefix:c");
assert(attrs[2].value === "3");
attrs[2].value = "33";
assert(e.getAttribute("prefix:c") === "33");
assert(e.getAttributeNS(ns, "c") === "33");

// The array is read-only
assertThrows(function() { attrs[3] = 0 }, "TypeError");
assertThrows(function() { attrs.push(0); }, "TypeError");
// assertThrows(function() { attrs[2] = 0 });      // Why not throwing?
// assertThrows(function() { attrs.length = 0; });
assert(attrs.indexOf(attrs[1]) === 1);
assert(attrs.indexOf(null) === -1);
assert(JSON.stringify(Object.keys(attrs)) === '["0","1","2"]');
assert(JSON.stringify(Object.getOwnPropertyNames(attrs).sort()) === '["0","1","2","length"]');

assert(delete attrs.length === false);
assert(delete attrs[0] === false);
assert(delete attrs[3] === true);  // true for out-of-bounds elements
// expand operty on attrs
attrs.my_prop = 33;
assert(attrs.my_prop === 33);
assert("my_prop" in attrs === true);
assert(delete attrs.my_prop === true);
assert("my_prop" in attrs === false);

// The idl id property reflects the "id" attribute
// And the id property works with document.getElementById()
// The className property reflects the class attribute
e = document.createElement("div");
document.body.appendChild(e);
assert(e.getAttribute("id") === null);
assert(e.id === "");
e.id = "0";
assert(e.id === "0");
assert(e.getAttribute("id") === "0");
assert(e.getAttributeNS("", "id") === "0");
assert(e.attributes[0].name === "id");
assert(e.attributes[0].localName === "id");
assert(e.attributes[0].value === "0");
assert(e.attributes[0].namespaceURI === null);
assert(e.attributes[0].prefix === null);
assert(document.getElementById("0") === e);
e.id = "1";
assert(e.id === "1");
assert(e.getAttribute("id") === "1");
assert(e.getAttributeNS("", "id") === "1");
assert(e.attributes[0].value === "1");
assert(document.getElementById("1") === e);
e.setAttribute("id", "2");
assert(e.id === "2");
assert(e.getAttribute("id") === "2");
assert(e.getAttributeNS("", "id") === "2");
assert(e.attributes[0].value === "2");
assert(document.getElementById("2") === e);
e.attributes[0].value = "3";
assert(e.id === "3");
assert(e.getAttribute("id") === "3");
assert(e.getAttributeNS("", "id") === "3");
assert(e.attributes[0].value === "3");
assert(document.getElementById("3") === e);
e.removeAttribute("id");
assert(e.id === "");
assert(e.getAttribute("id") === null);
e.id = "4";
e.removeAttributeNS("", "id");
assert(e.id === "");
e.id = "5";
e.id = "5";  // Set to the same value twice.


e.setAttribute("class", "test");
assert(e.getAttribute("class") === "test");
assert(e.className === "test");
assert(e.attributes[1].name === "class");
assert(e.attributes[1].value === "test");
assert(document.getElementsByClassName("test")[0] === e);
e.className = "foo";
assert(e.getAttribute("class") === "foo");
assert(e.className === "foo");
assert(e.attributes[1].value === "foo");
assert(document.getElementsByClassName("foo")[0] === e);
e.attributes[1].value = "bar";
assert(e.getAttribute("class") === "bar");
assert(e.className === "bar");
assert(e.attributes[1].value === "bar");
assert(document.getElementsByClassName("bar")[0] === e);

// Try setting attributes with invalid names
e = document.createElement("div");
assertThrows(function() { e.setAttribute("@@@", "1") },
             DOMException.INVALID_CHARACTER_ERR);
assertThrows(function() { e.setAttribute("xmlns:foo", "1") },
             DOMException.NAMESPACE_ERR);

assertThrows(function() { e.setAttributeNS(ns, "@@@", "1") },
             DOMException.INVALID_CHARACTER_ERR);
assertThrows(function() { e.setAttributeNS(ns, ":f:o:o", "1") },
             DOMException.NAMESPACE_ERR);

assertThrows(function() { e.setAttributeNS("", "foo:bar", "1") },
             DOMException.NAMESPACE_ERR);
assertThrows(function() { e.setAttributeNS(ns, "xml:foo", "1") },
             DOMException.NAMESPACE_ERR);
assertThrows(function() { e.setAttributeNS(ns, "xmlns:foo", "1") },
             DOMException.NAMESPACE_ERR);
assertThrows(function() { e.setAttributeNS(ns, "xmlns", "1") },
             DOMException.NAMESPACE_ERR);
assertThrows(function() { e.setAttributeNS("http://www.w3.org/2000/xmlns/",
                                           "foo:bar", "1") },
             DOMException.NAMESPACE_ERR);

// test for/in loops
// This is at the end of the file because node 0.5.10 doesn't support
// for/in over proxies and aborts with an error
attrs.my_prop = 33;
var props = [];
for(var p in attrs) if (attrs.hasOwnProperty(p)) props.push(p);
assert(JSON.stringify(props.sort()) === JSON.stringify(Object.keys(attrs).sort()));

// If we stick something enumerable on Array.prototype, we'll see it
// when we do a for/in over an attr object
Array.prototype.foo = "1";
var props = [];
for(var p in attrs) props.push(p);
assert(props.indexOf("foo" !== -1));
delete Array.prototype.foo;
var props = [];
for(var p in attrs) props.push(p);
assert(props.indexOf("foo" === -1));
