
//

var exception = new DOMException(DOMException.HIERARCHY_REQUEST_ERR);

assert(exception.code === DOMException.HIERARCHY_REQUEST_ERR, exception.code);
assert(exception.message);
assert(exception.name === "HIERARCHY_REQUEST_ERR");
assert(exception.stack !== undefined);
assert(exception.fileName !== undefined);
assert(exception.lineNumber !== undefined);

