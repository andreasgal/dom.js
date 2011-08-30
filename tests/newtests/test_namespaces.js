
var ns = document.createElementNS("namespace", "ns:foo");
document.body.appendChild(ns);

assert(ns.lookupPrefix('namespace') === "ns", ns.lookupPrefix('namespace'));

assert(ns.lookupNamespaceURI('ns') === 'namespace', ns.lookupNamespaceURI('ns'));

var ns2 = document.createElementNS("namespace", "ns:foo");
var other = document.createElement("div");
var other2 = document.createElement("span");

document.body.appendChild(other);
document.body.appendChild(ns2);
document.body.appendChild(other2);

assert(document.getElementsByTagNameNS("namespace", "foo").length === 2);

assert(document.body.getElementsByTagNameNS("namespace", "foo").length === 2);

assert(ns2.namespaceURI === "namespace", ns2.namespaceURI);
assert(ns2.prefix === "ns", ns2.prefix);
