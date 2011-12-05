

assert(HTMLDivElement);

var foo = document.createElement('foo');

notYetImplemented(function() { foo.baseURI; });

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
assert(foo.lastChild.data === 'text', foo.lastChild.data);
assert(foo.lastElementChild.tagName === 'FROTZ');

assert(foo.firstChild.nextSibling.tagName === 'BAR');
assert(foo.firstChild.nextSibling.nextElementSibling.tagName === 'BAZ');

assert(foo.lastChild.previousSibling.tagName === 'FROTZ');
assert(foo.lastChild.previousSibling.previousElementSibling.tagName === 'BAZ');

var p = document.createElement('parent');
p.appendChild(document.createElement('child'));
p.appendChild(document.createElement('child'));
p.lastChild.setAttribute('class', 'foo');
p.appendChild(document.createElement('unruly'));
p.appendChild(document.createElement('child'));
p.lastChild.setAttribute('class', 'foo');
p.appendChild(document.createElement('child'));

assert(p.childElementCount === 5);
assert(p.getElementsByTagName('child').length === 4);

assert(p.getElementsByClassName('foo').length === 2);

assert(p.childNodes[999] === undefined);

assert(Object.getOwnPropertyNames(p.childNodes));
assert(Object.keys(p.childNodes));

//TODO: This should be raising a type error.
//assert_throws(function () { p.childNodes[1] = "HELLO"; });

p.childNodes.foo = "bar";
assert(p.childNodes.foo === "bar", p.childNodes.foo);

// Trigger the enumerate func
// XXX: commented out for now since it isn't actually asserting anything
// and because the for/in over a proxy crashes node 0.5.10
// for (var i in p.childNodes) {
// }

delete p.childNodes.foo;
assert(p.childNodes.foo === undefined, p.childNodes.foo);

assert(delete p.childNodes[9999] === true);
assert(delete p.childNodes[0] === false);

var orphan = document.createElement("orphan");
assert(!orphan.previousElementSibling);
assert(!orphan.nextElementSibling);
assert(!orphan.firstElementChild);
assert(!orphan.lastElementChild);

var orphanText = document.createTextNode("text");
assert(!orphanText.hasChildNodes());

