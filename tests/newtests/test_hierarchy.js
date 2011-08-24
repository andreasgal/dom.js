

assert(HTMLDivElement);

var foo = document.createElement('foo');

foo.appendChild(document.createTextNode('text'));
foo.appendChild(document.createElement('bar'));
foo.appendChild(document.createTextNode('text'));
foo.appendChild(document.createElement('baz'));
foo.appendChild(document.createTextNode('text'));
foo.appendChild(document.createElement('frotz'));
foo.appendChild(document.createTextNode('text'));

assert(foo.childNodes.length === 7, foo.childNodes.length);
assert(foo.children.length === 3, foo.children.length);
assert(foo.childElementCount === 3, foo.childElementCount);
assert(foo.firstChild.data === 'text', foo.firstChild.text);
assert(foo.firstElementChild.tagName === 'BAR');
assert(foo.lastChild.data === 'text', foo.firstChild.data);
assert(foo.lastElementChild.tagName === 'FROTZ');

assert(foo.firstChild.nextSibling.tagName === 'BAR');
assert(foo.firstChild.nextSibling.nextElementSibling.tagName === 'BAZ');

assert(foo.lastChild.previousSibling.tagName === 'FROTZ');
assert(foo.lastChild.previousSibling.previousElementSibling.tagName === 'BAZ');

var parent = document.createElement('parent');
parent.appendChild(document.createElement('child'));
parent.appendChild(document.createElement('child'));
parent.lastChild.setAttribute('class', 'foo');
parent.appendChild(document.createElement('unruly'));
parent.appendChild(document.createElement('child'));
parent.lastChild.setAttribute('class', 'foo');
parent.appendChild(document.createElement('child'));

assert(parent.childElementCount === 5);
assert(parent.getElementsByTagName('child').length === 4);

assert(parent.getElementsByClassName('foo').length === 2);

assert(parent.childNodes[999] === undefined);

// TODO: This does not call the getOwnPropertyNames function on the proxy handler.
assert(Object.getOwnPropertyNames(parent));

assert_throws(function () { parent.childNodes[1] = "HELLO"; });

parent.childNodes.foo = "bar";
assert(parent.childNodes.foo === "bar", parent.childNodes.foo);

// Trigger the enumerate func
for (var i in parent.childNodes) {
}

delete parent.childNodes.foo;
assert(parent.childNodes.foo === undefined, parent.childNodes.foo);

assert(delete parent.childNodes[9999] === true);
assert(delete parent.childNodes[0] === false);

