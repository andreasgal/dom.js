var SECTION = "dom.js -- DOM core";

var TITLE = '';


// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};
console = { warn: function(){} };



// Used to set comment for a batch of tests
var comment = null;

// Utility function to test thrown errors.
// The function f should throw an error with name expectedErrName.
function compareException(f, expectedErrName, description) {
    try {
        f();
        throw { name: "No exception thrown." };
    }
    catch (e) {
        new TestCase(SECTION,
                description,
                expectedErrName,
                e.name);
    }
}


//
//  Functions below are designed to replicated DOMCore's setup
//
function assert_equals(expected, actual, desc) {
    desc = desc || comment;
    new TestCase(SECTION,
            desc,
            expected,
            actual);
}

function assert_true(b, desc) {
    assert_equals(true, b, desc);
}

function assert_false(b, desc) {
    assert_equals(false, b, desc);
}

function assert_throws(expErr, f) {
    // Assumes function is only one statement
    var desc = f.toString().split(/\n/)[1];
    compareException(f, expErr, desc);
}

// Replaces test function from DOMCore tests
function testdc(f, desc) {
    comment = desc;
    comment = comment || TITLE;
    try {
        f();
    }
    catch (e) {
        new TestCase(SECTION,
                comment,
                "unknown",
                e.toString());
    }
    comment = null;
}

