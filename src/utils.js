// Utility functions and other globals used throughout dom.js

function assert(expr, msg) {
    if (!expr) {
        throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
    }
}

// For stuff that I haven't implemented yet
function nyi() {
    var e = Error();
    e.name = "NotYetImplemented";
    e.message = trim(split(e.stack, "\n")[3]);
    throw e;
}

// Called by deprecated functions, etc.
function warn(msg) {
    if (global.console) console.warn(msg);
    else if (global.print) {
        print("WARNING: " + msg);
    }
}

// Currently this is only used to report errors when running scripts
function error(msg) {
    if (global.console && global.console.error)
        console.error(msg);
    else if (global.print) {
        print("ERROR: " + msg);
    }
}

// Utility functions that return property descriptors
function constant(v) { return { value: v }; }
function attribute(get, set) {
    if (set)
        return { get: get, set: set};
    else
        return { get: get };
}

// some functions that do very simple stuff
// Note that their names begin with f.
// This is good for things like attribute(fnull,fnoop)
function fnull() { return null; }
function ftrue() { return true; }
function ffalse() { return false; }
function fnoop() { /* do nothing */ }

const readonlyPropDesc = { configurable: true, enumerable: true };
const hiddenPropDesc   = { configurable: true, writable: true };
const constantPropDesc = { enumerable: true };
const hiddenConstantPropDesc = {};

// Set o.p to v, but make the property read-only
function defineReadonlyProp(o,p,v) {
    readonlyPropDesc.value = v;
    O.defineProperty(o, p, readonlyPropDesc);
}

// Set o.p to v, but make the property non-enumerable
function defineHiddenProp(o,p,v) {
    hiddenPropDesc.value = v;
    O.defineProperty(o, p, hiddenPropDesc);
}

// Set o.p to v, and make it constant
function defineConstantProp(o,p,v) {
    constantPropDesc.value = v;
    O.defineProperty(o, p, constantPropDesc);
}

// Set o.p to v, and make it constant and non-enumerable
function defineHiddenConstantProp(o,p,v) {
    hiddenConstantPropDesc.value = v;
    O.defineProperty(o, p, hiddenConstantPropDesc);
}

//
// Define a property p of the object o whose value is the return value of f().
// But don't invoke f() until the property is actually used for the first time.
// The property will be writeable, enumerable and configurable.
// If the property is made read-only before it is used, then it will throw
// an exception when used.
// Based on Andreas's AddResolveHook function.
//
function defineLazyProperty(o, p, f, hidden, readonly) {
    O.defineProperty(o, p, {
        get: function() {            // When the property is first retrieved
            var realval = f();       // compute its actual value
            O.defineProperty(o, p, { // Store that value
                value: realval,
                writable: !readonly,
                enumerable: !hidden,
                configurable: true
            });
            return realval;          // And return the computed value
        },
        set: readonly ? undefined : function(newval) {
            // If the property is writable and is set before being read,
            // just replace the value and f() will never be invoked

            // Remove the line below when this bug is fixed:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=703157
            delete o[p];

            O.defineProperty(o, p, {
                value: newval,
                writable: !readonly,
                enumerable: !hidden,
                configurable: true
            });
        },
        enumerable: !hidden,
        configurable: true
    });
}


// Compare two nodes based on their document order. This function is intended
// to be passed to sort(). Assumes that the array being sorted does not
// contain duplicates.  And that all nodes are connected and comparable.
// Clever code by ppk via jeresig.
function documentOrder(n,m) {
    return 3 - (n.compareDocumentPosition(m) & 6);
}

// Like String.trim(), but uses HTML's definition of whitespace
// instead of using Unicode's definition of whitespace.
function htmlTrim(s) {
    return s.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");
}