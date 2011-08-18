
var ns = document.createElementNS("namespace", "ns:foo");
document.body.appendChild(ns);

assert(ns.lookupPrefix('namespace') === "ns", ns.lookupPrefix('namespace'));

assert(ns.lookupNamespaceURI('ns') === 'namespace', ns.lookupNamespaceURI('ns'));

