// Utility functions and other globals used throughout dom.js

function assert(expr, msg) {
    if (!expr) throw new Error("Assertion failed " + (msg||""));
}

// For stuff that I haven't implemented yet
function nyi() {
    let e = new Error();
    let where = split(e.stack, "\n")[1];
    throw new Error("Not Yet Implemented at " + where);
}

// Called by deprecated functions, etc.
function warn(msg) {
    console.warn(msg);
}

// Pass in a function that operates on a node.
// Returns a function that operates recursively on that node and all
// of its descendants.  It should work for any DOM or DOM-like tree structure.
// Note, however, that the function f must not add or remove siblings of
// the element it is called on or the recursion won't work correctly.
function recursive(f) {
    return function recurse(node) {
	f(node);
	for(let i = 0, n = node.childNodes.length;  i < n; i++) 
	    recurse(node.childNodes[i]);
    };
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
function fnoop() { /* do nothing */ }


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
// WebIDL currently says to use ES ToUint32() unless there is a [Clamp]
// attribute on the operation.  We can invoke the ToUint32 operation 
// with the >>> operator.
//
function toULong(x) {
    return x >>> 0;  // The >>> operator does ToUint32
}

function undef2null(x) { return x === undefined ? null : x; }

// Convert x to a string as with the String() conversion function.
// But if x is null, return the empty string insead of "null".
// If a WebIDL method argument is just DOMString, convert with String()
// But if it is [TreatNullAs=EmptyString] DOMString then use this function.
function StringOrEmpty(x) {
    return (x === null) 
	? ""
	: String(x);
}


// This grammar is from the XML and XML Namespace specs. It specifies whether
// a string (such as an element or attribute name) is a valid Name or QName.
// 
// Name	           ::=   	NameStartChar (NameChar)*
// NameStartChar   ::=   	":" | [A-Z] | "_" | [a-z] |
//                              [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
// 				[#x370-#x37D] | [#x37F-#x1FFF] |
// 				[#x200C-#x200D] | [#x2070-#x218F] |
// 				[#x2C00-#x2FEF] | [#x3001-#xD7FF] |
// 				[#xF900-#xFDCF] | [#xFDF0-#xFFFD] |
// 				[#x10000-#xEFFFF]
//
// NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] |
//                                 #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//
// QName	   ::=   	PrefixedName| UnprefixedName
// PrefixedName	   ::=   	Prefix ':' LocalPart
// UnprefixedName  ::=   	LocalPart
// Prefix	   ::=   	NCName
// LocalPart	   ::=   	NCName
// NCName	   ::=   	Name - (Char* ':' Char*) 
//                              # An XML Name, minus the ":"        
//
const [isValidName, isValidQName] = (function() {

    // Most names will be ASCII only. Try matching against simple regexps first
    let simplename = /^[_:A-Za-z][-.:\w]+$/;
    let simpleqname = /^([_A-Za-z][-.\w]+|[_A-Za-z][-.\w]+:[_A-Za-z][-.\w]+)$/

    // If the regular expressions above fail, try more complex ones that work
    // for any identifiers using codepoints from the Unicode BMP
    let ncnamestartchars = "_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02ff\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
    let ncnamechars = "-._A-Za-z0-9\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02ff\u0300-\u037D\u037F-\u1FFF\u200C\u200D\u203f\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";

    let ncname = "[" + ncnamestartchars + "][" + ncnamechars + "]*";
    let namestartchars = ncnamestartchars + ":";
    let namechars = ncnamechars + ":";
    let name = new RegExp("^[" + namestartchars + "]" +
			  "[" + namechars + "]*$");
    let qname = new RegExp("^(" + ncname + "|" +
			   ncname + ":" + ncname + ")$");

    // XML says that these characters are also legal:
    // [#x10000-#xEFFFF].  So if the patterns above fail, and the
    // target string includes surrogates, then try the following
    // patterns that allow surrogates and then run an extra validation
    // step to make sure that the surrogates are in valid pairs and in
    // the right range.  Note that since the characters \uf0000 to \u1f0000 
    // are not allowed, it means that the high surrogate can only go up to
    // \uDB7f instead of \uDBFF.
    let hassurrogates = /[\uD800-\uDB7F\uDC00-\uDFFF]/;
    let surrogatechars = /[\uD800-\uDB7F\uDC00-\uDFFF]/g;
    let surrogatepairs = /[\uD800-\uDB7F][\uDC00-\uDFFF]/g;

    // Modify the variables above to allow surrogates
    ncnamestartchars += "\uD800-\uDB7F\uDC00-\uDFFF";
    ncnamechars += "\uD800-\uDB7F\uDC00-\uDFFF";
    ncname = "[" + ncnamestartchars + "][" + ncnamechars + "]*";
    namestartchars = ncnamestartchars + ":";
    namechars = ncnamechars + ":";

    // Build another set of regexps that include surrogates
    let surrogatename = new RegExp("^[" + namestartchars + "]" +
				   "[" + namechars + "]*$");
    let surrogateqname = new RegExp("^(" + ncname + "|" +
				    ncname + ":" + ncname + ")$");

    function isValidName(s) {
	if (simplename.test(s)) return true;  // Plain ASCII
	if (name.test(s)) return true;        // Unicode BMP

	// Maybe the tests above failed because s includes surrogate pairs
	// Most likely, though, they failed for some more basic syntax problem
	if (!hassurrogates.test(s)) return false;

	// Is the string a valid name if we allow surrogates?
	if (!surrogatename.test(s)) return false;

	// Finally, are the surrogates all correctly paired up?
	let chars = s.match(surrogatechars), pairs = s.match(surrogatepairs);
	return pairs != null && 2*pairs.length === chars.length;
    }


    function isValidQName(s) {
	if (simpleqname.test(s)) return true;  // Plain ASCII
	if (qname.test(s)) return true;        // Unicode BMP
	
	if (!hassurrogates.test(s)) return false;
	if (!surrogateqname.test(s)) return false;
	let chars = s.match(surrogatechars), pairs = s.match(surrogatepairs);
	return pairs != null && 2*pairs.length === chars.length;
    }

    return [isValidName, isValidQName];
}());

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";

