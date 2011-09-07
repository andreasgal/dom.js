// Test an attribute that doesn't do anything special. The same value is 
// observed through content attribute and idl attribute.
function testStringAttr(tagname, attrname, idlname) {
    if (Array.isArray(tagname)) {
        tagname.forEach(function(t) { testStringAttr(t, attrname, idlname); });
        return;
    }

    idlname = idlname || attrname;
    var e = document.createElement(tagname);

    // Set idl attribute
    var value = "value1"
    e[idlname] = value;
    assert(e[idlname] === value);
    assert(e.getAttribute(attrname) === value);
    assert(e.attributes[0].value === value);

    // set content attribute
    value = "value2";
    e.setAttribute(attrname, value);
    assert(e[idlname] === value);
    assert(e.getAttribute(attrname) === value);
    assert(e.attributes[0].value === value);

    // Set through the Attr object
    value = "value3";
    e.attributes[0].value = value;
    assert(e[idlname] === value);
    assert(e.getAttribute(attrname) === value);
    assert(e.attributes[0].value === value);
}

function testStringAttrs(tagname, attrnames) {
    attrnames.forEach(function(n) { testStringAttr(tagname, n); });
}

function testEnumeratedAttr(tagname, attrname, idlname, legalvals,
                            missing_default, invalid_default)
{
    if (Array.isArray(tagname)) {
        tagname.forEach(function(t) {
            testEnumeratedAttr(t, attrname, idlname, legalvals,
                               missing_default, invalid_default);
        });
        return;
    }

    idlname = idlname || attrname;
    function testLegalValue(val) {
        var e = document.createElement(tagname);
        e.setAttribute(attrname, val);
        assert(e.getAttribute(attrname) === val);
        assert(e[idlname] === val.toLowerCase());

        e = document.createElement(tagname);
        e[idlname] = val;
        assert(e.getAttribute(attrname) === val);
        assert(e[idlname] === val.toLowerCase());
    }

    legalvals.forEach(function(value) {
        testLegalValue(value);
        testLegalValue(value.toUpperCase());
    });

    var e = document.createElement(tagname);

    // Test the missing default value
    assert(e[idlname] === (missing_default || ""));

    // Now test some illegal values.
    var illegal = "not_a_legal_value";

    e.setAttribute(attrname, illegal);
    assert(e.getAttribute(attrname) === illegal);
    assert(e[idlname] === (invalid_default || missing_default || ""));

    e = document.createElement(tagname);
    e[idlname] = illegal;
    assert(e.getAttribute(attrname) === illegal);
    assert(e[idlname] === (invalid_default || missing_default || ""));
}

function testBooleanAttr(tagname, attrname, idlname) {
    if (Array.isArray(tagname)) {
        tagname.forEach(function(t) { testBooleanAttr(t, attrname, idlname); });
        return;
    }

    idlname = idlname || attrname
    var e = document.createElement(tagname);
    assert(e.hasAttribute(attrname) === false);
    assert(e.getAttribute(attrname) === null);
    assert(e[idlname] === false);

    e.setAttribute(attrname, attrname);
    assert(e.getAttribute(attrname) === attrname);
    assert(e[idlname] === true);

    e.setAttribute(attrname, "");
    assert(e.getAttribute(attrname) === "");
    assert(e[idlname] === true);

    e.setAttribute(attrname, "whatever");
    assert(e.getAttribute(attrname) === "whatever");
    assert(e[idlname] === true);

    e[idlname] = false;
    assert(e[idlname] === false);
    assert(e.hasAttribute(attrname) === false);

    e[idlname] = true;
    assert(e[idlname] === true);
    assert(e.hasAttribute(attrname) === true);
    assert(e.getAttribute(attrname) === "");
}

// Test attributes of type long that can be negative or positive
function testIntAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 0;

    [-100, -10, -1, 0, 1, 10, 100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });


    // Now test default value and non-numbers
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);
    e[idlname] = "foo";  // The IDL layer converts this to the number 0
    assert(e[idlname] === 0);
    assert(e.getAttribute(attrname) === "0");

    var e = document.createElement(tagname);
    e.setAttribute(attrname, "foo");
    assert(e[idlname] === defval);  // Can't parse "foo" so use the default
    assert(e.getAttribute(attrname) === "foo");
}

// Test attributes of type long must be >= 0
function testNonNegIntAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 0;

    // Test legal values
    [0, 1, 10, 100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });


    // Now test default value and non-numbers
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);
    e[idlname] = "foo";  // The IDL layer converts this to the number 0
    assert(e[idlname] === 0);
    assert(e.getAttribute(attrname) === "0");

    var e = document.createElement(tagname);
    e.setAttribute(attrname, "foo");
    assert(e[idlname] === defval);  // Can't parse "foo" so use the default
    assert(e.getAttribute(attrname) === "foo");

    // try some illegal values
    // Setting to -1 should throw an error
    var e = document.createElement(tagname);
    assertThrows(function() { e[idlname] = -1; }, DOMException.INDEX_SIZE_ERR);
    assert(e[idlname] === defval);

    e.setAttribute(attrname, "-1")
    assert(e.getAttribute(attrname) === "-1");
    assert(e[idlname] === defval);
}

// test attributes of type unsigned long that can have any value >= 0
function testUIntAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 0;

    [0, 1, 10, 100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });


    // Now test default value and non-numbers
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);
    e[idlname] = "foo";  // The IDL layer converts this to the number 0
    assert(e[idlname] === 0);
    assert(e.getAttribute(attrname) === "0");

    var e = document.createElement(tagname);
    e.setAttribute(attrname, "foo");
    assert(e[idlname] === defval);  // Can't parse "foo" so use the default
    assert(e.getAttribute(attrname) === "foo");
}

// Test unsigned long attrs that are not allowed to be 0
function testNonZeroUIntAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 1;

    [1, 10, 100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });


    // Now test default value
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);

    // Setting to 0 should throw an error
    assertThrows(function() { e[idlname] = 0; }, DOMException.INDEX_SIZE_ERR);
    assert(e[idlname] === defval);

    e.setAttribute(attrname, "0")
    assert(e.getAttribute(attrname) === "0");
    assert(e[idlname] === defval);
   

    // Now test non-numbers
    // The IDL layer converts this to the number 0
    assertThrows(function() { e[idlname] = "foo"; },
                 DOMException.INDEX_SIZE_ERR);
    assert(e[idlname] === defval);
    e.setAttribute(attrname, "foo");
    assert(e[idlname] === defval);  // Can't parse "foo" so use the default
    assert(e.getAttribute(attrname) === "foo");
}

function testFloatAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 0.0;
    
    [-1.0e2,-10,-1.23,-.123,0.0,1.23e-2,1.23,Math.PI,100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(Number(e.getAttribute(attrname)) === x);

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });

    // Test default value
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);

    // Non-numeric values
    e.setAttribute(attrname, "foo");
    assert(e.getAttribute(attrname) === "foo");
    assert(e[idlname], defval);

    // Setting Infinity or NaN should throw an error
    [Infinity, NaN, -Infinity, "foo"].forEach(function(x) {
        var e = document.createElement(tagname);
        assertThrows(function() { e[idlname] = x; }, 
                     DOMException.NOT_SUPPORTED_ERR);
    });
}

function testPositiveFloatAttr(tagname, attrname, defval, idlname) {
    idlname = idlname || attrname;
    if (defval === undefined) defval = 0.0;
    
    [1,1.23e-2,1.23,Math.PI,100].forEach(function(x) {
        var e = document.createElement(tagname);
        e[idlname] = x;
        assert(e[idlname] === x);
        assert(Number(e.getAttribute(attrname)) === x);

        e = document.createElement(tagname);
        e.setAttribute(attrname, String(x));
        assert(e[idlname] === x);
        assert(e.getAttribute(attrname) === String(x));
    });

    // Test default value
    var e = document.createElement(tagname);
    assert(e[idlname] === defval);

    // Non-numeric values
    e.setAttribute(attrname, "foo");
    assert(e.getAttribute(attrname) === "foo");
    assert(e[idlname], defval);

    // Setting Infinity or NaN should throw an error
    [Infinity, NaN, -Infinity, "foo"].forEach(function(x) {
        var e = document.createElement(tagname);
        assertThrows(function() { e[idlname] = x; }, 
                     DOMException.NOT_SUPPORTED_ERR);
    });

    // Setting a negative number through idl should be ignored
    e = document.createElement(tagname);
    e[idlname] = -2.0;
    assert(e[idlname] === defval);
    assert(e.hasAttribute(attrname) === false);
    e[idlname] = 1.0;
    e[idlname] = -1.0;
    assert(e[idlname] === 1.0);
    assert(Number(e.getAttribute(attrname)) === 1.0);

    // Setting a negative number with setAttribute should return defval
    // through idl
    e = document.createElement(tagname);
    e.setAttribute(attrname, "-1.25");
    assert(e.getAttribute(attrname) === "-1.25");
    assert(e[idlname], defval);
}


testStringAttrs("div", ["id", "title", "lang"]);
testStringAttr("div", "class", "className");
testStringAttr("div", "accesskey", "accessKey");
testEnumeratedAttr("div", "dir", null, ["ltr", "rtl", "auto"]);
testBooleanAttr("div", "hidden");

// Different tags have different default values
testIntAttr("div","tabindex", -1, "tabIndex")
testIntAttr("button","tabindex", 0, "tabIndex")

testStringAttr("base", "target");

testStringAttrs("link", ["rel", "media", "hreflang","type"]);

testStringAttrs("meta", ["name", "content"]);
testStringAttr("meta", "http-equiv", "httpEquiv");

testStringAttrs("style", ["media", "type"]);
testBooleanAttr("style", "scoped");

testStringAttrs("script", ["type", "charset"]);
testBooleanAttr("script", "defer");

testStringAttr("q", "cite");
testStringAttr("blockquote", "cite");

testStringAttr("ol", "type");
testBooleanAttr("ol", "reversed");
// XXX: the default value of the start attribute for <ol reversed> is 
// the number of <li> children. Need a test for that case.
testIntAttr("ol", "start", 1); 


testIntAttr("li", "value", 0);

testStringAttrs("a",["download", "target", "rel", "media", "hreflang", "type"]);

testStringAttr("time", "datetime", "dateTime");
testBooleanAttr("time", "pubdate", "pubDate");

testStringAttr("ins", "cite");
testStringAttr("ins", "datetime", "dateTime");
testStringAttr("del", "cite");
testStringAttr("del", "datetime", "dateTime");

testStringAttr("img", "alt");
testStringAttr("img", "crossorigin", "crossOrigin");
testStringAttr("img", "usemap", "useMap");
testBooleanAttr("img", "ismap", "isMap");

testStringAttrs("iframe", ["srcdoc","name"]);
testBooleanAttr("iframe", "seamless");

testStringAttr("embed", "type");

testStringAttrs("object", ["type", "name"]);
testStringAttr("object", "usemap", "useMap");
testBooleanAttr("object", "typemustmatch", "typeMustMatch");

testStringAttrs("source", ["type", "media"]);

testStringAttrs("track", ["srclang", "label"]);
testBooleanAttr("track", "default");
testEnumeratedAttr("track", "kind", null, 
                   ["subtitles","captions","descriptions", "chapters","metadata"],
                  "subtitles");

testStringAttr("audio", "crossorigin", "crossOrigin");
testStringAttr("audio", "mediagroup", "mediaGroup");
testEnumeratedAttr("audio", "preload", null, 
                   ["none", "metadata", "auto"], 
                   "metadata");
testBooleanAttr("audio", "loop");
testBooleanAttr("audio", "autoplay");
testBooleanAttr("audio", "controls");
testBooleanAttr("audio", "muted", "defaultMuted");

testStringAttr("video", "crossorigin", "crossOrigin");
testStringAttr("video", "mediagroup", "mediaGroup");
testEnumeratedAttr("video", "preload", null, 
                   ["none", "metadata", "auto"], 
                   "metadata");
testBooleanAttr("video", "loop");
testBooleanAttr("video", "autoplay");
testBooleanAttr("video", "controls");
testBooleanAttr("video", "muted", "defaultMuted");

testStringAttr("map", "name");

testStringAttrs("area",[
    "alt", "target", "download", "rel", "media",
    "hreflang", "type", "shape", "coords"
]);

// These are string attributes
testStringAttrs("iframe", ["width","height"]);
testStringAttrs("object", ["width","height"]);
testStringAttrs("embed", ["width","height"]);

// But these are integers
testUIntAttr("video", "width", 0);
testUIntAttr("video", "height", 0);

testStringAttr("table", "border");

// Test it on both colgroup and col.
testNonZeroUIntAttr("colgroup", "span");
testNonZeroUIntAttr("col", "span");

testEnumeratedAttr("th", "scope", null, ["row", "col", "rowgroup", "colgroup"]);

testNonZeroUIntAttr("th", "colspan", 1, "colSpan");
testNonZeroUIntAttr("td", "colspan", 1, "colSpan");
testUIntAttr("th", "rowspan", 1, "rowSpan");
testUIntAttr("td", "rowspan", 1, "rowSpan");

/*
 * Can't create form elements yet, because they need a FormElementProxy class.
 *
testStringAttr("form", "name");
testStringAttr("form", "accept-charset", "acceptCharset");
testEnumeratedAttr("form", "autocomplete", null, ["on", "off"], "on");
*/

testBooleanAttr("fieldset", "disabled");

testStringAttr("label", "for", "htmlFor");

testStringAttrs("input", [
    "accept","alt","max", "min","pattern", "placeholder", "step"
]);
testStringAttr("input", "dirname", "dirName");
testStringAttr("input", "value", "defaultValue");
testBooleanAttr("input", "multiple");
testBooleanAttr("input", "required");
testBooleanAttr("input", "readonly", "readOnly");
testBooleanAttr("input", "checked", "defaultChecked");
testNonZeroUIntAttr("input", "size", 20);
testNonNegIntAttr("input", "maxlength", -1, "maxLength");

testEnumeratedAttr("input", "type", null, [
    "hidden", "text", "search", "tel", "url", "email", "password",
    "datetime", "date", "month", "week", "time", "datetime-local",
    "number", "range", "color", "checkbox", "radio", "file", "submit",
    "image", "reset", "button"
], "text");

testStringAttr("button", "value");
testEnumeratedAttr("button", "type", null,
                   ["submit","reset","button"], 
                   "submit");

//
// XXX: Can't test these yet because I need a SelectElementProxy
// 
//testBooleanAttr("select", "multiple")
//testBooleanAttr("select", "required")
//testUIntAttr("select", "size", 0);

testBooleanAttr("optgroup", "disabled")
testStringAttr("optgroup", "label")

testBooleanAttr("option", "disabled")
testBooleanAttr("option", "selected", "defaultSelected")
testStringAttr("option", "label")

testStringAttr("textarea", "placeholder");
testStringAttr("textarea", "wrap");
testStringAttr("textarea", "dirname", "dirName");
testBooleanAttr("textarea", "required");
testBooleanAttr("textarea", "readonly", "readOnly");
testNonZeroUIntAttr("textarea", "cols", 20);
testNonZeroUIntAttr("textarea", "rows", 2);
testNonNegIntAttr("textarea", "maxlength", -1, "maxLength");


testStringAttr("keygen", "challenge");
testEnumeratedAttr("keygen", "keytype", null, ["rsa"], "rsa");

testPositiveFloatAttr("progress", "max", 1.0);

testStringAttr(["fieldset",
                "input",
                "button",
// XXX               "select",  Need proxy to test this
                "textarea",
                "keygen",
                "output",
               ], "name");

testBooleanAttr([
    "input",
    "button",
//    "select", XXX: needs proxy
    "textarea",
    "keygen"
], "disabled");

testBooleanAttr([
    "input",
    "button",
//    "select", XXX: needs proxy
    "textarea",
    "keygen"
], "autofocus");

/* XXX
 * Can't test form elements until I at least have a stub for 
 * HTMLFormElementProxy
 * 
testStringAttr("form", "target");
testBooleanAttr("form", "novalidate", "noValidate");
testEnumeratedAttr("form", "method", null, 
                   ["get", "post"], "get");
testEnumeratedAttr("form", "enctype", null, 
                   ["application/x-www-form-urlencoded",
                    "multipart/form-data",
                    "text/plain"],
                   "application/x-www-form-urlencoded");
testEnumeratedAttr("form", "encoding", null, 
                   ["application/x-www-form-urlencoded",
                    "multipart/form-data",
                    "text/plain"],
                   "application/x-www-form-urlencoded");

// enctype and encoding are two idl names for the same content attribute.
// This isn't tested by any of the tests above, so check explicitly that it 
// works.
var f = document.createElement("form");
f.setAttribute("enctype", "foo/bar");
assert(f.enctype === "foo/bar");
assert(f.encoding === "foo/bar");
f.encoding = "text/plain";
assert(f.enctype === "text/plain");
assert(f.getAttribute("enctype") === "text/plain");
f.enctype = "multipart/form-data";
assert(f.encoding === "multipart/form-data");
assert(f.getAttribute("enctype") === "multipart/form-data");
*/

testStringAttr(["input", "button"], "formtarget", "formTarget");
testEnumeratedAttr(["input","button"], "formmethod", "formMethod",
                   ["get", "post"], "get");
testEnumeratedAttr(["input","button"], "formenctype", "formEnctype", 
                   ["application/x-www-form-urlencoded",
                    "multipart/form-data",
                    "text/plain"],
                   "application/x-www-form-urlencoded");
testBooleanAttr(["input", "button"], "formnovalidate", "formNoValidate");

testBooleanAttr("details", "open");

testBooleanAttr("command", "checked");
testBooleanAttr("command", "disabled");
testStringAttrs("command", ["label", "radiogroup"]);
testEnumeratedAttr("command", "type", null,
                   ["command","checkbox","radio"], "command");

testStringAttrs("menu", ["type", "label"]);