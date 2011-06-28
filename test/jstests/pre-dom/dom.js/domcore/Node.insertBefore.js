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
TITLE   = "Node.insertBefore";

writeHeaderToLog( SECTION + ": "+ TITLE);

function testHRE(node) {
  testdc(function() {
    assert_throws("HIERARCHY_REQUEST_ERR", function() { node.insertBefore(document.createTextNode("fail"), null) })
    assert_throws(new TypeError(), function() { node.insertBefore(null, null) })
  })
}
testdc(function() {
  assert_throws("HIERARCHY_REQUEST_ERR", function() { document.body.insertBefore(document.body, document.getElementById("log")) })
  assert_throws("HIERARCHY_REQUEST_ERR", function() { document.body.insertBefore(document.documentElement, document.getElementById("log")) })

  assert_throws(new TypeError(), function() { document.body.insertBefore(null, null) })

  assert_throws(new TypeError(), function() { document.body.insertBefore(null, document.body.firstChild) })

  assert_throws(new TypeError(), function() { document.body.insertBefore({'a':'b'}, document.body.firstChild) })

  document.body.setAttribute("abc", "pass")
  var attr = document.body.attributes[0]
  testHRE(attr)
  assert_equals(attr.value, "pass")
  assert_equals(attr.childNodes.length, 1)
  assert_equals(attr.childNodes[0].nodeValue, "pass")

  testHRE(document.createTextNode("Foo"))
})


test();

