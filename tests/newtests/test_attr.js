

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

// Cover the AttrArray implementation
assert(foo.attributes[999] === undefined);
foo.attributes.bar = "baz";
assert(foo.attributes.bar === "baz");
delete foo.attributes.bar;
assert(foo.attributes.bar === undefined);

var readonly = false;
try {
    foo.attributes[foo.attributes.length] = 50;
} catch (e) {
    readonly = true;
}
assert(readonly);

// Can't delete length
delete foo.attributes.length;
assert(foo.attributes.length);

var attr = foo.attributes[0];
delete foo.attributes[0];
assert(attr === foo.attributes[0]);

// Here I am just covering the enumerate() implementation;
for (var i in foo.attributes) {
}

// TODO This does not seem to call the getOwnPropertyNames method on the proxy handler. Why?
var blah = Object.getOwnPropertyNames(foo);
