// Test an attribute that doesn't do anything special. The same value is 
// observed through content attribute and idl attribute.
function testStringAttr(tagname, attrname, idlname) {
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

function testSignedIntAttr(tagname, attrname, defval, idlname) {
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

function testUnsignedIntAttr(tagname, attrname, defval, idlname) {
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


testStringAttrs("div", ["id", "title", "lang"]);
testStringAttr("div", "class", "className");
testStringAttr("div", "accesskey", "accessKey");
testEnumeratedAttr("div", "dir", null, ["ltr", "rtl", "auto"]);
testBooleanAttr("div", "hidden");

// Different tags have different default values
testSignedIntAttr("div","tabindex", -1, "tabIndex")
testSignedIntAttr("button","tabindex", 0, "tabIndex")

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
testSignedIntAttr("ol", "start", 1); 


testSignedIntAttr("li", "value", 0);

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
testUnsignedIntAttr("video", "width", 0);
testUnsignedIntAttr("video", "height", 0);

testStringAttr("table", "border");

// XXX Need to write a test for attrs like span that must be >= 1.
// Test it on both colgroup and col.
// testUnsignedGreaterThanOneAttr("colgroup", "span");
// testUnsignedGreaterThanOneAttr("col", "span");

testEnumeratedAttr("th", "scope", null, ["row", "col", "rowgroup", "colgroup"]);

// testUnsignedGreaterThanOneAttr("th", "colSpan");
// testUnsignedGreaterThanOneAttr("td", "colSpan");
testUnsignedIntAttr("th", "rowspan", 1, "rowSpan");
testUnsignedIntAttr("td", "rowspan", 1, "rowSpan");

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
// testUnsignedGreaterThanZeroAttr("input", "size");
// testSignedPositiveAttr("input", "maxlength");

testEnumeratedAttr("input", "type", null, [
    "hidden", "text", "search", "tel", "url", "email", "password",
    "datetime", "date", "month", "week", "time", "datetime-local",
    "number", "range", "color", "checkbox", "radio", "file", "submit",
    "image", "reset", "button"
], "text");
