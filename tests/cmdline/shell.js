/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */

// Loading jstests.py utilities
var jstestsDir = environment['JSTESTS_PATH'];
load(jstestsDir + '/shell.js');

// Explicitly turn on js185
// Must be run before dom.js
if (typeof version != 'undefined') {
    version(185);
}

// Load dom.js
load('../../dom.js');

// Load utilities for running domcore tests
load('test-utils.js');

