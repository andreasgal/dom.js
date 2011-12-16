/*
// The document object is the entry point to the entire DOM
defineLazyProperty(global, "document", function() {
    var doc = new impl.DOMImplementation().createHTMLDocument("");
    doc._scripting_enabled = true;
    return wrap(doc);
});
*/

// Create a window implementation object
var w = new Window();  // See src/impl/Window.js

// Arrange to have it wrap to the global object
// And have the global object unwrap to w
w._idl = global;
wmset(idlToImplMap, global, w);

// Now define window properties that do the right thing
// For other wrapper types this is automated by tools/idl2domjs
// but the window object is a special case.

[
    "window",
    "self",
    "frames",
    "parent",
    "top",
    "opener",
    "document",
    "history",
    "navigator"
].forEach(function(property) {
     Object.defineProperty(global, property, {
         get: function() {
             return wrap(unwrap(this)[property]);
         },
         enumerable: false,
         configurable: true, // XXX: check this
     });
 });

Object.defineProperty(global, "location", {
    get: function() {
        return wrap(unwrap(this).location);
    },
    set: function(v) {
        unwrap(this).location.href = v;
    },
    enumerable: false,
    configurable: true, // XXX: check this
});


Object.defineProperty(global, "onload", {
    get: function() {
        return unwrap(this).onload;
    },
    set: function(v) {
        unwrap(this).onload = toCallbackOrNull(v);
    },
    enumerable: true,
    configurable: true
});


global.addEventListener = function addEventListener(type, listener, capture) {
    unwrap(this).addEventListener(
        String(type),
        toCallbackOrNull(listener),
        OptionalBoolean(capture));
};

global.removeEventListener = function addEventListener(type, listener, capture){
    unwrap(this).removeEventListener(
        String(type),
        toCallbackOrNull(listener),
        OptionalBoolean(capture));
};

// XXX
// This is a completely broken implementation put here just to see if we
// can get jQuery animations to work
//
global.getComputedStyle = function getComputedStyle(elt) {
    return elt.style;
};