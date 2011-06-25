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
var TITLE   = "DOMImplementation.createDocument";

writeHeaderToLog( SECTION + ": "+ TITLE);

// Some cruft to make the tests happy.
document.location = { href: { match: function(){} }};

var tests = [
    [null, null, null, null],
    [null, "", null, null],
    [null, "foo", null, null],
    [null, "1foo", null, "INVALID_CHARACTER_ERR"],
    [null, "f1oo", null, null],
    [null, "foo1", null, null],
    [null, ":foo", null, "NAMESPACE_ERR"],
    [null, "f:oo", null, "NAMESPACE_ERR"],
    [null, "foo:", null, "NAMESPACE_ERR"],
    [null, "xml", null, null],
    [null, "xmlns", null, "NAMESPACE_ERR"],
    [null, "xmlfoo", null, null],
    [null, "xml:foo", null, "NAMESPACE_ERR"],
    [null, "xmlns:foo", null, "NAMESPACE_ERR"],
    [null, "xmlfoo:bar", null, "NAMESPACE_ERR"],
    ["http://example.com/", null, null, null],
    ["http://example.com/", "", null, null],
    ["http://example.com/", "foo", null, null],
    ["http://example.com/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://example.com/", "f1oo", null, null],
    ["http://example.com/", "foo1", null, null],
    ["http://example.com/", ":foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "f:oo", null, null],
    ["http://example.com/", "foo:", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xml", null, null],
    ["http://example.com/", "xmlns", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlfoo", null, null],
    ["http://example.com/", "xml:foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["http://example.com/", "xmlfoo:bar", null, null],
    ["/", null, null, null],
    ["/", "", null, null],
    ["/", "foo", null, null],
    ["/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["/", "f1oo", null, null],
    ["/", "foo1", null, null],
    ["/", ":foo", null, "NAMESPACE_ERR"],
    ["/", "f:oo", null, null],
    ["/", "foo:", null, "NAMESPACE_ERR"],
    ["/", "xml", null, null],
    ["/", "xmlns", null, "NAMESPACE_ERR"],
    ["/", "xmlfoo", null, null],
    ["/", "xml:foo", null, "NAMESPACE_ERR"],
    ["/", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["/", "xmlfoo:bar", null, null],
    ["http://www.w3.org/XML/1998/namespace", null, null, null],
    ["http://www.w3.org/XML/1998/namespace", "", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "f1oo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo1", null, null],
    ["http://www.w3.org/XML/1998/namespace", ":foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "f:oo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "foo:", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xml", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xmlns", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xmlfoo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xml:foo", null, null],
    ["http://www.w3.org/XML/1998/namespace", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/XML/1998/namespace", "xmlfoo:bar", null, null],
    ["http://www.w3.org/2000/xmlns/", null, null, null],
    ["http://www.w3.org/2000/xmlns/", "", null, null],
    ["http://www.w3.org/2000/xmlns/", "foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["http://www.w3.org/2000/xmlns/", "f1oo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "foo1", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", ":foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "f:oo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "foo:", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xml", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xmlns", null, null],
    ["http://www.w3.org/2000/xmlns/", "xmlfoo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xml:foo", null, "NAMESPACE_ERR"],
    ["http://www.w3.org/2000/xmlns/", "xmlns:foo", null, null],
    ["http://www.w3.org/2000/xmlns/", "xmlfoo:bar", null, "NAMESPACE_ERR"],
    ["foo:", null, null, null],
    ["foo:", "", null, null],
    ["foo:", "foo", null, null],
    ["foo:", "1foo", null, "INVALID_CHARACTER_ERR"],
    ["foo:", "f1oo", null, null],
    ["foo:", "foo1", null, null],
    ["foo:", ":foo", null, "NAMESPACE_ERR"],
    ["foo:", "f:oo", null, null],
    ["foo:", "foo:", null, "NAMESPACE_ERR"],
    ["foo:", "xml", null, null],
    ["foo:", "xmlns", null, "NAMESPACE_ERR"],
    ["foo:", "xmlfoo", null, null],
    ["foo:", "xml:foo", null, "NAMESPACE_ERR"],
    ["foo:", "xmlns:foo", null, "NAMESPACE_ERR"],
    ["foo:", "xmlfoo:bar", null, null],
    [null, null, document.implementation.createDocumentType("foo", "", ""), null],
    [null, null, document.doctype, "WRONG_DOCUMENT_ERR"], // This causes a horrible WebKit bug (now fixed in trunk).
    [null, null, function() {
          var foo = document.implementation.createDocumentType("foo", "", "");
          document.implementation.createDocument(null, null, foo);
          return foo;
    }(), "WRONG_DOCUMENT_ERR"], // DOCTYPE already associated with a document.
    [null, null, function() {
          var bar = document.implementation.createDocument(null, null, null);
          return bar.implementation.createDocumentType("bar", "", "");
    }(), null], // DOCTYPE created by a different implementation.
    [null, null, function() {
          var bar = document.implementation.createDocument(null, null, null);
          var magic = bar.implementation.createDocumentType("bar", "", "");
          bar.implementation.createDocument(null, null, magic);
          return magic;
    }(), "WRONG_DOCUMENT_ERR"], // DOCTYPE created by a different implementation and already associated with a document.
    [null, "foo", document.implementation.createDocumentType("foo", "", ""), null],
    ["foo", null, document.implementation.createDocumentType("foo", "", ""), null],
    ["foo", "bar", document.implementation.createDocumentType("foo", "", ""), null],
];

for (var i in tests) {
    var t = tests[i],
        namespaceURI = t[0],
        qualifiedName = t[1],
        doctype = t[2],
        expected = t[3];

    if (expected != null) {
        compareException(
                function() { document.implementation.createDocument(namespaceURI, qualifiedName, doctype) },
                expected,
                "document.implementation.createDocument(" + namespaceURI + "," + qualifiedName + "," + doctype + ")");
    } else {
        var doc = document.implementation.createDocument(namespaceURI, qualifiedName, doctype);

        new TestCase( SECTION,
                "doc.nodeType === Node.DOCUMENT_NODE",
                doc.nodeType,
                Node.DOCUMENT_NODE);

        new TestCase( SECTION,
                "doc.nodeType === doc.DOCUMENT_NODE",
                doc.nodeType,
                doc.DOCUMENT_NODE);

        if(!qualifiedName) {
            new TestCase( SECTION,
                    "doc.documentElement",
                    doc.documentElement,
                    null);
        }
        if(!doctype) {
            new TestCase( SECTION,
                    "doc.doctype",
                    doc.doctype,
                    null);
        }
        if(!qualifiedName && !doctype) {
            new TestCase( SECTION,
                    "doc.childNodes.length",
                    doc.childNodes.length,
                    0);
        }
    }
}


test();

