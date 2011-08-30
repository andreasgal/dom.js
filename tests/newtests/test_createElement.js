
assert(Node);
assert(Element);
assert(NodeList);

assertThrows(function () {
    document.createElement('');
});

var foo = document.createElement('foo');

assert(foo.tagName === 'FOO', foo.tagName);
assert(foo.localName === 'foo', foo.localName);

// not yet implemented
notYetImplemented(function() {
    foo.baseURI;
});

foo.setAttribute('hello', 'world');
assert(foo.getAttribute('hello') === 'world', foo.getAttribute('hello'));
assert(foo.hasAttribute('hello'));
assert(foo.attributes.length === 1);
foo.removeAttribute('hello');
assert(!foo.hasAttribute('hello'));

var div = document.createElement('div');
var span = document.createElement('span');

div.setAttribute('id', 'HELLO');
div.setAttribute('class', 'CLASS');
span.setAttribute('class', 'CLASS');
document.body.appendChild(div);
document.body.appendChild(span);
assert(document.body.childNodes[0] === div, document.body.childNodes[0]);
assert(document.body.childNodes[1] === span, document.body.childNodes[1]);

assert(div.nodeType === Node.ELEMENT_NODE);
assert(div.nodeName === 'DIV', div.nodeName);
assert(div.ownerDocument === document, div.ownerDocument);
assert(div.parentElement === document.body);
assert(div.parentNode === document.body);
assert(div.hasChildNodes() === false, div.hasChildNodes());
assert(document.body.hasChildNodes() === true, document.body.hasChildNodes());
assert(document.body.childNodes.length === 2);
assert(document.body.firstChild === div);
assert(document.body.lastChild === span);
assert(!div.previousSibling, div.previousSibling);
assert(div.nextSibling === span);
assert(span.previousSibling === div);
assert(!span.nextSibling, span.nextSibling);
assert(div.compareDocumentPosition(span) & Node.DOCUMENT_POSITION_FOLLOWING, div.compareDocumentPosition(span));
assert(span.compareDocumentPosition(div) & Node.DOCUMENT_POSITION_PRECEDING, div.compareDocumentPosition(span));
assert(foo.compareDocumentPosition(div) & Node.DOCUMENT_POSITION_DISCONNECTED, foo.compareDocumentPosition(div));
assert(document.body.compareDocumentPosition(div) & Node.DOCUMENT_POSITION_CONTAINED_BY, document.body.compareDocumentPosition(div));
assert(div.compareDocumentPosition(document.body) & Node.DOCUMENT_POSITION_CONTAINS, div.compareDocumentPosition(document.body));

var another = document.createElement('div');
var text = document.createTextNode('hello')
another.appendChild(text);
assert(another.textContent, 'hello');

another.textContent = 'goodbye';

assert(another.childNodes[0].data === 'goodbye', another.childNodes[0].data);

document.body.insertBefore(another, span);

assert(document.body.childNodes[0] === div, document.body.childNodes[0]);
assert(document.body.childNodes[1] === another, document.body.childNodes[1]);
assert(document.body.childNodes[2] === span, document.body.childNodes[2]);

document.body.replaceChild(foo, another);

assert(document.body.childNodes[0] === div, document.body.childNodes[0]);
assert(document.body.childNodes[1] === foo, document.body.childNodes[1]);
assert(document.body.childNodes[2] === span, document.body.childNodes[2]);

assert(document.body.childNodes.length === 3);
document.body.removeChild(foo);
assert(document.body.childNodes.length === 2);

assert(document.body.childNodes.item(0).isSameNode(div));

var one = document.createElement('div');
var two = document.createElement('div');
var three = document.createElement('span');

assert(one.isEqualNode(two));
assert(!one.isEqualNode(three));

assert(DocumentFragment);

var fragment = document.createDocumentFragment();
assert(fragment.nodeType === document.DOCUMENT_FRAGMENT_NODE);
var clone = fragment.cloneNode();
assert(fragment.isEqualNode(clone));

assert(document.documentElement.nodeName === 'HTML');

assert(document.getElementsByTagName('div').length === 1, document.getElementsByTagName('div').length);

assert(document.getElementById('HELLO') === div);

assert(document.getElementsByClassName('CLASS').length === 2, document.getElementsByClassName('CLASS').length);

assert(!document.getElementById('DOES NOT EXIST'));

// Apparently we're allowed to have more than one element with the same id...
var duplicateId = document.createElement('span');
duplicateId.setAttribute('id', 'HELLO');
div.appendChild(duplicateId);
// But we only get the first one when we ask for it.
assert(document.getElementById('HELLO') === div);

assert(document.getElementsByTagName('*').length);