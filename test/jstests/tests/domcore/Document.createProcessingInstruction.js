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
var TITLE   = "Document.createProcessingInstruction";

writeHeaderToLog( SECTION + ": "+ TITLE);


//From Document-createProcessingInstruction.html
testdc(function() {
  assert_throws("NOT_SUPPORTED_ERR", function() { document.createProcessingInstruction("A", "B") })
});


//From Document-createProcessingInstruction.xhtml
testdc(function() {
  var invalid = [
        ["A", "?>"],
        ["\u00B7A", "x"],
        ["\u00D7A", "x"],
        ["A\u00D7", "x"],
        ["\\A", "x"],
        ["\f", "x"],
        [0, "x"],
        ["0", "x"]
      ],
      valid = [
        ["xml:fail", "x"],
        ["A\u00B7A", "x"],
        ["a0", "x"]
      ]

  for (var i = 0, il = invalid.length; i < il; i++) {
    assert_throws("INVALID_CHARACTER_ERR", function() { document.createProcessingInstruction(invalid[i][0], invalid[i][1]) })
  }
  for (var i = 0, il = valid.length; i < il; ++i) {
    var pi = document.createProcessingInstruction(valid[i][0], valid[i][1]);
    assert_equals(pi.target, valid[i][0]);
    assert_equals(pi.data, valid[i][1]);
    assert_equals(pi.ownerDocument, document);
  }
});


test();

