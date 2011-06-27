/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/*
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/licenses/publicdomain/
 */


// explicitly turn on js185
// Must be run before dom.js
if (typeof version != 'undefined') {
  version(185);
}

var SECTION = "dom.js -- DOM core";

var TITLE = '';

// Used to set comment for a batch of tests
var comment = null;

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

function assert_throws(expErr, f) {
    // Assumes function is only one statement
    var desc = f.toString().split(/\n/)[1];
    compareException(f, expErr, desc);
}

