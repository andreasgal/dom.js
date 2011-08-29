
// Tests for basic CharacterData and Text apis.
assert(CharacterData);
assert(Text);

var data = 'foo';
var foo = document.createTextNode(data);

assert(foo.ownerDocument === document, foo.ownerDocument);
assert(foo.data === data, foo.data);

var foobar = "foobar";
foo.data = "foobar";

assert(foo.data === foobar, foo.data);

assert(foo.length === 6, foo.length);

var sub = foo.substringData(0, 3);

assert(sub === "foo", sub);

assertThrows(function() { foo.substringData(999,2); });

foo.appendData("baz");

assert(foo.data === "foobarbaz", foo.data);

foo.insertData(3, "bam");

assert(foo.data === "foobambarbaz", foo.data);

assertThrows(function() {foo.insertData(999,2); });

foo.deleteData(3, 3);

assert(foo.data === "foobarbaz", foo.data);

assertThrows(function() { foo.deleteData(999,2); });

foo.replaceData(1, 7, "rot");

assert(foo.data === "frotz", foo.data);

var spl = foo.splitText(3);

assert(spl.data === "tz", spl.data);
assert(foo.data === "fro", foo.data);

spl.nodeValue = "frotz"

assert(spl.nodeValue === "frotz", spl.nodeValue);
assert(spl.data === "frotz", spl.data);

var clone = spl.cloneNode();

assert(clone.data === "frotz", clone.data);

clone.deleteData(3,999);

assert(clone.data === 'fro', clone.data);

clone.replaceData(2,999,'ee');

assert(clone.data === 'free', clone.data);

assertThrows(function() { foo.replaceData(999,2,'asdfafsdasdffdsa'); });

var free = document.createTextNode('free');

assert(free.isEqualNode(clone));

notYetImplemented(function() {
    free.wholeText;
});

notYetImplemented(function() {
    free.replaceWholeText("asdf");
});

