load("dom.js");

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink"

var numtests = 0;
var numpassed = 0;
var numaborted = 0;
var failures = [];

arguments.forEach(runTestFile);
report();

// Run the tests in a single named file
function runTestFile(filename) {
    putstr(filename);
    // tests separated by blank line
    var tests = snarf(filename).split("\n#data\n"); 
    tests.forEach(runTest);
    print();

    // Run a single test described by the string s
    function runTest(s, n) {
        var match = s.match(/^(?:#data\n)?((.|\n|\r)*)#errors\n((.|\n)*?)(#document-fragment\n(.*)\n)?#document\n((.|\n|\r)*)/);
        if (match) {
            var input = match[1];
            // strip trailing newline
            if (input.length > 0 && input[input.length-1] === "\n")
                input = input.substring(0, input.length-1); 
            var context = match[6];
            var expected = match[7];
            // Run the tests twice, once the whole string at a time
            // and once just one character at a time.  (But if there is a 
            // context then skip the character-at-a-time test)
            test(input, context, expected, filename, n, false);
            if (!context) test(input, context, expected, filename, n, true);
        }
        else {
            print("ERROR: Can't parse test", n, "in file", filename, s);
        }
    }
}

function test(input, context, expected, filename, testnum, charbychar) {
    numtests++;
    try {
        var output;
        if (context) {
            var root = document.createElement(context);
            HTMLParser.parseFragment(root, input);
            output = "";
            for(var i = 0; i < root.childNodes.length; i++) {
                var c = root.childNodes[i];
                output += serialize(c, " ");
            }
        }
        else {
            var parser = HTMLParser();
            var doc;
            if (charbychar) {
                for(var i = 0; i < input.length; i++) {
                    parser.append(input[i]);
                }
                doc = parser.end();
            }
            else {
                doc = parser.end(input);
            }
            output = serialize(doc, " ");
        }
        if (output === expected) {
            numpassed++;
            putstr('.');
        }
        else {
            putstr('!');
            failures.push({
                filename: filename,
                testnum: testnum,
                input: input,
                context: context,
                output: output,
                expected: expected,
                charbychar: charbychar
            });
/*
            print("FAIL: test", testnum, "in file", filename);
            print("Got:\n" + output);
            print("Expected:\n" + expected);
*/
        }
    }
    catch(e) {
        numaborted++;
        putstr('?');
        failures.push({
            filename: filename,
            input: input,
            context: context,
            testnum: testnum,
            exception: e,
            charbychar: charbychar
        });
    }
}

function serialize(n, prefix) {
    var s = "";
    switch(n.nodeType) {
    case Node.DOCUMENT_TYPE_NODE:
        var ids = "";
        if (n.publicId || n.systemId) {
            ids += ' "' + n.publicId + '"';
            ids += ' "' + n.systemId + '"';
        }
        s += "|" + prefix + "<!DOCTYPE " + n.name + ids + ">\n";
        break;
    case Node.ELEMENT_NODE:
        // XXX: some tests require namespace stuff 
        s += "|" + prefix + "<";
        if (n.namespaceURI === SVG_NAMESPACE) s += "svg ";
        else if (n.namespaceURI === MATHML_NAMESPACE) s += "math ";
        s += n.localName + ">\n";
        break;
    case Node.TEXT_NODE:
        s += "|" + prefix + '"' + n.data + '"\n';
        break;
    case Node.COMMENT_NODE:
        s += "|" + prefix + "<!-- " + n.data + " -->\n";
        break;
    }

    // XXX: what order are they in? Sort alphabetically?
    if (n.attributes && n.attributes.length) {
        var attrs = [];
        for(var i = 0; i < n.attributes.length; i++) {
            var a = n.attributes[i];
            var ns = "", name;
            switch(a.namespaceURI) {
            case XLINK_NAMESPACE:
                ns = "xlink ";
                break;
            case XML_NAMESPACE:
                ns = "xml ";
                break;
            case XMLNS_NAMESPACE:
                ns = "xmlns ";
                break;
            }
            if (ns) name = a.localName;
            else name = a.name;
            var value = a.value || "";
            attrs.push("|" + prefix + "  " + ns + name + '="' + value + '"\n');
        }

        attrs.sort();
        s += attrs.join("");
    }

    if (n.nodeType !== Node.DOCUMENT_NODE) prefix += "  ";
    for(var i = 0; i < n.childNodes.length; i++) {
        s += serialize(n.childNodes[i], prefix);
    }

    return s;
}


function report() {
    function print() {
        for(var i = 0; i < arguments.length; i++) {
            if (i > 0) putstr(" ");
            var s = String(arguments[i]);
            for(var j = 0; j < s.length; j++) {
                var c = s[j];
                var codepoint = s.charCodeAt(j);
                if (codepoint >= 0x20 && codepoint < 0x7f || codepoint === 0xa) {
                    putstr(c);
                }
                else {
                    putstr("\\");
                    var cp = codepoint.toString(16);
                    if (cp.length == 1) cp = "0" + cp;
                    if (cp.length == 2) putstr("x");
                    else putstr("u");
                    if (cp.length == 3) cp = "0" + cp;
                    for(var k = 0; k < cp.length; k++) putstr(cp[k]);
                }
            }
        }
        putstr("\n");
    }

    if (numpassed === numtests) {
        print("All", numtests, "tests passed.");
    }
    else {
        print(numpassed, "passed.");
        print(numtests - numpassed - numaborted, "failed.");
        print(numaborted, "aborted.");

        // Print the aborts first
        failures.forEach(function(f) {
            if (f.exception) {
                print("----------");
                print(f.filename, "test #" + f.testnum);
                print("Input:", f.input);
                if (f.context) print("Context", f.context);
                if (f.charbychar)
                    print("One character at a time");
                print("Aborted with:",
                      f.exception.name + ": " + f.exception.message,
                      "at", f.exception.fileName + ":" +f.exception.lineNumber);
                print(f.exception.stack.split("\n").slice(1,5).join("\n"));
                print();
            }
        });


        // Then print the failures
        failures.forEach(function(f) {
            if (f.exception) return;
            print("----------");
            print(f.filename, "test #" + f.testnum);
            print("Input:", f.input);
            if (f.context) print("Context", f.context);
            if (f.charbychar)
                print("One character at a time");
            print("Got:");
            print(f.output);
            print("Expected:");
            print(f.expected);
            print();
        });
    }
}