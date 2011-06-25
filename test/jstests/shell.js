/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/*
 * Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/licenses/publicdomain/
 */


// explicitly turn on js185
// XXX: The browser currently only supports up to version 1.8
if (typeof version != 'undefined')
{
  version(185);
}

// Utility function to test thrown errors.
// The function f should throw an error with name expectedErrName.
function compareException(f, expectedErrName, description) {
    try {
        f();
        throw { name: "No exception thrown." };
    }
    catch (e) {
        reportCompare(expectedErrName, e.name, description);
    }
}

