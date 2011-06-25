/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


var SECTION = "dom.js -- DOM core";
startTest();
var TITLE = "DOMImplementation.createDocumentType";

writeHeaderToLog( SECTION + ": "+ TITLE);

// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};

var tests = [
    ["foo", "", "", null],
    ["1foo", "", "", "INVALID_CHARACTER_ERR"],
    ["foo1", "", "", null],
    ["f1oo", "", "", null],
    ["@foo", "", "", "INVALID_CHARACTER_ERR"],
    ["foo@", "", "", "INVALID_CHARACTER_ERR"],
    ["f@oo", "", "", "INVALID_CHARACTER_ERR"],
    ["f:oo", "", "", null],
    [":foo", "", "", "NAMESPACE_ERR"],
    ["foo:", "", "", "NAMESPACE_ERR"],
    ["foo", "foo", "", null],
    ["foo", "", "foo", null],
    ["foo", "f'oo", "", null],
    ["foo", "", "f'oo", null],
    ["foo", 'f"oo', "", null],
    ["foo", "", 'f"oo', null],
    ["foo", "f'o\"o", "", null],
    ["foo", "", "f'o\"o", null],
    ["foo", "foo>", "", null],
    ["foo", "", "foo>", null]
]

for (i in tests) {
    var t = tests[i],
        qualifiedName = t[0],
        publicId = t[1],
        systemId = t[2],
        expected = t[3];

    if (expected != null) {
        compareException(
                function() { document.implementation.createDocumentType(qualifiedName, publicId, systemId); },
                expected,
                "document.implementation.createDocumentType(" + qualifiedName + "," + publicId + "," + systemId + ")");
    }
    else {
        new TestCase( SECTION,
                "document.implementation.createDocumentType(qualifiedName,publicId,systemId).nodeType " +
                        " === Node.DOCUMENT_TYPE_NODE",
                document.implementation.createDocumentType(qualifiedName, publicId, systemId).nodeType,
                Node.DOCUMENT_TYPE_NODE);
    }
}


test();

