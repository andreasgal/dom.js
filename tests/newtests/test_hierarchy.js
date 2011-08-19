

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
