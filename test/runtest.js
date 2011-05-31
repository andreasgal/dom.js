// I want to be able to take the HTML text of a W3C Dom Core test
// case, parse the HTML to build a document and then eval the scripts
// to run the test. And I want to be able to do that in a worker thread.
// I don't need fancy results reporting like
// http://w3c-test.org/resources/testharness.js gives.  Just returning
// pass or fail via postMessage will be fine.
importScripts("htmlparser.js");
importScripts("../dom.js");

onmessage = function(e) { runtest(e.data); }

function runtest(s) {
    // Parse the test
    HTMLToDOM(s, document); 

    postMessage("parsed the test case");
}
