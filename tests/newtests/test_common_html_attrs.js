// Test an attribute that doesn't do anything special. The same value is 
// observed through content attribute and idl attribute
function testStringAttr(name, idlname) {
    idlname = idlname || name;
    var e = document.createElement("div");

    // Set idl attribute
    var value = "value1"
    e[idlname] = value;
    assert(e[idlname] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);

    // set content attribute
    value = "value2";
    e.setAttribute(name, value);
    assert(e[idlname] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);

    // Set through the Attr object
    value = "value3";
    e.attributes[0].value = value;
    assert(e[idlname] === value);
    assert(e.getAttribute(name) === value);
    assert(e.attributes[0].value === value);
}

function testEnumeratedAttr(name, legalvals, idlname) {
    idlname = idlname || name;
    function testLegalValue(val) {
        var e = document.createElement("div");
        e.setAttribute(name, val);
        assert(e.getAttribute(name) === val);
        assert(e[idlname] === val.toLowerCase());

        e = document.createElement("div");
        e[idlname] = val;
        assert(e.getAttribute(name) === val);
        assert(e[idlname] === val.toLowerCase());
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
    assert(e[idlname] === "");

    e = document.createElement("div");
    e[idlname] = illegal;
    assert(e.getAttribute(name) === illegal);
    assert(e[idlname] === "");
}

function testBooleanAttribute(name, idlname) {
    idlname = idlname || name
    var e = document.createElement("div");
    assert(e.hasAttribute(name) === false);
    assert(e.getAttribute(name) === null);
    assert(e[idlname] === false);

    e.setAttribute(name, name);
    assert(e.getAttribute(name) === name);
    assert(e[idlname] === true);

    e.setAttribute(name, "");
    assert(e.getAttribute(name) === "");
    assert(e[idlname] === true);

    e.setAttribute(name, "whatever");
    assert(e.getAttribute(name) === "whatever");
    assert(e[idlname] === true);

    e[idlname] = false;
    assert(e[idlname] === false);
    assert(e.hasAttribute(name) === false);

    e[idlname] = true;
    assert(e[idlname] === true);
    assert(e.hasAttribute(name) === true);
    assert(e.getAttribute(name) === "");
}

function testSignedIntegerAttribute(name, idlname) {
    idlname = idlname || name;
    
    [-100, -10, -1, 0, 1, 10, 100].forEach(function(x) {
        var e = document.createElement("div");
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(e.getAttribute(name) === String(x));

        e = document.createElement("div");
        e.setAttribute(name, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(name) === String(x));
    });
}


testStringAttr("id");
testStringAttr("class", "className");
testStringAttr("title");
testStringAttr("lang");
testStringAttr("accesskey", "accessKey");
testEnumeratedAttr("dir", ["ltr", "rtl", "auto"]);
testBooleanAttribute("hidden");
testSignedIntegerAttribute("tabindex", "tabIndex")