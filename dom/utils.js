// Utility functions and other globals used throughout dom.js

function assert(expr, msg) {
    if (!expr) throw new Error("Assertion failed " + (msg||""));
}

// For stuff that I haven't implemented yet
function nyi() { throw new Error("Not Yet Implemented"); }

const readonlyPropDesc = {writable:false,enumerable:true,configurable: true};
const hiddenPropDesc = {writable: true,enumerable: false,configurable: true};
const constantPropDesc = {writable: false,enumerable: true,configurable: false};
const hiddenConstantPropDesc = {
    writable: false, enumerable: false, configurable: false
};

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
        get: function() {          // When the property is first retrieved
            let realval = f();     // compute its actual value
            O.defineProperty(o, p, // Store that value, keeping the other
                           { value: realval }); // attributes unchanged
            return realval;        // And return the computed value
        },
        set: readonly ? undefined : function(newval) {
            // If the property is writable and is set before being read,
            // just replace the value and f() will never be invoked
            O.defineProperty(o, p, { value: newval });
        },
        enumerable: !hidden,
        configurable: true
    });
}

// Anything I want to define lazily using defineLazyProperty above has to
// be a property of something; it can't just be a local variable.  So this
// DOM object is the holder for lazy properties.  It will be used for things
// like the internal versions of constructors: DOM.Element() etc.
let DOM = {};



// WebIDL requires value conversions in various places.

// Convert x to an unsigned long and return it
// WebIDL currently says to use ES toUInt32() but the spec
// indicates that this may change.
// 
// ES spec says: 
// 
// The abstract operation ToUint32 converts its argument to one of 232
// integer values in the range 0 through 232−1, inclusive. This
// abstraction operation functions as follows:
// 1. Let number be the result of calling ToNumber on the input argument.
// 2. If number is NaN, +0, −0, +∞, or −∞, return +0.
// 3. Let posInt be sign(number) * floor(abs(number)).
// 4. Let int32bit be posInt modulo 2^32; that is, a finite integer
//    value k of Number type with positive sign and less than 2^32 in
//    magnitude such that the mathematical difference of posInt and k is
//    mathematically an integer multiple of 2^32. 
// 5. Return int32bit.
// 
// This function is just an approximation for now, since WebIDL is pending.
//
function toULong(x) {
    nyi();
}

function undef2null(x) { return x === undefined ? null : x; }


// Return true if node is an HTML element and if its owner document is
// and HTML document.  Returns false otherwise.  Note that the argument
// is an internal node implementation object, not a DOM Node.
function isHTML(node) {
    // XXX: implement this
    return true;
}

//XXX Stubbed out function for testing the validity of XML attribute names
/*
NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]

NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]

Name	   ::=   	NameStartChar (NameChar)*


[4]   	NCName	   ::=   	Name - (Char* ':' Char*) # An XML Name, minus the ":" 


[7]   	QName	   ::=   	PrefixedName| UnprefixedName
[8]   	PrefixedName	   ::=   	Prefix ':' LocalPart
[9]   	UnprefixedName	   ::=   	LocalPart
[10]   	Prefix	   ::=   	NCName
[11]   	LocalPart	   ::=   	NCName
*/
function validName(s) { return true; }
function validQName(s) { return true;}

const html_namespace = "http://www.w3.org/1999/xhtml";
const xml_namespace = "http://www.w3.org/XML/1998/namespace";
const xmlns_namespace = "http://www.w3.org/2000/xmlns/";

