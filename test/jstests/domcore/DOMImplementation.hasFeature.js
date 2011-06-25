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
var TITLE   = "DOMImplementaion.hasFeature";

writeHeaderToLog( SECTION + ": "+ TITLE);

// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};
console = { warn: function(){} };

var tests = [
        ["Core", "1.0", false],
        ["Core", "2.0", true],
        ["Core", "3.0", false],
        ["Core", "100.0", false],
        ["XML", "1.0", true],
        ["XML", "2.0", true],
        ["XML", "3.0", false],
        ["XML", "100.0", false],
        ["Core", "1", false],
        ["Core", "2", false],
        ["Core", "3", false],
        ["Core", "100", false],
        ["XML", "1", false],
        ["XML", "2", false],
        ["XML", "3", false],
        ["XML", "100", false],
        ["Core", "1.1", false],
        ["Core", "2.1", false],
        ["Core", "3.1", false],
        ["Core", "100.1", false],
        ["XML", "1.1", false],
        ["XML", "2.1", false],
        ["XML", "3.1", false],
        ["XML", "100.1", false],
        ["Core", "", true],
        ["XML", "", true],
        ["core", "", true],
        ["xml", "", true],
        ["CoRe", "", true],
        ["XmL", "", true],
        [" Core", "", false],
        [" XML", "", false],
        ["Core ", "", false],
        ["XML ", "", false],
        ["Co re", "", false],
        ["XM L", "", false],
        ["aCore", "", false],
        ["aXML", "", false],
        ["Corea", "", false],
        ["XMLa", "", false],
        ["Coare", "", false],
        ["XMaL", "", false],
        ["Core", " ", false],
        ["XML", " ", false],
        ["Core", " 1.0", false],
        ["Core", " 2.0", false],
        ["Core", " 3.0", false],
        ["Core", " 100.0", false],
        ["XML", " 1.0", false],
        ["XML", " 2.0", false],
        ["XML", " 3.0", false],
        ["XML", " 100.0", false],
        ["Core", "1.0 ", false],
        ["Core", "2.0 ", false],
        ["Core", "3.0 ", false],
        ["Core", "100.0 ", false],
        ["XML", "1.0 ", false],
        ["XML", "2.0 ", false],
        ["XML", "3.0 ", false],
        ["XML", "100.0 ", false],
        ["Core", "1. 0", false],
        ["Core", "2. 0", false],
        ["Core", "3. 0", false],
        ["Core", "100. 0", false],
        ["XML", "1. 0", false],
        ["XML", "2. 0", false],
        ["XML", "3. 0", false],
        ["XML", "100. 0", false],
        ["Core", "a1.0", false],
        ["Core", "a2.0", false],
        ["Core", "a3.0", false],
        ["Core", "a100.0", false],
        ["XML", "a1.0", false],
        ["XML", "a2.0", false],
        ["XML", "a3.0", false],
        ["XML", "a100.0", false],
        ["Core", "1.0a", false],
        ["Core", "2.0a", false],
        ["Core", "3.0a", false],
        ["Core", "100.0a", false],
        ["XML", "1.0a", false],
        ["XML", "2.0a", false],
        ["XML", "3.0a", false],
        ["XML", "100.0a", false],
        ["Core", "1.a0", false],
        ["Core", "2.a0", false],
        ["Core", "3.a0", false],
        ["Core", "100.a0", false],
        ["XML", "1.a0", false],
        ["XML", "2.a0", false],
        ["XML", "3.a0", false],
        ["XML", "100.a0", false],
        ["Core", 1, false],
        ["Core", 2, false],
        ["Core", 3, false],
        ["Core", 100, false],
        ["XML", 1, false],
        ["XML", 2, false],
        ["XML", 3, false],
        ["XML", 100, false],
        ["Core", null, true],
        ["XML", null, true],
        ["core", null, true],
        ["xml", null, true],
        ["CoRe", null, true],
        ["XmL", null, true],
        [" Core", null, false],
        [" XML", null, false],
        ["Core ", null, false],
        ["XML ", null, false],
        ["Co re", null, false],
        ["XM L", null, false],
        ["aCore", null, false],
        ["aXML", null, false],
        ["Corea", null, false],
        ["XMLa", null, false],
        ["Coare", null, false],
        ["XMaL", null, false],
        ["Core", undefined, false],
        ["XML", undefined, false],
        ["This is filler text.", "", false],
        [null, "", false],
        [undefined, "", false],
];

for (var i in tests) {
    var t = tests[i];
    //assert_equals(document.implementation.hasFeature(t[0], t[1]), t[2], t[0] + " " + t[1]);
    new TestCase(SECTION,
            t[0] + " " + t[1],
            t[2],
            document.implementation.hasFeature(t[0], t[1]));
}

test();

