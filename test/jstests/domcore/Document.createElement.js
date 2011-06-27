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
TITLE   = "Document.createElement";

writeHeaderToLog( SECTION + ": "+ TITLE);

// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};

testdc(function() {
  var HTMLNS = "http://www.w3.org/1999/xhtml",
      valid = [
        //[input, localName],
        [undefined, "undefined"],
        ["foo", "foo"],
        ["f1oo", "f1oo"],
        ["foo1", "foo1"],
        ["f\u0300oo", "f\u0300oo"],
        ["foo\u0300", "foo\u0300"],
        [":foo", ":foo"],
        ["f:oo", "f:oo"],
        ["foo:", "foo:"],
        ["xml", "xml"],
        ["xmlns", "xmlns"],
        ["xmlfoo", "xmlfoo"],
        ["xml:foo", "xml:foo"],
        ["xmlns:foo", "xmlns:foo"],
        ["xmlfoo:bar", "xmlfoo:bar"],
        ["svg", "svg"],
        ["math", "math"],
        ["FOO", "foo"]
     ],
     invalid = [
       "",
       "1foo",
       "\u0300foo",
       "}foo",
       "f}oo",
       "foo}",
       "\ufffffoo",
       "f\uffffoo",
       "foo\uffff",
       "<foo",
       "foo>",
       "<foo>",
       "f<oo"
     ]

  for (var i = 0, il = valid.length; i < il; i++) {
    var test = valid[i],
        elt = document.createElement(test[0])
    assert_true(elt instanceof Element)
    assert_equals(elt.localName, test[1])
    assert_equals(elt.tagName, test[1].toUpperCase())
    assert_equals(elt.prefix, null)
    assert_equals(elt.namespaceURI, HTMLNS)
  }
  for (var i = 0, il = invalid.length; i < il; i++) {
    assert_throws("INVALID_CHARACTER_ERR", function() { document.createElement(invalid[i]) })
  }
});


test();

