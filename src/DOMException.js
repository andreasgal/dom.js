//
// This DOMException implementation is not WebIDL compatible.
// WebIDL exceptions are in flux right now, so I'm just doing something
// simple and approximately web compatible for now.
//
const INDEX_SIZE_ERR = 1;
const HIERARCHY_REQUEST_ERR = 3;
const WRONG_DOCUMENT_ERR = 4;
const INVALID_CHARACTER_ERR = 5;
const NO_MODIFICATION_ALLOWED_ERR = 7;
const NOT_FOUND_ERR = 8;
const NOT_SUPPORTED_ERR = 9;
const INVALID_STATE_ERR = 11;
const SYNTAX_ERR = 12;
const INVALID_MODIFICATION_ERR = 13;
const NAMESPACE_ERR = 14;
const INVALID_ACCESS_ERR = 15;
const TYPE_MISMATCH_ERR = 17;
const SECURITY_ERR = 18;
const NETWORK_ERR = 19;
const ABORT_ERR = 20;
const URL_MISMATCH_ERR = 21;
const QUOTA_EXCEEDED_ERR = 22;
const TIMEOUT_ERR = 23;
const INVALID_NODE_TYPE_ERR = 24;
const DATA_CLONE_ERR = 25;

global.DOMException = (function() {
    // Code to name
    const names = [
        null,  // No error with code 0
        "INDEX_SIZE_ERR",
        null, // historical
        "HIERARCHY_REQUEST_ERR",
        "WRONG_DOCUMENT_ERR",
        "INVALID_CHARACTER_ERR",
        null, // historical
        "NO_MODIFICATION_ALLOWED_ERR",
        "NOT_FOUND_ERR",
        "NOT_SUPPORTED_ERR",
        null, // historical
        "INVALID_STATE_ERR",
        "SYNTAX_ERR",
        "INVALID_MODIFICATION_ERR",
        "NAMESPACE_ERR",
        "INVALID_ACCESS_ERR",
        null, // historical
        "TYPE_MISMATCH_ERR",
        "SECURITY_ERR",
        "NETWORK_ERR",
        "ABORT_ERR",
        "URL_MISMATCH_ERR",
        "QUOTA_EXCEEDED_ERR",
        "TIMEOUT_ERR",
        "INVALID_NODE_TYPE_ERR",
        "DATA_CLONE_ERR",
    ];

    // Code to message
    // These strings are from the 13 May 2011 Editor's Draft of DOM Core.
    // http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html
    // Copyright © 2011 W3C® (MIT, ERCIM, Keio), All Rights Reserved.
    // Used under the terms of the W3C Document License:
    // http://www.w3.org/Consortium/Legal/2002/copyright-documents-20021231
    const messages = [
        null,  // No error with code 0
        "INDEX_SIZE_ERR (1): the index is not in the allowed range",
        null,
        "HIERARCHY_REQUEST_ERR (3): the operation would yield an incorrect nodes model",
        "WRONG_DOCUMENT_ERR (4): the object is in the wrong Document, a call to importNode is required",
        "INVALID_CHARACTER_ERR (5): the string contains invalid characters",
        null,
        "NO_MODIFICATION_ALLOWED_ERR (7): the object can not be modified",
        "NOT_FOUND_ERR (8): the object can not be found here",
        "NOT_SUPPORTED_ERR (9): this operation is not supported",
        null,
        "INVALID_STATE_ERR (11): the object is in an invalid state",
        "SYNTAX_ERR (12): the string did not match the expected pattern",
        "INVALID_MODIFICATION_ERR (13): the object can not be modified in this way",
        "NAMESPACE_ERR (14): the operation is not allowed by Namespaces in XML",
        "INVALID_ACCESS_ERR (15): the object does not support the operation or argument",
        null,
        "TYPE_MISMATCH_ERR (17): the type of the object does not match the expected type",
        "SECURITY_ERR (18): the operation is insecure",
        "NETWORK_ERR (19): a network error occurred",
        "ABORT_ERR (20): the user aborted an operation",
        "URL_MISMATCH_ERR (21): the given URL does not match another URL",
        "QUOTA_EXCEEDED_ERR (22): the quota has been exceeded",
        "TIMEOUT_ERR (23): a timeout occurred",
        "INVALID_NODE_TYPE_ERR (24): the supplied node is invalid or has an invalid ancestor for this operation",
        "DATA_CLONE_ERR (25): the object can not be cloned.",
    ];

    // Name to code
    const constants = {
        INDEX_SIZE_ERR: INDEX_SIZE_ERR,
        DOMSTRING_SIZE_ERR: 2, // historical
        HIERARCHY_REQUEST_ERR: HIERARCHY_REQUEST_ERR,
        WRONG_DOCUMENT_ERR: WRONG_DOCUMENT_ERR,
        INVALID_CHARACTER_ERR: INVALID_CHARACTER_ERR,
        NO_DATA_ALLOWED_ERR: 6, // historical
        NO_MODIFICATION_ALLOWED_ERR: NO_MODIFICATION_ALLOWED_ERR,
        NOT_FOUND_ERR: NOT_FOUND_ERR,
        NOT_SUPPORTED_ERR: NOT_SUPPORTED_ERR,
        INUSE_ATTRIBUTE_ERR: 10, // historical
        INVALID_STATE_ERR: INVALID_STATE_ERR,
        SYNTAX_ERR: SYNTAX_ERR,
        INVALID_MODIFICATION_ERR: INVALID_MODIFICATION_ERR,
        NAMESPACE_ERR: NAMESPACE_ERR,
        INVALID_ACCESS_ERR: INVALID_ACCESS_ERR,
        VALIDATION_ERR: 16, // historical
        TYPE_MISMATCH_ERR: TYPE_MISMATCH_ERR,
        SECURITY_ERR: SECURITY_ERR,
        NETWORK_ERR: NETWORK_ERR,
        ABORT_ERR: ABORT_ERR,
        URL_MISMATCH_ERR: URL_MISMATCH_ERR,
        QUOTA_EXCEEDED_ERR: QUOTA_EXCEEDED_ERR,
        TIMEOUT_ERR: TIMEOUT_ERR,
        INVALID_NODE_TYPE_ERR: INVALID_NODE_TYPE_ERR,
        DATA_CLONE_ERR: DATA_CLONE_ERR,
    };

    function DOMException(code) {
/*
        // This kudge is so we get lineNumber, fileName and stack properties
        var e = Error(messages[code]);
        e.__proto__ = DOMException.prototype;
*/

        var e = O.create(DOMException.prototype);
        e.code = code;
        e.message = messages[code];
        e.name = names[code];

        // Get stack, lineNumber and fileName properties like a real
        // Error object has.
        var x = Error();
        var frames = split(x.stack,"\n");
        A.shift(frames);
        e.stack = join(frames,"\n");
        var parts = match(frames[0], /[^@]*[@(]([^:]*):(\d*)/);

        if (parts) {
            e.fileName = parts[1];
            e.lineNumber = parts[2];
        }
        else {
            e.fileName = "";
            e.lineNumber = -1;
        }

        return e;
    }

    DOMException.prototype = O.create(Error.prototype);

    // Initialize the constants on DOMException and DOMException.prototype
    for(var c in constants) {
        var v = constants[c];
        defineConstantProp(DOMException, c, v);
        defineConstantProp(DOMException.prototype, c, v);
    }

    return DOMException;
}());

//
// Shortcut functions for throwing errors of various types.
//
function IndexSizeError() { throw DOMException(INDEX_SIZE_ERR); }
function HierarchyRequestError() { throw DOMException(HIERARCHY_REQUEST_ERR); }
function WrongDocumentError() { throw DOMException(WRONG_DOCUMENT_ERR); }
function InvalidCharacterError() { throw DOMException(INVALID_CHARACTER_ERR); }
function NoModificationAllowedError() { throw DOMException(NO_MODIFICATION_ALLOWED_ERR); }
function NotFoundError() { throw DOMException(NOT_FOUND_ERR); }
function NotSupportedError() { throw DOMException(NOT_SUPPORTED_ERR); }
function InvalidStateError() { throw DOMException(INVALID_STATE_ERR); }
function SyntaxError() { throw DOMException(SYNTAX_ERR); }
function InvalidModificationError() { throw DOMException(INVALID_MODIFICATION_ERR); }
function NamespaceError() { throw DOMException(NAMESPACE_ERR); }
function InvalidAccessError() { throw DOMException(INVALID_ACCESS_ERR); }
function TypeMismatchError() { throw DOMException(TYPE_MISMATCH_ERR); }
function SecurityError() { throw DOMException(SECURITY_ERR); }
function NetworkError() { throw DOMException(NETWORK_ERR); }
function AbortError() { throw DOMException(ABORT_ERR); }
function UrlMismatchError() { throw DOMException(URL_MISMATCH_ERR); }
function QuotaExceededError() { throw DOMException(QUOTA_EXCEEDED_ERR); }
function TimeoutError() { throw DOMException(TIMEOUT_ERR); }
function InvalidNodeTypeError() { throw DOMException(INVALID_NODE_TYPE_ERR); }
function DataCloneError() { throw DOMException(DATA_CLONE_ERR); }

