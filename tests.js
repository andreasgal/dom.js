load("dom.js");

var x = new DOMStringList(["foo", "bar"]);
assertEq(x.length, 2);
assertEq(x.item(0), "foo");
assertEq(x.item(1), "bar");
assertEq(x[0], "foo");
assertEq(x[1], "bar");
assertEq(x.contains("foo"), true);
assertEq(x.contains("bar"), true);
assertEq(x.contains("notme"), false);
assertEq(Object.getOwnPropertyNames(x).length, 0);
assertEq(Object.keys(x).length, 0);
