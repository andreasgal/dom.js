var e1 = document.createElementNS("ns1", "prefix1:elt1");
var e2 = document.createElementNS("ns2", "prefix2:elt2");
var t = document.createTextNode("test");
document.body.appendChild(e1);
e1.appendChild(e2);
e2.appendChild(t);

assert(t.lookupPrefix("ns1") === "prefix1");
assert(e2.lookupPrefix("ns1") === "prefix1");
assert(e1.lookupPrefix("ns1") === "prefix1");
assert(t.lookupPrefix("ns2") === "prefix2");
assert(e2.lookupPrefix("ns2") === "prefix2");


assert(t.lookupNamespaceURI("prefix1") === "ns1");
assert(e2.lookupNamespaceURI("prefix1") === "ns1");
assert(e1.lookupNamespaceURI("prefix1") === "ns1");
assert(t.lookupNamespaceURI("prefix2") === "ns2");
assert(e2.lookupNamespaceURI("prefix2") === "ns2");

var e3 = document.createElement("div");
e3.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:prefix3", "ns3")
e2.appendChild(e3);
assert(e3.lookupNamespaceURI("prefix3") === "ns3");
assert(e3.lookupPrefix("ns3") === "prefix3");

/*
var e4 = document.createElement("div");
e4.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "ns4")
e2.appendChild(e4);
assert(e4.lookupNamespaceURI("prefix4") === "ns4");
assert(e4.lookupPrefix("ns4") === "");
*/

assert(e3.lookupNamespaceURI("prefix99") === null);
assert(e3.lookupPrefix("ns99") === null);

