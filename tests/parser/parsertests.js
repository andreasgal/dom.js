load("../../dom.js");

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
        var parser = HTMLParser(document.implementation);
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
            if (n.publicId) 
                ids += ' "' + n.publicId + '"';
            if (n.systemId) 
                ids += ' "' + n.systemId + '"';
        }
        s += "|" + prefix + "<!DOCTYPE " + n.name + ids + ">\n";
        break;
    case Node.ELEMENT_NODE:
        // XXX: some tests require namespace stuff 
        s += "|" + prefix + "<" + n.localName + ">\n";
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
        for(var i = 0; i < n.attributes.length; i++) {
            var a = n.attributes[i];
            s += "|" + prefix + "  " + a.name + '="' + a.value + '"\n';
        }
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

        failures.forEach(function(f) {
            print("----------");
            print(f.filename, "test #" + f.testnum);
            print("Input:", f.input);
            if (f.exception) {
                print("Aborted with:",
                      f.exception.name + ": " + f.exception.message,
                      "at", f.exception.fileName + ":" +f.exception.lineNumber);
            }
            else {
                print("Got:");
                print(f.output);
                print("Expected:");
                print(f.expected);
            }
            print();
        });
    }
}