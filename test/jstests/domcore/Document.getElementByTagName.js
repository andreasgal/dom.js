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
TITLE   = "Document.getElementByTagName";

writeHeaderToLog( SECTION + ": "+ TITLE);

// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};

testdc(function() {
  assert_true(document.getElementsByTagName("html") instanceof NodeList,
      "document.getElementsByTagName('html') instanceof NodeList");
  assert_false(document.getElementsByTagName("html") instanceof HTMLCollection, "HTMLCollection")
  assert_true(document.getElementsByTagName("html") !== document.getElementsByTagName("html"), "no caching")
})
testdc(function() {
  var l = document.getElementsByTagName("nosuchtag")
  l[5] = "foopy"
  assert_equals(l.item(5), null)
}, "Expandos shouldn't affect item()")
testdc(function() {
  assert_equals(document.createElementNS("http://www.w3.org/1999/xhtml", "i").localName, "i") // Sanity
  var i = document.body.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "I"))
  assert_equals(i.localName, "I")
  assert_equals(i.tagName, "I")
  assert_equals(document.getElementsByTagName("I").length, 0)
  assert_equals(document.getElementsByTagName("i").length, 0)
  assert_equals(document.body.getElementsByTagName("I").length, 0)
  assert_equals(document.body.getElementsByTagName("i").length, 0)
})
testdc(function() {
  var t = document.body.appendChild(document.createElementNS("test", "te:st"))
  assert_equals(document.getElementsByTagName("st").length, 0)
  assert_equals(document.getElementsByTagName("te:st")[0], t)
})
testdc(function() {
  var h = document.body.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "te:st"))
  assert_equals(document.getElementsByTagName("st")[0], h)
  assert_equals(document.getElementsByTagName("TE:ST").length, 0)
})


test();

