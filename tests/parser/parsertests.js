load("../../dom.js");

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
        // Ignore innerHTML tests for now
        if (s.match(/\n#document-fragment\n/)) {
//            print("Skipping fragment test");
            return;
        }

        var match = s.match(/^(?:#data\n)?((.|\n|\r)*)\n#errors\n((.|\n)*)#document\n((.|\n)*)/);
        if (match) {
            var input = match[1];
            var expected = match[5];
            test(input, expected, filename, n);
        }
        else {
            print("ERROR: Can't parse test", n, "in file", filename);
        }
    }
}

function test(input, expected, filename, testnum) {
    numtests++;
    try {
        var parser = HTMLParser();
        var doc = parser.end(input);
        var output = serialize(doc, " ");
    
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
                output: output,
                expected: expected
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
            testnum: testnum,
            exception: e
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
            print("Got:");
            print(f.output);
            print("Expected:");
            print(f.expected);
            print();
        });
    }
}