

assert(Attr);

var foo = document.createElement('foo');
foo.setAttribute('bar', 'baz');

assert(foo.attributes.length === 1);
assert(foo.attributes[0].name === 'bar', foo.attributes[0].name);
assert(foo.attributes[0].value === 'baz', foo.attributes[0].value);

foo.attributes[0].value = 'frotz';
assert(foo.getAttribute('bar') === 'frotz');

foo.setAttributeNS('namespace', 'ns:foo', 'bamf');

assert(foo.attributes[1].prefix === 'ns', foo.attributes[1].prefix);
assert(foo.attributes[1].localName === 'foo', foo.attributes[1].localName);
assert(foo.attributes[1].namespaceURI === 'namespace', foo.attributes[1].namespaceURI);

assert(foo.hasAttributeNS('namespace', 'foo'));
assert(foo.getAttributeNS('namespace', 'foo') === 'bamf');
foo.removeAttributeNS('namespace', 'foo');
assert(!foo.hasAttributeNS('namespace', 'foo'));

var bar = document.createElementNS('namespace', 'element');
document.body.appendChild(bar);
assert(document.getElementsByTagNameNS('namespace', 'element').length === 1);
