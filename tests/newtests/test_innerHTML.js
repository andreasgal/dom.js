
// innerHTML tests. innerHTML parsing is tested pretty well by test_parser.js
// so these tests exercise the code that implements the HTML fragment
// serialization algorithm:
// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#serializing-html-fragments

// Namespaces
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";


function test(input, expected) {
    try {
        var element;
        if (typeof input === "function") {
            // The function must return an element
            // This allows us to test things like processing instructions
            // that are not supported by the parser
            element = input();
        }
        else {
            element = document.createElement("div");
            element.innerHTML = input;
        }
        
        var output = element.innerHTML;
        if (typeof expected === "string")
            expected = [expected];
        
        for(var i = 0; i < expected.length; i++) {
            if (output === expected[i]) return null; // PASS
        }
        return output;
    }
    catch(e) {
        return e;
    }
}

var tests = [
    {
        name: "empty string",
        input: "",
        output: ""
    },
    {
        name: "plain text",
        input: "test",
        output: "test"
    },
    {
        name: "escaped plain text",
        input: "\u0026\u003C\u003E\u00A0",
        output: "&amp;&lt;&gt;&nbsp;"
    },
    {
        name: "escaped plain text with char attributes",
        input: "&#x26;&#x3C;&#x3E;&#xA0;",
        output: "&amp;&lt;&gt;&nbsp;"
    },
    {
        name: "unescaped plain text in <style>",
        input: "<style>&<>\u00A0</style>",
        output: "<style>&<>\u00A0</style>"
    },
    {
        name: "unescaped plain text in <script>",
        input: "<script>&<>\u00A0</script>",
        output: "<script>&<>\u00A0</script>"
    },
    {
        name: "unescaped plain text in <xmp>",
        input: "<xmp>&<>\u00A0</xmp>",
        output: "<xmp>&<>\u00A0</xmp>"
    },
    {
        name: "unescaped plain text in <iframe>",
        input: "<iframe>&<>\u00A0</iframe>",
        output: "<iframe>&<>\u00A0</iframe>"
    },
    {
        name: "unescaped plain text in <noembed>",
        input: "<noembed>&<>\u00A0</noembed>",
        output: "<noembed>&<>\u00A0</noembed>"
    },
    {
        name: "unescaped plain text in <noframes>",
        input: "<noframes>&<>\u00A0</noframes>",
        output: "<noframes>&<>\u00A0</noframes>"
    },
    {
        name: "unescaped plain text in <plaintext>",
        input: "<plaintext>&<>\u00A0", // end tag intentionally omitted
        output: "<plaintext>&<>\u00A0</plaintext>"
    },
    {
        name: "unescaped plain text in <noscript>",
        input: "<noscript>&<>\u00A0</noscript>",
        output: "<noscript>&<>\u00A0</noscript>"
    },
    {
        name: "plain text in CDATA",
        input: "<svg><![CDATA[test]]></svg>",
        output: "<svg>test</svg>"
    },
    {
        name: "escaped text in CDATA",
        input: "<svg><![CDATA[\u0026\u003C\u003E\u00A0]]></svg>",
        output: "<svg>&amp;&lt;&gt;&nbsp;</svg>"
    },
    {
        name: "comment",
        input: "<!--test-->",
        output: "<!--test-->"
    },
    {
        name: "comment with special chars",
        input: "<!-- <&> -->",
        output: "<!-- <&> -->"
    },
    {
        name: "processing instruction",
        input: function() {
            var d = document.implementation.createDocument("test", "test", null);
            var e = document.createElementNS("test","test");
            d.documentElement.appendChild(e);
            var pi = d.createProcessingInstruction("foo","bar baZ ");
            e.appendChild(pi);
            return e;
        },
        output: "<?foo bar baZ >"
    },
    {
        name: "default doctype",
        input: function() {
            var d = document.implementation.createHTMLDocument("");
            return d;
        },
        output: "<!DOCTYPE html><html><head><title></title></head><body></body></html>"
    },
    {
        name: "doctype mixed case",
        input: "<!DOCtype Html foo bar>",
        output: "<!DOCTYPE html><html><head><title></title></head><body></body></html>"
    },
    {
        name: "explicit doctype",
        input: function() {
            var d = document.implementation.createDocument("test","test", null);
            d.insertBefore(
                document.implementation.createDocumentType("test","",""),
                d.documentElement);
            return d;
        },
        output: "<!DOCTYPE test><test></test>"
    },
    {
        name: "explicit doctype with ids",
        input: function() {
            var d = document.implementation.createDocument("test","test",null);
            d.insertBefore(
                document.implementation.createDocumentType("test","systemid", "publicid"),
                d.documentElement);
            return d;
        },
        output: "<!DOCTYPE test><test></test>"
    },
    {
        name: "single element",
        input: "<br>",
        output: "<br>"
    },
    {
        name: "element with text",
        input: "<span>test</span>",
        output: "<span>test</span>"
    },
    {
        name: "element with attr",
        input: "<span id=x>test</span>",
        output: '<span id="x">test</span>'
    },
    {
        name: "nested elements",
        input: "<div><p><b>test</b></p></div>",
        output: "<div><p><b>test</b></p></div>"
    },
    {
        name: "no content for special tags",
        input: function() {
            var div = document.createElement("div");
            var tags = ["area", "base", "basefont", "bgsound", "br", "col",
                        "command", "embed", "frame", "hr", "img", "input",
                        "keygen", "link", "meta", "param", "source", "track",
                        "wbr"];
            
            tags.forEach(function(t) {
                var e = document.createElement(t);
                e.appendChild(document.createTextNode("test"));
                div.appendChild(e);
            });

            return div;

        },
        output: "<area><base><basefont><bgsound><br><col><command><embed><frame><hr><img><input><keygen><link><meta><param><source><track><wbr>"
    },
    {
        name: "no self-closing tags",
        input: "<area/><base/><basefont/><bgsound/><br/><command/><embed/><hr/><img/><input/><keygen/><link/><meta/><param/><source/><track/><wbr/><table><colgroup><col/></colgroup></table>",
        output: "<area><base><basefont><bgsound><br><command><embed><hr><img><input><keygen><link><meta><param><source><track><wbr><table><colgroup><col></colgroup></table>"
    },
// <col> <frame>
    {
        name: "prepend newline to <pre> content",
        input: "<pre>test</pre>",
        output: "<pre>\ntest</pre>"
    },
    {
        name: "prepend newline to <textarea> content",
        input: "<textarea>test</textarea>",
        output: "<textarea>\ntest</textarea>"
    },
    {
        name: "prepend newline to <listing> content",
        input: "<listing>test</listing>",
        output: "<listing>\ntest</listing>"
    },
    {
        name: "multiple attributes",
        input: "<p class='x' id='y'>test",
        output: [
            '<p class="x" id="y">test</p>',
            '<p id="y" class="x">test</p>'
        ]
    },
    {
        name: "multiple attributes, ignore extra spaces",
        input: "<p class  =  'x'   id  = y>test</p >",
        output: [
            '<p class="x" id="y">test</p>',
            '<p id="y" class="x">test</p>'
        ]
    },
    {
        name: "attribute escapes",
        input: "<span id='<&\"\u00A0>'>test</span>",
        output: '<span id="<&amp;&quot;&nbsp;>">test</span>'
    },
    {
        name: "html attribute with prefix",
        input: "<p x:foo=bar></p>",
        output: '<p x:foo="bar"></p>'
    },
    {
        name: "attribute in xml namespace",
        input: function() {
            var e = document.createElement("div");
            var p = document.createElement("p");
            e.appendChild(p);
            p.setAttributeNS(XML_NAMESPACE, "foo:bar", "1");
            return e;
        },
        output: '<p xml:bar="1"></p>'
    },
    {
        name: "attribute in xlink namespace",
        input: function() {
            var e = document.createElement("div");
            var p = document.createElement("p");
            e.appendChild(p);
            p.setAttributeNS(XLINK_NAMESPACE, "foo:bar", "1");
            return e;
        },
        output: '<p xlink:bar="1"></p>'
    },
    {
        name: "attribute in xmlns namespace",
        input: function() {
            var e = document.createElement("div");
            var p = document.createElement("p");
            e.appendChild(p);
            p.setAttributeNS(XMLNS_NAMESPACE, "xmlns:bar", "1");
            return e;
        },
        output: '<p xmlns:bar="1"></p>'
    },
    {
        name: "xmlns attribute in xmlns namespace",
        input: function() {
            var e = document.createElement("div");
            var p = document.createElement("p");
            e.appendChild(p);
            p.setAttributeNS(XMLNS_NAMESPACE, "xmlns", "1");
            return e;
        },
        output: '<p xmlns="1"></p>'
    },
    {
        name: "attribute in some other namespace",
        input: function() {
            var e = document.createElement("div");
            var p = document.createElement("p");
            e.appendChild(p);
            p.setAttributeNS("testns", "foo:bar", "1");
            return e;
        },
        output: '<p foo:bar="1"></p>'
    },
    {
        name: "svg elements are unprefixed",
        input: "<svg><g></g></svg>",
        output: '<svg><g></g></svg>'
    },
    {
        name: "mathml elements are unprefixed",
        input: "<math><mtext></mtext></math>",
        output: '<math><mtext></mtext></math>'
    },
    {
        name: "manually created svg and math elements are unprefixed",
        input: function() {
            var d = document.createElement("div");
            var s = document.createElementNS(SVG_NAMESPACE, "svg:svg");
            d.appendChild(s);
            var m = document.createElementNS(MATHML_NAMESPACE, "math:math");
            d.appendChild(m);
            return d;
        },
        output: '<svg></svg><math></math>'
    },
    {
        name: "manually created svg and math elements are case-sensitive",
        input: function() {
            var d = document.createElement("div");
            var s = document.createElementNS(SVG_NAMESPACE, "foo:SVG");
            d.appendChild(s);
            var m = document.createElementNS(MATHML_NAMESPACE, "bar:Math");
            d.appendChild(m);
            return d;
        },
        output: '<SVG></SVG><Math></Math>'
    },
    {
        name: "elements in other namespace have prefix and are case sensitive",
        input: function() {
            var d = document.createElement("div");
            var e = document.createElementNS("testns", "Test:TEST");
            d.appendChild(e);
            return d;
        },
        output: '<Test:TEST></Test:TEST>'
    },
    {
        name: "comment with illegal content",
        input: function() {
            var p = document.createElement("p");
            var c = document.createComment("");
            p.appendChild(c);
            c.appendData("-->");
            return p;
        },
        output: '<!---->-->'
    },
];

tests.forEach(function(t, i) {
    var got
    if (got = test(t.input, t.output)) {
        var expected;
        if (typeof t.output === "string") 
            expected = t.output;
        else
            expected = JSON.stringify(t.output);
        print("FAILED innerHTML test", i, t.name, "\ngot:", got, "\nexpected:",
              expected);
    }
});
print("DONE");
