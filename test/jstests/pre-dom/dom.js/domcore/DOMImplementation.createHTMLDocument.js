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


startTest();
TITLE   = "DOMImplementation.createHTMLDocument";

writeHeaderToLog( SECTION + ": "+ TITLE);

function checkDoc(title, expectedtitle, normalizedtitle) {
  testdc(function() {
    var doc = document.implementation.createHTMLDocument(title);
    assert_equals(doc.doctype.name, "html")
    assert_equals(doc.doctype.publicId, "")
    assert_equals(doc.doctype.systemId, "")
    assert_equals(doc.documentElement.localName, "html")
    assert_equals(doc.documentElement.firstChild.localName, "head")
    assert_equals(doc.documentElement.firstChild.childNodes.length, 1)
    assert_equals(doc.documentElement.firstChild.firstChild.localName, "title")
    assert_equals(doc.documentElement.firstChild.firstChild.firstChild.data,
    expectedtitle)
    assert_equals(doc.documentElement.lastChild.localName, "body")
    assert_equals(doc.documentElement.lastChild.childNodes.length, 0)
    assert_equals(doc.title, normalizedtitle)
  })
}
checkDoc("", "", "")
checkDoc(null, "null", "null")
checkDoc(undefined, "undefined", "undefined")
checkDoc("foo  bar baz", "foo  bar baz", "foo bar baz")
checkDoc("foo\t\tbar baz", "foo\t\tbar baz", "foo bar baz")
checkDoc("foo\n\nbar baz", "foo\n\nbar baz", "foo bar baz")
checkDoc("foo\f\fbar baz", "foo\f\fbar baz", "foo bar baz")
checkDoc("foo\r\rbar baz", "foo\r\rbar baz", "foo bar baz")


test();

