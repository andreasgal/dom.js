// Test an attribute that doesn't do anything special. The same value is 
// observed through content attribute and idl attribute
function testBasicAttr(name) {
    var e = document.createElement("div");

    // Set idl attribute
    var value = "value1"
    e[name] = value;
    assert(e[name] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);

    // set content attribute
    value = "value2";
    e.setAttribute(name, value);
    assert(e[name] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);

    // Set through the Attr object
    value = "value3";
    e.attributes[0].value = value;
    assert(e[name] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);
}

function testEnumeratedAttr(name, legalvals) {
    function testLegalValue(val) {
        var e = document.createElement("div");
        e.setAttribute(name, val);
        assert(e.getAttribute(name) === val);
        assert(e[name] === val.toLowerCase());

        e = document.createElement("div");
        e[name] = val;
        assert(e.getAttribute(name) === val);
        assert(e[name] === val.toLowerCase());
    }

    legalvals.forEach(function(value) {
        testLegalValue(value);
        testLegalValue(value.toUpperCase());
    });

    // Now test some illegal values.
    var illegal = "not_a_legal_value";
    var e = document.createElement("div");

    e.setAttribute(name, illegal);
    assert(e.getAttribute(name) === illegal);
    assert(e[name] === "");

    e = document.createElement("div");
    e[name] = illegal;
    assert(e.getAttribute(name) === illegal);
    assert(e[name] === "");
}


testBasicAttr("title");
testBasicAttr("lang");
testEnumeratedAttr("dir", ["ltr", "rtl", "auto"]);
