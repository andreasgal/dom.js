// This file was automatically generated; DO NOT EDIT.
/************************************************************************
Copyright (c) 2011 The Mozilla Foundation.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

    Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
************************************************************************/
(function closure(global) {
"use strict";



/************************************************************************
 *  src/snapshot.js
 ************************************************************************/

//@line 1 "src/snapshot.js"
/*
 * We want to be sure that we only use the built-in versions of standard
 * functions and methods like Object.create and Array.prototype.pop.
 * So here we make snapshots of all the system objects, and then define
 * utility functions that use them.  
 *
 * It is an error if any of the built-in methods are used anywhere else
 * in dom.js after this initial snapshot.
 *
 * The utilities defined here use a functional syntax rather than the
 * OO syntax of the JS builtins.  Instead of a.map(f), we call map(a, f)
 * for example.
 * 
 * See ../test/monkey.js for code that patches all the built-in
 * functions and methods to test whether we avoid using them.
 */


// XXX
// For now, we just snapshot everything that seems like it might be
// important. Later, we might come back and optimize this to just take
// copies of the stuff we actually use.

const
    shallow_frozen_copy = function(o) {
        let r = {};
        Object.getOwnPropertyNames(o).forEach(function(n) {
            Object.defineProperty(r, n, Object.getOwnPropertyDescriptor(o, n));
        });
        return Object.freeze(r);
    },


    // Copy the original state of constructor functions
    // This is not a complete list. I've left out error types I'm unlikely
    // to ever throw.
    Array = global.Array,
    Boolean = global.Boolean,
    Date = global.Date,
    Error = global.Error,
    Function = global.Function,
    Number = global.Number,
    Object = global.Object,
    RangeError = global.RangeError,
    RegExp = global.RegExp,
    String = global.String,
    TypeError = global.TypeError,
    WeakMap = global.WeakMap,

    // Some global functions.
    // Note that in strict mode we're not allowed to create new identifiers
    // named eval.  But if we give eval any other name then it does a
    // global eval instead of a local eval. I shouldn't ever need to use it,
    // so just omit it here.
    parseInt = global.parseInt,
    parseFloat = global.parseFloat,
    isNaN = global.isNaN,
    isFinite = global.isFinite,

    // Snapshot objects that hold a lot of static methods
    JSON = shallow_frozen_copy(global.JSON),
    Math = shallow_frozen_copy(global.Math),
    Proxy = shallow_frozen_copy(global.Proxy),

    // We also want to make a snapshot of the static methods of Object, Array,
    // and String. (Firefox defines useful "Array generics" and "String
    // generics" that are quite helpful to us).  Since we've already bound
    // the names Object, Array, and String, we use O, A, and S as shorthand
    // notation for these frequently-accessed sets of methods.
    O = shallow_frozen_copy(Object),
    A = shallow_frozen_copy(Array), 
    S = shallow_frozen_copy(String),

    // Copy some individual static methods from types that don't 
    // define very many.
    now = Date.now,

    // Note that it is never safe to invoke a method of a built-in
    // object except in code that is going to run right now. The
    // functions defined below provide a safe alternative, but mandate
    // a functional style of programming rather than an OO style.

    // Functions
    // call(f, o, args...)
    call = Function.prototype.call.bind(Function.prototype.call),
    // apply(f, o, [args])
    apply = Function.prototype.call.bind(Function.prototype.apply),
    // bind(f, o)
    bind = Function.prototype.call.bind(Function.prototype.bind),   

    // WeakMap functions
    wmget = Function.prototype.call.bind(WeakMap.prototype.get),
    wmset = Function.prototype.call.bind(WeakMap.prototype.set),

    // Object functions
    hasOwnProperty =
      Function.prototype.call.bind(Object.prototype.hasOwnProperty),

    // Array functions are all defined as generics like A.pop, but its
    // convenient to give the most commonly-used ones unqualified
    // names.  The less-commonly used functions (and those that have
    // name collisions like indexOf, lastIndexOf and slice) can be
    // accessed on the A or S objects.
    concat = A.concat,
    every = A.every,
    foreach = A.forEach,  // Note lowercase e
    isArray = A.isArray,
    join = A.join,
    map = A.map,
    push = A.push,
    pop = A.pop,
    reduce = A.reduce,
    sort = A.sort,
    splice = A.splice,

    // Ditto for the String generic functions
    fromCharCode = S.fromCharCode,
    match = S.match,
    replace = S.replace,
    search = S.search,
    split = S.split,
    substring = S.substring,
    toLowerCase = S.toLowerCase,
    toUpperCase = S.toUpperCase,
    trim = S.trim,

    // RegExp functions, too
    exec = Function.prototype.call.bind(RegExp.prototype.exec),
    test = Function.prototype.call.bind(RegExp.prototype.test)

    ;



/************************************************************************
 *  src/globals.js
 ************************************************************************/

//@line 1 "src/globals.js"
// These constants and variables aren't really globals.  They're all within
// the closure added by the Makefile, so they don't affect the global
// environment.  But they are visible everywhere within dom.js

// Namespaces
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";


// Anything I want to define lazily using defineLazyProperty above has
// to be a property of something; it can't just be a local variable.
// So these objects are holders for lazy properties.  
const impl = {}; // implementation construtors defined here
const idl = {};  // interface constructors defined here



/************************************************************************
 *  src/utils.js
 ************************************************************************/

//@line 1 "src/utils.js"
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
function ftrue() { return true; }
function ffalse() { return false; }
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

// Compare two nodes based on their document order. This function is intended
// to be passed to sort(). Assumes that the array being sorted does not
// contain duplicates.  And that all nodes are connected and comparable.
// Clever code by ppk via jeresig.
function documentOrder(n,m) {
    return 3 - (n.compareDocumentPosition(m) & 6); 
}



/************************************************************************
 *  src/wrapmap.js
 ************************************************************************/

//@line 1 "src/wrapmap.js"
// dom.js uses two kinds of tree node objects.  nodes (with a
// lowercase n) are the internal data structures that hold the actual
// document data. They are implemented by the files in impl/* Nodes
// (with a capital N) are the public objects that implement DOM
// interfaces and do not have any properties other than the accessor
// properties and methods defined by the DOM.  They are implemented by 
// the files in idl/*
//
// Every Node must have a node to hold its actual data.
// But nodes can exist without any corresponding Node: Nodes are created
// as needed, when scripts use the DOM API to inspect the document tree.
//
// Since Node objects can't have properties, the mapping from Node to node
// is done with a WeakMap.  The mapping from node to Node is simpler:
// if a Node exists for the node, it is simply set on a property of the node.
//
// The methods in this file manage the mapping between nodes and Nodes
// 
const [unwrap, unwrapOrNull, wrap] = (function() {
    let idlToImplMap = new WeakMap(), lastkey = {}, lastvalue = undefined;

    // Return the implementation object for the DOM Node n
    // This method will throw a DOMException(NOT_FOUND_ERR) if n is
    // null, undefined, a primitive, or an object with no mapping.
    // This provides basic error checking for methods like Node.appendChild().
    function unwrap(n) {
        // Simple optimization
        // If I ever remove or alter mappings, then this won't be valid anymore.
        if (n === lastkey) return lastvalue;

        try {
            let impl = wmget(idlToImplMap, n);

            // This happens if someone passes a bogus object to 
            // appendChild, for example. 
            if (!impl) NotFoundError();

            lastkey = n;
            lastvalue = impl;
            return impl;
        }
        catch(e) {
            // If n was null or not an object the WeakMap will raise a TypeError
            // TypeError might be the best thing to propagate, but DOM precedent
            // seems to be to do this:
            NotFoundError();
        }
    }

    function unwrapOrNull(n) {
        if (!n) return null;
        return unwrap(n);
    }

    // Return the interface object (a DOM node) for the implementation node n,
    // creating it if necessary
    function wrap(n, idltype) {
        if (n === null) return null;

        if (!n._idl) {
            if (idltype !== idl.Node) {
                n._idl = idltype.create(n);
            }
            else {
                // Special case for Nodes. To wrap a Node, we have to create
                // an object of the appropriate subtype. 
                // 
                // XXX Once we start on HTML5, we're going to have to
                // expand this special case to handle lots of element
                // subtypes based on n.tagName, I think. This may be a general
                // issue with the DOM anywhere there is an IDL type hierarchy.
                //
                // Note that we know for sure that none of these types require
                // a proxy handler, and therefore we do not have to pass
                // the implementation object n to the factory function.
                // 
                switch(n.nodeType) {
                case ELEMENT_NODE:
                    n._idl = idl.Element.create();
                    break;
                case TEXT_NODE:
                    n._idl = idl.Text.create();
                    break;
                case COMMENT_NODE:
                    n._idl = idl.Comment.create();
                    break;
                case PROCESSING_INSTRUCTION_NODE:
                    n._idl = idl.ProcessingInstruction.create();
                    break;
                case DOCUMENT_NODE:
                    n._idl = idl.Document.create();
                    break;
                case DOCUMENT_FRAGMENT_NODE:
                    n._idl = idl.DocumentFragment.create();
                    break;
                case DOCUMENT_TYPE_NODE:
                    n._idl = idl.DocumentType.create();
                    break;
                }
            }

            wmset(idlToImplMap, n._idl, n);
        }

        return n._idl;
    }

    return [unwrap, unwrapOrNull, wrap];
}());


/************************************************************************
 *  src/xmlnames.js
 ************************************************************************/

//@line 1 "src/xmlnames.js"
// This grammar is from the XML and XML Namespace specs. It specifies whether
// a string (such as an element or attribute name) is a valid Name or QName.
// 
// Name            ::=          NameStartChar (NameChar)*
// NameStartChar   ::=          ":" | [A-Z] | "_" | [a-z] |
//                              [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
//                              [#x370-#x37D] | [#x37F-#x1FFF] |
//                              [#x200C-#x200D] | [#x2070-#x218F] |
//                              [#x2C00-#x2FEF] | [#x3001-#xD7FF] |
//                              [#xF900-#xFDCF] | [#xFDF0-#xFFFD] |
//                              [#x10000-#xEFFFF]
//
// NameChar        ::=          NameStartChar | "-" | "." | [0-9] |
//                                 #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//
// QName           ::=          PrefixedName| UnprefixedName
// PrefixedName    ::=          Prefix ':' LocalPart
// UnprefixedName  ::=          LocalPart
// Prefix          ::=          NCName
// LocalPart       ::=          NCName
// NCName          ::=          Name - (Char* ':' Char*) 
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



/************************************************************************
 *  src/idl.js
 ************************************************************************/

//@line 1 "src/idl.js"
// This file defines functions for satisfying the requirements of WebIDL
// See also ../tools/idl2domjs

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
    return (x === null) ? "" : String(x);
}

function StringOrNull(x) {
    return (x === null) ? null : String(x);
}

function OptionalBoolean(x) {
    return (x === undefined) ? undefined : Boolean(x);
}

function OptionalObject(x) {
    return (x === undefined) ? undefined : Object(x);
}

function toCallback(x) {
    let t = typeof x;
    if (t === "function" || t === "object") return x;
    else throw TypeError("Expected callback; got: " + x);
}

function toCallbackOrNull(x) {
    return (x === null) ? null : toCallback(x);
}

// This constructor takes a single object as its argument and looks for
// the following properties of that object:
//
//    name         // The name of the interface
//    superclass   // The superclass constructor
//    proxyHandler // The proxy handler constructor, if one is needed
//    constants    // constants defined by the interface
//    members      // interface attributes and methods
//
// It returns a new object with the following properties:
//   publicInterface // The public interface to be placed in the global scope
//   prototype       // The prototype object for the interface
//                   // Also available as publicInterface.prototype
//   create          // A factory function for creating an instance
//
function IDLInterface(o) {
    let name = o.name || "";
    let superclass = o.superclass;
    let proxyHandler = o.proxyHandler;
    let constants = o.constants || {};
    let members = o.members || {};
    let prototype, interfaceObject;

    // Set up the prototype object
    prototype = superclass ? O.create(superclass.prototype) : {};

    // The interface object is supposed to work with instanceof, but is 
    // not supposed to be callable.  We can't conform to both requirements
    // so we make the interface object a function that throws when called.
    interfaceObject = function() { 
        throw new TypeError(name + " is not (supposed to be) a function");
    };

    // WebIDL says that the interface object has this prototype property
    defineHiddenConstantProp(interfaceObject, "prototype", prototype);

    // WebIDL also says that the prototype points back to the interface object
    // instead of the real constructor.
    defineHiddenProp(prototype, "constructor", interfaceObject);

    // Constants must be defined on both the prototype and interface objects
    // And they must read-only and non-configurable
    for(let c in constants) {
        let value = constants[c];
        defineConstantProp(prototype, c, value);
        defineConstantProp(interfaceObject, c, value);
    }

    // Now copy attributes and methods onto the prototype object.
    // Members should just be an ordinary object.  Attributes should be
    // defined with getters and setters. Methods should be regular properties.
    // This will mean that the members will all be enumerable, configurable
    // and writable (unless there is no setter) as they are supposed to be.
    for(let m in members) {
        // Get the property descriptor of the member
        let desc = O.getOwnPropertyDescriptor(members, m);

        // Now copy the property to the prototype object
        O.defineProperty(prototype, m, desc);
    }

    // If the interface does not already define a toString method, add one.
    // This will help to make debugging easier.
    // 
    // XXX: I'm not sure if this is legal according to WebIDL and DOM Core.
    // XXX Maybe I could move it down to an object on the prototype chain
    // above Object.prototype.  But then I'd need some way to determine
    // the type name.  Maybe the name of the public "constructor" function?
    // But then I'd have to create that function with eval, I think.
    if (!hasOwnProperty(members, "toString")) {
        prototype.toString = function() { return "[object " + name + "]"; };
    }

    // Now set up the fields of this object
    this.prototype = prototype;
    this.publicInterface = interfaceObject;
    this.proxyHandler = proxyHandler;

    // If there is a proxy handler, remember it.  Otherwise, override
    // the factory function that we'd otherwise inherit from
    // IDLInterface.prototype
    if (proxyHandler) this.proxyHandler = proxyHandler;
    else this.create = Object.create.bind(Object, prototype, {});
}

IDLInterface.prototype.create = function(impl) {
    return Proxy.create(new this.proxyHandler(impl), this.prototype);
};




/************************************************************************
 *  src/NodeListProxyHandler.js
 ************************************************************************/

//@line 1 "src/NodeListProxyHandler.js"
function NodeListProxyHandler(list) {
    // This handler expects an object with a length property and an item() 
    // method.  If we pass it a plain array, it will add the item() method
    // 
    // We should avoid reading the length property of the list when possible
    // because in lazy implementsions such as impl/FilteredElementList, 
    // reading the length forces the filter to process the entire document
    // tree undoing the laziness.  
    if (isArray(list)) {
        if (!hasOwnProperty(list, "item"))
            list.item = function(n) { return list[n]; };
    }

    this.list = list;
    this.localprops = O.create(idl.NodeList.prototype);
}

// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
NodeListProxyHandler.prototype = {
    isIndex: function(name) { return String(toULong(name)) === name; },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (this.isIndex(name)) {
            // If the index is greater than the length, then we'll just
            // get null or undefined here and do nothing. That is better
            // than testing length.
            let v = this.list.item(name);
            if (v) {
                return { 
                    value: wrap(v, idl.Node),
                    writable: false,
                    enumerable: true,
                    configurable: true
                };
            }
            else {
                // We're never going to allow array index properties to be
                // set on localprops, so we don't have to do the test
                // below and can just return nothing now.
                return;
            }
        }
        return O.getOwnPropertyDescriptor(this.localprops, name);
    },
    getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(idl.NodeList.prototype, name) ||
            O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },
    getOwnPropertyNames: function getOwnPropertyNames() {
        let r = [];
        for (let i = 0, n = this.list.length; i < n; i++)
            push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
    },
    defineProperty: function(name, desc) {
        // XXX
        // The WebIDL algorithm says we should "Reject" these attempts by
        // throwing or returning false, depending on the Throw argument, which
        // is usually strict-mode dependent.  While this is being clarified
        // I'll just throw here.  May need to change this to return false
        // instead.
        if (this.isIndex(name)) 
            throw new TypeError(
                "can't set or create indexed properties '" + name + "'");

        O.defineProperty(this.localprops, name, desc);
    },
    delete: function(name) {
        // Can't delete index properties
        if (this.isIndex(name)) {
            // If an item exists at that index, return false: won't delete it
            // Otherwise, if no item, then the index was out of bounds and
            // we return true to indicate that the deletion was "successful"
            return !this.list.time(name);
        }
        return delete this.localprops[name];
    },

    // WebIDL: Host objects implementing an interface that supporst
    // indexed or named properties defy being fixed; if Object.freeze,
    // Object.seal or Object.preventExtensions is called on one, these
    // the function MUST throw a TypeError.
    // 
    // Proxy proposal: When handler.fix() returns undefined, the
    // corresponding call to Object.freeze, Object.seal, or
    // Object.preventExtensions will throw a TypeError.
    fix: function() {},

    // Get all enumerable properties
    // XXX: Remove this method when this bug is fixed:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
    enumerate: function() {
        let r = [];
        for (let i = 0, n = this.list.length; i < n; i++)
            push(r, String(i));
        for(name in this.localprops) push(r, name);
        return r;
    }
};



/************************************************************************
 *  src/ArrayProxyHandler.js
 ************************************************************************/

//@line 1 "src/ArrayProxyHandler.js"
// This class is a proxy handler for read-only WebIDL array types, like the 
// Element.attributes attribute, which has type Attr[]. See WebIDL §4.2.20.
// 
// The constructor takes the array to proxy, and also the IDL type of the
// array (so the prototype can be set appropriately) and the IDL type of the
// array elements, (so they can be wrapped appropriately).
// 
// We'll probably need to define a subtype or at least a custom factory method
// for each array type that we actually need to use.
// AttrArrayProxyHandler, for example.
// 
function ArrayProxyHandler(array, arrayType, elementType) {
    this.array = array;
    this.arrayType = arrayType;
    this.elementType = elementType;
    // The arrayType.prototype will inherit from Array.prototype
    this.localprops = O.create(arrayType.prototype)
}

ArrayProxyHandler.prototype = {
    isArrayIndex: function(name) { return String(toULong(name)) === name; },

    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (name === "length") {
            return {
                value: this.array.length,
                writable: false,
                enumerable: false,
                configurable: true
            };
        }
        else if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            if (idx >= this.array.length) return;  // Out of bounds

            return {
                value: wrap(this.array[idx], this.elementType),
                writable: false,
                enumerable: true,
                configurable: true
            };
        }
        else {
            // We'll ensure that the property is configurable when we
            // set it, so we don't have to check that here.
            return O.getOwnPropertyDescriptor(this.localprops, name);
        }
    },

    getPropertyDescriptor: function(name) {
        // If ES6 implements Object.getPropertyDescriptor() we can use
        // that here instead of this long chain.
        var desc = this.getOwnPropertyDescriptor(name) ||
            O.getOwnPropertyDescriptor(this.arrayType.prototype, name) ||
            O.getOwnPropertyDescriptor(A.prototype, name) ||
            O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
    },

    getOwnPropertyNames: function getOwnPropertyNames() {
        let r = [];
        for (let i = 0, n = this.array.length; i < n; i++)
            push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
    },

    defineProperty: function(name, desc) {
        // XXX
        // For now, we "Reject" by throwing TypeError.  Proxies may change
        // so we only have to return false.
        if (this.isArrayIndex(name) || name === "length")
            throw new TypeError("read only array");

        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
    },

    delete: function(name) {
        // Can't delete the length property
        if (name === "length") return false;

        // Can't delete array elements, but if they don't exist, don't complain
        if (this.isArrayIndex(name)) {
            let idx = toULong(name);
            return idx >= this.array.length;
        }
        // Finally, try deleting an expando
        return delete this.localprops[name];
    },

    // WebIDL: Array host objects defy being fixed; if Object.freeze,
    // Object.seal or Object.preventExtensions is called on one, the
    // function MUST throw a TypeError.
    fix: function() {},

    // Get all enumerable properties
    // XXX: Remove this method when this bug is fixed:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
    enumerate: function() {
        let r = [];
        for (let i = 0, n = this.array.length; i < n; i++)
            push(r, String(i));
        for(name in this.localprops) push(r, name);
        return r;
    }
}


/************************************************************************
 *  src/AttrArrayProxyHandler.js
 ************************************************************************/

//@line 1 "src/AttrArrayProxyHandler.js"
// This is a factory method for creating custom ArrayProxyHandlers
// But it can be used as a constructor with not too much inefficiency.
function AttrArrayProxyHandler(array) {
    return new ArrayProxyHandler(array, idl.AttrArray, idl.Attr);
}

// XXX: I need to modify tools/idl2domjs to detect the use of types 
// like Attr[] and automatically output the idl.AttrArray type.


/************************************************************************
 *  src/DOMException.js
 ************************************************************************/

//@line 1 "src/DOMException.js"
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
        let e = Error(messages[code]);
        e.__proto__ = DOMException.prototype;
*/

        let e = Object.create(DOMException.prototype);
        e.code = code;
        e.message = messages[code];
        e.name = names[code];

        // Get stack, lineNumber and fileName properties like a real
        // Error object has.
        let x = Error();
        let frames = split(x.stack,"\n");
        A.shift(frames);
        e.stack = join(frames,"\n");
        let parts = match(frames[0], /[^@]*@([^:]*):(\d*)/);
        e.fileName = parts[1];
        e.lineNumber = parts[2];
        
        return e;
    }

    DOMException.prototype = Object.create(Error.prototype);

    // Initialize the constants on DOMException and DOMException.prototype
    for(let c in constants) {
        let v = constants[c];
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




/************************************************************************
 *  src/domcore.js
 ************************************************************************/

//@line 1 "src/domcore.js"
//
// DO NOT EDIT.
// This file was generated by idl2domjs from src/domcore.idl
//


//
// Interface Event
//

// Constants defined by Event
const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

defineLazyProperty(global, "Event", function() {
    return idl.Event.publicInterface;
}, true);

defineLazyProperty(idl, "Event", function() {
    return new IDLInterface({
        name: "Event",
        constants: {
            CAPTURING_PHASE: CAPTURING_PHASE,
            AT_TARGET: AT_TARGET,
            BUBBLING_PHASE: BUBBLING_PHASE,
        },
        members: {
            get type() {
                return unwrap(this).type;
            },

            get target() {
                return wrap(unwrap(this).target, idl.EventTarget);
            },

            get currentTarget() {
                return wrap(unwrap(this).currentTarget, idl.EventTarget);
            },

            get eventPhase() {
                return unwrap(this).eventPhase;
            },

            stopPropagation: function stopPropagation() {
                return unwrap(this).stopPropagation();
            },

            stopImmediatePropagation: function stopImmediatePropagation() {
                return unwrap(this).stopImmediatePropagation();
            },

            get bubbles() {
                return unwrap(this).bubbles;
            },

            get cancelable() {
                return unwrap(this).cancelable;
            },

            preventDefault: function preventDefault() {
                return unwrap(this).preventDefault();
            },

            get defaultPrevented() {
                return unwrap(this).defaultPrevented;
            },

            get isTrusted() {
                return unwrap(this).isTrusted;
            },

            get timeStamp() {
                return wrap(unwrap(this).timeStamp, idl.DOMTimeStamp);
            },

            initEvent: function initEvent(
                                    type,
                                    bubbles,
                                    cancelable)
            {
                return unwrap(this).initEvent(
                    String(type),
                    Boolean(bubbles),
                    Boolean(cancelable));
            },

        },
    });
});

//
// Interface CustomEvent
//

defineLazyProperty(global, "CustomEvent", function() {
    return idl.CustomEvent.publicInterface;
}, true);

defineLazyProperty(idl, "CustomEvent", function() {
    return new IDLInterface({
        name: "CustomEvent",
        superclass: idl.Event,
        members: {
            get detail() {
                return unwrap(this).detail;
            },

            initCustomEvent: function initCustomEvent(
                                    type,
                                    bubbles,
                                    cancelable,
                                    detail)
            {
                return unwrap(this).initCustomEvent(
                    String(type),
                    Boolean(bubbles),
                    Boolean(cancelable),
                    ObjectOrNull(detail));
            },

        },
    });
});

//
// Interface EventTarget
//

defineLazyProperty(global, "EventTarget", function() {
    return idl.EventTarget.publicInterface;
}, true);

defineLazyProperty(idl, "EventTarget", function() {
    return new IDLInterface({
        name: "EventTarget",
        members: {
            addEventListener: function addEventListener(
                                    type,
                                    listener,
                                    capture)
            {
                return unwrap(this).addEventListener(
                    String(type),
                    unwrapOrNull(listener),
                    OptionalBoolean(capture));
            },

            removeEventListener: function removeEventListener(
                                    type,
                                    listener,
                                    capture)
            {
                return unwrap(this).removeEventListener(
                    String(type),
                    unwrapOrNull(listener),
                    OptionalBoolean(capture));
            },

            dispatchEvent: function dispatchEvent(event) {
                return unwrap(this).dispatchEvent(unwrap(event));
            },

        },
    });
});

//
// Interface EventListener
//

defineLazyProperty(global, "EventListener", function() {
    return idl.EventListener.publicInterface;
}, true);

defineLazyProperty(idl, "EventListener", function() {
    return new IDLInterface({
        name: "EventListener",
        members: {
            handleEvent: function handleEvent(event) {
                return unwrap(this).handleEvent(unwrap(event));
            },

        },
    });
});

//
// Interface Node
//

// Constants defined by Node
const ELEMENT_NODE = 1;
const ATTRIBUTE_NODE = 2;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const ENTITY_REFERENCE_NODE = 5;
const ENTITY_NODE = 6;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;
const NOTATION_NODE = 12;
const DOCUMENT_POSITION_DISCONNECTED = 0x01;
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;
const DOCUMENT_POSITION_CONTAINS = 0x08;
const DOCUMENT_POSITION_CONTAINED_BY = 0x10;
const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

defineLazyProperty(global, "Node", function() {
    return idl.Node.publicInterface;
}, true);

defineLazyProperty(idl, "Node", function() {
    return new IDLInterface({
        name: "Node",
        superclass: idl.EventTarget,
        constants: {
            ELEMENT_NODE: ELEMENT_NODE,
            ATTRIBUTE_NODE: ATTRIBUTE_NODE,
            TEXT_NODE: TEXT_NODE,
            CDATA_SECTION_NODE: CDATA_SECTION_NODE,
            ENTITY_REFERENCE_NODE: ENTITY_REFERENCE_NODE,
            ENTITY_NODE: ENTITY_NODE,
            PROCESSING_INSTRUCTION_NODE: PROCESSING_INSTRUCTION_NODE,
            COMMENT_NODE: COMMENT_NODE,
            DOCUMENT_NODE: DOCUMENT_NODE,
            DOCUMENT_TYPE_NODE: DOCUMENT_TYPE_NODE,
            DOCUMENT_FRAGMENT_NODE: DOCUMENT_FRAGMENT_NODE,
            NOTATION_NODE: NOTATION_NODE,
            DOCUMENT_POSITION_DISCONNECTED: DOCUMENT_POSITION_DISCONNECTED,
            DOCUMENT_POSITION_PRECEDING: DOCUMENT_POSITION_PRECEDING,
            DOCUMENT_POSITION_FOLLOWING: DOCUMENT_POSITION_FOLLOWING,
            DOCUMENT_POSITION_CONTAINS: DOCUMENT_POSITION_CONTAINS,
            DOCUMENT_POSITION_CONTAINED_BY: DOCUMENT_POSITION_CONTAINED_BY,
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,
        },
        members: {
            get nodeType() {
                return unwrap(this).nodeType;
            },

            get nodeName() {
                return unwrap(this).nodeName;
            },

            get baseURI() {
                return unwrap(this).baseURI;
            },

            get ownerDocument() {
                return wrap(unwrap(this).ownerDocument, idl.Document);
            },

            get parentNode() {
                return wrap(unwrap(this).parentNode, idl.Node);
            },

            get parentElement() {
                return wrap(unwrap(this).parentElement, idl.Element);
            },

            hasChildNodes: function hasChildNodes() {
                return unwrap(this).hasChildNodes();
            },

            get childNodes() {
                return wrap(unwrap(this).childNodes, idl.NodeList);
            },

            get firstChild() {
                return wrap(unwrap(this).firstChild, idl.Node);
            },

            get lastChild() {
                return wrap(unwrap(this).lastChild, idl.Node);
            },

            get previousSibling() {
                return wrap(unwrap(this).previousSibling, idl.Node);
            },

            get nextSibling() {
                return wrap(unwrap(this).nextSibling, idl.Node);
            },

            compareDocumentPosition: function compareDocumentPosition(other) {
                return unwrap(this).compareDocumentPosition(unwrap(other));
            },

            get nodeValue() {
                return unwrap(this).nodeValue;
            },
            set nodeValue(newval) {
                unwrap(this).nodeValue = StringOrNull(newval);
            },

            get textContent() {
                return unwrap(this).textContent;
            },
            set textContent(newval) {
                unwrap(this).textContent = StringOrNull(newval);
            },

            insertBefore: function insertBefore(
                                    newChild,
                                    refChild)
            {
                let rv = unwrap(this).insertBefore(
                    unwrap(newChild),
                    unwrapOrNull(refChild));
                return wrap(rv, idl.Node);
            },

            replaceChild: function replaceChild(
                                    newChild,
                                    oldChild)
            {
                let rv = unwrap(this).replaceChild(
                    unwrap(newChild),
                    unwrap(oldChild));
                return wrap(rv, idl.Node);
            },

            removeChild: function removeChild(oldChild) {
                let rv = unwrap(this).removeChild(unwrap(oldChild));
                return wrap(rv, idl.Node);
            },

            appendChild: function appendChild(newChild) {
                let rv = unwrap(this).appendChild(unwrap(newChild));
                return wrap(rv, idl.Node);
            },

            cloneNode: function cloneNode(deep) {
                let rv = unwrap(this).cloneNode(Boolean(deep));
                return wrap(rv, idl.Node);
            },

            isSameNode: function isSameNode(node) {
                return unwrap(this).isSameNode(unwrapOrNull(node));
            },

            isEqualNode: function isEqualNode(node) {
                return unwrap(this).isEqualNode(unwrapOrNull(node));
            },

            lookupPrefix: function lookupPrefix(namespace) {
                return unwrap(this).lookupPrefix(StringOrEmpty(namespace));
            },

            lookupNamespaceURI: function lookupNamespaceURI(prefix) {
                return unwrap(this).lookupNamespaceURI(StringOrNull(prefix));
            },

            isDefaultNamespace: function isDefaultNamespace(namespace) {
                return unwrap(this).isDefaultNamespace(StringOrEmpty(namespace));
            },

        },
    });
});

//
// Interface DocumentFragment
//

defineLazyProperty(global, "DocumentFragment", function() {
    return idl.DocumentFragment.publicInterface;
}, true);

defineLazyProperty(idl, "DocumentFragment", function() {
    return new IDLInterface({
        name: "DocumentFragment",
        superclass: idl.Node,
        members: {
        },
    });
});

//
// Interface Document
//

defineLazyProperty(global, "Document", function() {
    return idl.Document.publicInterface;
}, true);

defineLazyProperty(idl, "Document", function() {
    return new IDLInterface({
        name: "Document",
        superclass: idl.Node,
        members: {
            get implementation() {
                return wrap(unwrap(this).implementation, idl.DOMImplementation);
            },

            get documentURI() {
                return unwrap(this).documentURI;
            },
            set documentURI(newval) {
                unwrap(this).documentURI = String(newval);
            },

            get compatMode() {
                return unwrap(this).compatMode;
            },

            get doctype() {
                return wrap(unwrap(this).doctype, idl.DocumentType);
            },

            get documentElement() {
                return wrap(unwrap(this).documentElement, idl.Element);
            },

            getElementsByTagName: function getElementsByTagName(qualifiedName) {
                let rv = unwrap(this).getElementsByTagName(String(qualifiedName));
                return wrap(rv, idl.NodeList);
            },

            getElementsByTagNameNS: function getElementsByTagNameNS(
                                    namespace,
                                    localName)
            {
                let rv = unwrap(this).getElementsByTagNameNS(
                    String(namespace),
                    String(localName));
                return wrap(rv, idl.NodeList);
            },

            getElementsByClassName: function getElementsByClassName(classNames) {
                let rv = unwrap(this).getElementsByClassName(String(classNames));
                return wrap(rv, idl.NodeList);
            },

            getElementById: function getElementById(elementId) {
                let rv = unwrap(this).getElementById(String(elementId));
                return wrap(rv, idl.Element);
            },

            createElement: function createElement(localName) {
                let rv = unwrap(this).createElement(StringOrEmpty(localName));
                return wrap(rv, idl.Element);
            },

            createElementNS: function createElementNS(
                                    namespace,
                                    qualifiedName)
            {
                let rv = unwrap(this).createElementNS(
                    String(namespace),
                    String(qualifiedName));
                return wrap(rv, idl.Element);
            },

            createDocumentFragment: function createDocumentFragment() {
                let rv = unwrap(this).createDocumentFragment();
                return wrap(rv, idl.DocumentFragment);
            },

            createTextNode: function createTextNode(data) {
                let rv = unwrap(this).createTextNode(String(data));
                return wrap(rv, idl.Text);
            },

            createComment: function createComment(data) {
                let rv = unwrap(this).createComment(String(data));
                return wrap(rv, idl.Comment);
            },

            createProcessingInstruction: function createProcessingInstruction(
                                    target,
                                    data)
            {
                let rv = unwrap(this).createProcessingInstruction(
                    String(target),
                    String(data));
                return wrap(rv, idl.ProcessingInstruction);
            },

            importNode: function importNode(
                                    node,
                                    deep)
            {
                let rv = unwrap(this).importNode(
                    unwrap(node),
                    Boolean(deep));
                return wrap(rv, idl.Node);
            },

            adoptNode: function adoptNode(node) {
                let rv = unwrap(this).adoptNode(unwrap(node));
                return wrap(rv, idl.Node);
            },

            createEvent: function createEvent(eventInterfaceName) {
                let rv = unwrap(this).createEvent(String(eventInterfaceName));
                return wrap(rv, idl.Event);
            },

        },
    });
});

//
// Interface DOMImplementation
//

defineLazyProperty(global, "DOMImplementation", function() {
    return idl.DOMImplementation.publicInterface;
}, true);

defineLazyProperty(idl, "DOMImplementation", function() {
    return new IDLInterface({
        name: "DOMImplementation",
        members: {
            hasFeature: function hasFeature(
                                    feature,
                                    version)
            {
                return unwrap(this).hasFeature(
                    String(feature),
                    StringOrEmpty(version));
            },

            createDocumentType: function createDocumentType(
                                    qualifiedName,
                                    publicId,
                                    systemId)
            {
                let rv = unwrap(this).createDocumentType(
                    StringOrEmpty(qualifiedName),
                    String(publicId),
                    String(systemId));
                return wrap(rv, idl.DocumentType);
            },

            createDocument: function createDocument(
                                    namespace,
                                    qualifiedName,
                                    doctype)
            {
                let rv = unwrap(this).createDocument(
                    StringOrEmpty(namespace),
                    StringOrEmpty(qualifiedName),
                    unwrapOrNull(doctype));
                return wrap(rv, idl.Document);
            },

            createHTMLDocument: function createHTMLDocument(title) {
                let rv = unwrap(this).createHTMLDocument(String(title));
                return wrap(rv, idl.Document);
            },

        },
    });
});

//
// Interface Element
//

defineLazyProperty(global, "Element", function() {
    return idl.Element.publicInterface;
}, true);

defineLazyProperty(idl, "Element", function() {
    return new IDLInterface({
        name: "Element",
        superclass: idl.Node,
        members: {
            get namespaceURI() {
                return unwrap(this).namespaceURI;
            },

            get prefix() {
                return unwrap(this).prefix;
            },

            get localName() {
                return unwrap(this).localName;
            },

            get tagName() {
                return unwrap(this).tagName;
            },

            get attributes() {
                return wrap(unwrap(this).attributes, idl.AttrArray);
            },

            getAttribute: function getAttribute(qualifiedName) {
                return unwrap(this).getAttribute(String(qualifiedName));
            },

            getAttributeNS: function getAttributeNS(
                                    namespace,
                                    localName)
            {
                return unwrap(this).getAttributeNS(
                    String(namespace),
                    String(localName));
            },

            setAttribute: function setAttribute(
                                    qualifiedName,
                                    value)
            {
                return unwrap(this).setAttribute(
                    String(qualifiedName),
                    String(value));
            },

            setAttributeNS: function setAttributeNS(
                                    namespace,
                                    qualifiedName,
                                    value)
            {
                return unwrap(this).setAttributeNS(
                    String(namespace),
                    String(qualifiedName),
                    String(value));
            },

            removeAttribute: function removeAttribute(qualifiedName) {
                return unwrap(this).removeAttribute(String(qualifiedName));
            },

            removeAttributeNS: function removeAttributeNS(
                                    namespace,
                                    localName)
            {
                return unwrap(this).removeAttributeNS(
                    String(namespace),
                    String(localName));
            },

            hasAttribute: function hasAttribute(qualifiedName) {
                return unwrap(this).hasAttribute(String(qualifiedName));
            },

            hasAttributeNS: function hasAttributeNS(
                                    namespace,
                                    localName)
            {
                return unwrap(this).hasAttributeNS(
                    String(namespace),
                    String(localName));
            },

            getElementsByTagName: function getElementsByTagName(qualifiedName) {
                let rv = unwrap(this).getElementsByTagName(String(qualifiedName));
                return wrap(rv, idl.NodeList);
            },

            getElementsByTagNameNS: function getElementsByTagNameNS(
                                    namespace,
                                    localName)
            {
                let rv = unwrap(this).getElementsByTagNameNS(
                    String(namespace),
                    String(localName));
                return wrap(rv, idl.NodeList);
            },

            getElementsByClassName: function getElementsByClassName(classNames) {
                let rv = unwrap(this).getElementsByClassName(String(classNames));
                return wrap(rv, idl.NodeList);
            },

            get children() {
                return wrap(unwrap(this).children, idl.HTMLCollection);
            },

            get firstElementChild() {
                return wrap(unwrap(this).firstElementChild, idl.Element);
            },

            get lastElementChild() {
                return wrap(unwrap(this).lastElementChild, idl.Element);
            },

            get previousElementSibling() {
                return wrap(unwrap(this).previousElementSibling, idl.Element);
            },

            get nextElementSibling() {
                return wrap(unwrap(this).nextElementSibling, idl.Element);
            },

            get childElementCount() {
                return unwrap(this).childElementCount;
            },

        },
    });
});

//
// Interface Attr
//

defineLazyProperty(global, "Attr", function() {
    return idl.Attr.publicInterface;
}, true);

defineLazyProperty(idl, "Attr", function() {
    return new IDLInterface({
        name: "Attr",
        members: {
            get namespaceURI() {
                return unwrap(this).namespaceURI;
            },

            get prefix() {
                return unwrap(this).prefix;
            },

            get localName() {
                return unwrap(this).localName;
            },

            get name() {
                return unwrap(this).name;
            },

            get value() {
                return unwrap(this).value;
            },
            set value(newval) {
                unwrap(this).value = String(newval);
            },

        },
    });
});

//
// Interface DocumentType
//

defineLazyProperty(global, "DocumentType", function() {
    return idl.DocumentType.publicInterface;
}, true);

defineLazyProperty(idl, "DocumentType", function() {
    return new IDLInterface({
        name: "DocumentType",
        superclass: idl.Node,
        members: {
            get name() {
                return unwrap(this).name;
            },

            get publicId() {
                return unwrap(this).publicId;
            },

            get systemId() {
                return unwrap(this).systemId;
            },

        },
    });
});

//
// Interface ProcessingInstruction
//

defineLazyProperty(global, "ProcessingInstruction", function() {
    return idl.ProcessingInstruction.publicInterface;
}, true);

defineLazyProperty(idl, "ProcessingInstruction", function() {
    return new IDLInterface({
        name: "ProcessingInstruction",
        superclass: idl.Node,
        members: {
            get target() {
                return unwrap(this).target;
            },

            get data() {
                return unwrap(this).data;
            },
            set data(newval) {
                unwrap(this).data = String(newval);
            },

        },
    });
});

//
// Interface CharacterData
//

defineLazyProperty(global, "CharacterData", function() {
    return idl.CharacterData.publicInterface;
}, true);

defineLazyProperty(idl, "CharacterData", function() {
    return new IDLInterface({
        name: "CharacterData",
        superclass: idl.Node,
        members: {
            get data() {
                return unwrap(this).data;
            },
            set data(newval) {
                unwrap(this).data = StringOrEmpty(newval);
            },

            get length() {
                return unwrap(this).length;
            },

            substringData: function substringData(
                                    offset,
                                    count)
            {
                return unwrap(this).substringData(
                    toULong(offset),
                    toULong(count));
            },

            appendData: function appendData(data) {
                return unwrap(this).appendData(String(data));
            },

            insertData: function insertData(
                                    offset,
                                    data)
            {
                return unwrap(this).insertData(
                    toULong(offset),
                    String(data));
            },

            deleteData: function deleteData(
                                    offset,
                                    count)
            {
                return unwrap(this).deleteData(
                    toULong(offset),
                    toULong(count));
            },

            replaceData: function replaceData(
                                    offset,
                                    count,
                                    data)
            {
                return unwrap(this).replaceData(
                    toULong(offset),
                    toULong(count),
                    String(data));
            },

        },
    });
});

//
// Interface Text
//

defineLazyProperty(global, "Text", function() {
    return idl.Text.publicInterface;
}, true);

defineLazyProperty(idl, "Text", function() {
    return new IDLInterface({
        name: "Text",
        superclass: idl.CharacterData,
        members: {
            splitText: function splitText(offset) {
                let rv = unwrap(this).splitText(toULong(offset));
                return wrap(rv, idl.Text);
            },

            get wholeText() {
                return unwrap(this).wholeText;
            },

            replaceWholeText: function replaceWholeText(data) {
                let rv = unwrap(this).replaceWholeText(String(data));
                return wrap(rv, idl.Text);
            },

        },
    });
});

//
// Interface Comment
//

defineLazyProperty(global, "Comment", function() {
    return idl.Comment.publicInterface;
}, true);

defineLazyProperty(idl, "Comment", function() {
    return new IDLInterface({
        name: "Comment",
        superclass: idl.CharacterData,
        members: {
        },
    });
});

//
// Interface NodeList
//

defineLazyProperty(global, "NodeList", function() {
    return idl.NodeList.publicInterface;
}, true);

defineLazyProperty(idl, "NodeList", function() {
    return new IDLInterface({
        name: "NodeList",
        proxyHandler: NodeListProxyHandler,
        members: {
            item: function item(index) {
                let rv = unwrap(this).item(toULong(index));
                return wrap(rv, idl.Node);
            },

            get length() {
                return unwrap(this).length;
            },

        },
    });
});

//
// Interface HTMLCollection
//

defineLazyProperty(global, "HTMLCollection", function() {
    return idl.HTMLCollection.publicInterface;
}, true);

defineLazyProperty(idl, "HTMLCollection", function() {
    return new IDLInterface({
        name: "HTMLCollection",
        proxyHandler: HTMLCollectionProxyHandler,
        members: {
            get length() {
                return unwrap(this).length;
            },

            item: function item(index) {
                let rv = unwrap(this).item(toULong(index));
                return wrap(rv, idl.Element);
            },

            namedItem: function namedItem(name) {
                return unwrap(this).namedItem(String(name));
            },

        },
    });
});

//
// Interface DOMStringList
//

defineLazyProperty(global, "DOMStringList", function() {
    return idl.DOMStringList.publicInterface;
}, true);

defineLazyProperty(idl, "DOMStringList", function() {
    return new IDLInterface({
        name: "DOMStringList",
        proxyHandler: DOMStringListProxyHandler,
        members: {
            get length() {
                return unwrap(this).length;
            },

            item: function item(index) {
                return unwrap(this).item(toULong(index));
            },

            contains: function contains(string) {
                return unwrap(this).contains(String(string));
            },

        },
    });
});

//
// Interface DOMTokenList
//

defineLazyProperty(global, "DOMTokenList", function() {
    return idl.DOMTokenList.publicInterface;
}, true);

defineLazyProperty(idl, "DOMTokenList", function() {
    return new IDLInterface({
        name: "DOMTokenList",
        proxyHandler: DOMTokenListProxyHandler,
        members: {
            get length() {
                return unwrap(this).length;
            },

            item: function item(index) {
                return unwrap(this).item(toULong(index));
            },

            contains: function contains(token) {
                return unwrap(this).contains(String(token));
            },

            add: function add(token) {
                return unwrap(this).add(String(token));
            },

            remove: function remove(token) {
                return unwrap(this).remove(String(token));
            },

            toggle: function toggle(token) {
                return unwrap(this).toggle(String(token));
            },

            toString: function toString() {
                return unwrap(this).toString();
            },

        },
    });
});

//
// Interface DOMSettableTokenList
//

defineLazyProperty(global, "DOMSettableTokenList", function() {
    return idl.DOMSettableTokenList.publicInterface;
}, true);

defineLazyProperty(idl, "DOMSettableTokenList", function() {
    return new IDLInterface({
        name: "DOMSettableTokenList",
        superclass: idl.DOMTokenList,
        members: {
            get value() {
                return unwrap(this).value;
            },
            set value(newval) {
                unwrap(this).value = String(newval);
            },

        },
    });
});

defineLazyProperty(idl, "AttrArray", function() {
    return new IDLInterface({
        name: "AttrArray",
        superclass: Array,
        proxyHandler: AttrArrayProxyHandler,
    });
});



/************************************************************************
 *  src/impl/Node.js
 ************************************************************************/

//@line 1 "src/impl/Node.js"
defineLazyProperty(impl, "Node", function() {
    // All nodes have a nodeType and an ownerDocument.
    // Once inserted, they also have a parentNode.
    // This is an abstract class; all nodes in a document are instances
    // of a subtype, so all the properties are defined by more specific
    // constructors.
    function Node() {
    }

    Node.prototype = Object.create(Object.prototype, {
        
        parentElement: attribute(function() {
            return (this.parentNode && this.parentNode.nodeType===ELEMENT_NODE)
                ? this.parentNode
                : null
        }),
        
        hasChildNodes: constant(function() {  // Overridden in leaf.js
            return this.childNodes.length > 0;
        }),

        firstChild: attribute(function() {
            return this.childNodes.length === 0
                ? null
                : this.childNodes[0];
        }),
        
        lastChild: attribute(function() {
            return this.childNodes.length === 0
                ? null
                : this.childNodes[this.childNodes.length-1];
        }),

        previousSibling: attribute(function() {
            if (!this.parentNode) return null;
            let sibs = this.parentNode.childNodes, i = this.index;
            return i === 0
                ? null
                : sibs[i-1]
        }),

        nextSibling: attribute(function() {
            if (!this.parentNode) return null;
            let sibs = this.parentNode.childNodes, i = this.index;
            return i+1 === sibs.length
                ? null
                : sibs[i+1]
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
            let parent = this;
            if (refChild === null) return this.appendChild(child);
            if (refChild.parentNode !== parent) NotFoundError();
            if (child.isAncestor(parent)) HierarchyRequestError();
            if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
            parent.ensureSameDoc(child);
            child.insert(parent, refChild.index);
            return child;
        }),


        appendChild: constant(function(child) {
            let parent = this;
            if (child.isAncestor(parent)) HierarchyRequestError();
            if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
            parent.ensureSameDoc(child);
            child.insert(parent, parent.childNodes.length);
            return child;
        }),

        removeChild: constant(function removeChild(child) {
            let parent = this;
            if (child.parentNode !== parent) NotFoundError();
            child.remove();
            return child;
        }),

        replaceChild: constant(function replaceChild(newChild, oldChild) {
            let parent = this;
            if (oldChild.parentNode !== parent) NotFoundError();
            if (newChild.isAncestor(parent)) HierarchyRequestError();
            parent.ensureSameDoc(newChild);

            let refChild = oldChild.nextSibling;
            oldChild.remove();
            return parent.insertBefore(newChild, refChild);
        }),

        compareDocumentPosition:constant(function compareDocumentPosition(that){
            // Basic algorithm for finding the relative position of two nodes.
            // Make a list the ancestors of each node, starting with the 
            // document element and proceeding down to the nodes themselves.
            // Then, loop through the lists, looking for the first element
            // that differs.  The order of those two elements give the
            // order of their descendant nodes.  Or, if one list is a prefix
            // of the other one, then that node contains the other.

            if (this === that) return 0;

            // If they're not owned by the same document or if one is rooted
            // and one is not, then they're disconnected.
            if (this.ownerDocument != that.ownerDocument ||
                this.root !== that.root)
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            // Get arrays of ancestors for this and that
            let these = [], those = []; 
            for(let n = this; n !== null; n = n.parentNode) push(these, n);
            for(let n = that; n !== null; n = n.parentNode) push(those, n);
            these.reverse();  // So we start with the outermost
            those.reverse();

            if (these[0] !== those[0]) // No common ancestor
                return (DOCUMENT_POSITION_DISCONNECTED +
                        DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

            let n = Math.min(these.length, those.length);
            for(let i = 1; i < n; i++) {
                if (these[i] !== those[i]) {
                    // We found two different ancestors, so compare
                    // their positions
                    if (these[i].index < those[i].index)
                        return DOCUMENT_POSITION_FOLLOWING;
                    else
                        return DOCUMENT_POSITION_PRECEDING;
                }
            }

            // If we get to here, then one of the nodes (the one with the
            // shorter list of ancestors) contains the other one.
            if (these.length < those.length) 
                return (DOCUMENT_POSITION_FOLLOWING + 
                        DOCUMENT_POSITION_CONTAINED_BY);
            else
                return (DOCUMENT_POSITION_PRECEDING + 
                        DOCUMENT_POSITION_CONTAINS);
        }),

        // These are the EventTarget methods.
        // Since all nodes are event targets, we just put them here
        // rather than creating another level of prototype inheritance.
        addEventListener: constant(nyi),
        removeEventListener: constant(nyi),
        dispatchEvent: constant(nyi),

        // Utility methods for nodes.  Not part of the DOM

        // Return the index of this node in its parent.
        // Throw if no parent, or if this node is not a child of its parent
        index: attribute(function() {
            assert(this.parentNode);
            let kids = this.parentNode.childNodes
            if (this._index == undefined || kids[this._index] != this) {
                this._index = A.indexOf(kids, this);
                assert(this._index != -1);
            }
            return this._index;
        }),

        // Return true if this node is equal to or is an ancestor of that node
        // Note that nodes are considered to be ancestors of themselves
        isAncestor: constant(function(that) {
            // If they belong to different documents, then they're unrelated.
            if (this.ownerDocument != that.ownerDocument) return false;
            // If one is rooted and one isn't then they're not related
            if (this.root !== that.root) return false;

            // Otherwise check by traversing the parentNode chain
            for(let e = that; e; e = e.parentNode) {
                if (e === this) return true;
            }
            return false;
        }),

        // When a user agent is to ensure that two Nodes, old and new, are
        // in the same Document, it must run the following steps:
        //
        //     If new is a DocumentType, run the following steps:
        //
        //         If new's ownerDocument is not null, and it is not equal
        //         to old's ownerDocument, throw a WRONG_DOCUMENT_ERR
        //         exception and terminate these steps.
        //
        //         Otherwise, set its ownerDocument to old's
        //         ownerDocument.
        //
        //     Otherwise, invoke old's ownerDocument's adoptNode method
        //     with new as its argument.
        //
        //     If old's ownerDocument and new's ownerDocument are not the
        //     same, throw a HIERARCHY_REQUEST_ERR
        ensureSameDoc: constant(function(that) {
            // Get the owner of the node, the node itself, if it is a document
            let ownerdoc = this.ownerDocument || this;

            if (that.nodeType === DOCUMENT_TYPE_NODE) {
                if (that.ownerDocument !== null && that.ownerDocument !== ownerdoc)
                    WrongDocumentError();
                that.ownerDocument = ownerdoc;
            }
            else {
                // The spec's algorithm says to call adoptNode
                // unconditionally, which will remove it from its current
                // location in the document even it if is not changing
                // documents.  I don't do that here because that would cause a
                // lot of unnecessary uproot and reroot mutation events.
                if (that.ownerDocument !== ownerdoc)
                    ownerdoc.adoptNode(that);
            }
            
            // XXX: this step does not seem necessary.
            // If mutation events are added, however, it becomes necessary
            if (that.ownerDocument !== ownerdoc) HierarchyRequestError();
        }),

        // Remove this node from its parent
        remove: constant(function remove() {
            // Remove this node from its parents array of children
            splice(this.parentNode.childNodes, this.index, 1);

            // Update the structure id for all ancestors
            this.parentNode.modify();

            // Forget this node's parent
            delete this.parentNode;

            // Send mutation events if necessary
            if (this.root) this.root.mutateRemove(this);
        }),

        // Insert this node as a child of parent at the specified index,
        // firing mutation events as necessary
        insert: constant(function insert(parent, index) {
            let child = this, kids = parent.childNodes;

            // Special case for document fragments
            if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
                let  c;
                while(c = child.firstChild)
                    c.insert(parent, index++);
                return;
            }

            // If both the child and the parent are rooted, then we want to
            // transplant the child without uprooting and rerooting it.
            if (child.root && parent.root) {
                // Remove the child from its current position in the tree
                // without calling remove(), since we don't want to uproot it.
                let curpar = child.parentNode, curidx = child.index;
                splice(child.parentNode.childNodes, child.index, 1);
                curpar.modify();

                // And insert it as a child of its new parent
                child.parentNode = parent;
                splice(kids, index, 0, child);
                child._index = index;              // Optimization
                parent.modify();

                // Generate a move mutation event
                parent.ownerDocument.mutateMove(child);
            }
            else {
                // If the child already has a parent, it needs to be
                // removed from that parent, which may also uproot it
                if (child.parentNode) child.remove();
                
                // Now insert the child into the parent's array of children
                child.parentNode = parent;
                splice(kids, index, 0, child);
                parent.modify();
                child._index = index;              // Optimization
                
                // And root the child if necessary
                if (parent.root) parent.root.mutateInsert(child);
            }
        }),


        // Return the lastModified value for this node. (For use as a
        // cache invalidation mechanism. If the node does not already
        // have one, initialize it from the owner document's modclock
        // property.  (Note that modclock does not return the actual
        // time; it is simply a counter incremented on each document
        // modification)
        lastModified: attribute(function() {
            if (!this._lastModified)
                this._lastModified = this.doc.modclock;
                
            return this._lastModified;
        }),

        // Increment the owner document's modclock and use the new
        // value to update the lastModified value for this node and
        // all of its ancestors.  Nodes that have never had their
        // lastModified value queried do not need to have a
        // lastModified property set on them since there is no
        // previously queried value to ever compare the new value
        // against, so only update nodes that already have a
        // _lastModified property.
        modify: constant(function() {
            let time = ++this.doc.modclock;
            for(let n = this; n; n = n.parentElement)
                if (n._lastModified) n._lastModified = time;

        }),

        // This attribute is not part of the DOM but is quite helpful.
        // It returns the document with which a node is associated.  Usually
        // this is the ownerDocument. But ownerDocument is null for the
        // document object itself, so this is a handy way to get the document
        // regardless of the node type
        doc: attribute(function() {
            return this.ownerDocument || this;
        })


    });

    return Node;
});


/************************************************************************
 *  src/impl/Leaf.js
 ************************************************************************/

//@line 1 "src/impl/Leaf.js"
defineLazyProperty(impl, "Leaf", function() {
    // This class defines common functionality for node subtypes that
    // can never have children
    function Leaf() {}

    Leaf.prototype = Object.create(impl.Node.prototype, {
        hasChildNodes: constant(function() { return false; }),
        firstChild: constant(null),
        lastChild: constant(null),
        insertBefore: constant(HierarchyRequestError),
        replaceChild: constant(HierarchyRequestError),
        removeChild: constant(HierarchyRequestError),
        appendChild: constant(HierarchyRequestError),

        // Each node must have its own unique childNodes array.  But
        // leaves always have an empty array, so initialize it lazily.
        // If the childNodes property is read, we'll return an array
        // and define a read-only property directly on the object that
        // will shadow this one. I'd like to freeze the array, too, since
        // leaf nodes can never have children, but I'll end up having to add
        // a property to refer back to the IDL NodeList wrapper.
        childNodes: attribute(function() {
            var a = [];
            O.defineProperty(this, "childNodes", constant(a));
            return a;
        }),
    });

    return Leaf;
});


/************************************************************************
 *  src/impl/CharacterData.js
 ************************************************************************/

//@line 1 "src/impl/CharacterData.js"
defineLazyProperty(impl, "CharacterData", function() {
    function CharacterData() {
    }
    
    CharacterData.prototype = Object.create(impl.Leaf.prototype, {
        // DOMString substringData(unsigned long offset,
        //                         unsigned long count);
        // The substringData(offset, count) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     If offset+count is greater than the context
        //     object's length, return a DOMString whose value is
        //     the UTF-16 code units from the offsetth UTF-16 code
        //     unit to the end of data.
        //
        //     Return a DOMString whose value is the UTF-16 code
        //     units from the offsetth UTF-16 code unit to the
        //     offset+countth UTF-16 code unit in data.
        substringData: constant(function substringData(offset, count) {
            if (offset > this.data.length) IndexSizeError();
            return substring(this.data, offset, offset+count);
        }),

        // void appendData(DOMString data);
        // The appendData(data) method must append data to the context
        // object's data.
        appendData: constant(function appendData(data) {
            this.data = this.data + data;
        }),

        // void insertData(unsigned long offset, DOMString data);
        // The insertData(offset, data) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     Insert data into the context object's data after
        //     offset UTF-16 code units.
        //
        insertData: constant(function insertData(offset, data) {
            let curtext = this.data;
            if (offset > curtext.length) IndexSizeError();
            let prefix = substring(curtext, 0, offset), 
            suffix = substring(curtext, offset);
            this.data = prefix + data + suffix;
        }),
        

        // void deleteData(unsigned long offset, unsigned long count);
        // The deleteData(offset, count) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     If offset+count is greater than the context
        //     object's length let count be length-offset.
        //
        //     Starting from offset UTF-16 code units remove count
        //     UTF-16 code units from the context object's data.
        deleteData: constant(function deleteData(offset, count) {
            let curtext = this.data, len = curtext.length;

            if (offset > len) IndexSizeError();
            
            if (offset+count > len)
                count = len - offset;

            let prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

            this.data = prefix + suffix;
        }),


        // void replaceData(unsigned long offset, unsigned long count,
        //                  DOMString data);
        // 
        // The replaceData(offset, count, data) method must act as
        // if the deleteData() method is invoked with offset and
        // count as arguments followed by the insertData() method
        // with offset and data as arguments and re-throw any
        // exceptions these methods might have thrown.
        replaceData: constant(function replaceData(offset, count, data) {
            let curtext = this.data, len = curtext.length;

            if (offset > len) IndexSizeError();
            
            if (offset+count > len)
                count = len - offset;

            let prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

            this.data = prefix + data + suffix;
        })
    });

    return CharacterData;
});


/************************************************************************
 *  src/impl/Text.js
 ************************************************************************/

//@line 1 "src/impl/Text.js"
defineLazyProperty(impl, "Text", function() {
    function Text(doc, data) {
        this.ownerDocument = doc;
        this._data = data;
    }
    
    var nodeValue = attribute(function() { return this._data; },
                              function(v) { 
                                  this._data = v;
                                  if (this.root)
                                      this.root.mutateValue(this);
                              });
    
    Text.prototype = Object.create(impl.CharacterData.prototype, {
        nodeType: constant(TEXT_NODE),
        nodeName: constant("#text"),
        // These three attributes are all the same.
        // The data attribute has a [TreatNullAs=EmptyString] but we'll
        // implement that at the interface level
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
    });

    return Text;
});


/************************************************************************
 *  src/impl/Comment.js
 ************************************************************************/

//@line 1 "src/impl/Comment.js"
defineLazyProperty(impl, "Comment", function() {
    function Comment(doc, data) {
        this.ownerDocument = doc;
        this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
                              function(v) { 
                                  this._data = v;
                                  if (this.root)
                                      this.root.mutateValue(this);
                              });
    
    Comment.prototype = Object.create(impl.CharacterData.prototype, {
        nodeType: constant(COMMENT_NODE),
        nodeName: constant("#comment"),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
    });
    
    return Comment;
});


/************************************************************************
 *  src/impl/ProcessingInstruction.js
 ************************************************************************/

//@line 1 "src/impl/ProcessingInstruction.js"
defineLazyProperty(impl, "ProcessingInstruction", function() {

    function ProcessingInstruction(doc, target, data) {
        this.ownerDocument = doc;
        this.target = target;
        this._data = data;
    }

    var nodeValue = attribute(function() { return this._data; },
                              function(v) { 
                                  this._data = v;
                                  if (this.root)
                                      this.root.mutateValue(this);
                              });

    ProcessingInstruction.prototype = Object.create(impl.Leaf.prototype, {
        nodeType: constant(PROCESSING_INSTRUCTION_NODE),
        nodeName: attribute(function() { return this.target; }),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
    });

    return ProcessingInstruction;
});


/************************************************************************
 *  src/impl/Element.js
 ************************************************************************/

//@line 1 "src/impl/Element.js"
defineLazyProperty(impl, "Element", function() {
    function Element(doc, localName, namespaceURI, prefix) {
        this.ownerDocument = doc;
        this.localName = localName;
        this.namespaceURI = namespaceURI;
        this.prefix = prefix;

        this.tagName = (prefix !== null)
            ? prefix + ":" + localName
            : localName;

        if (this.isHTML)
            this.tagName = toUpperCase(this.tagName);

        this.attributes = [];
        this.childNodes = [];
    }

    Element.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(ELEMENT_NODE),
        nodeName: attribute(function() { return this.tagName; }),
        nodeValue: attribute(fnull, fnoop),
        
        isHTML: attribute(function() { 
            return this.namespaceURI === HTML_NAMESPACE &&
                this.ownerDocument.isHTML;
        }),

        getAttribute: constant(function getAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname)
                    return attr.value;
            }
            return null;
        }),

        hasAttribute: constant(function hasAttribute(qname) {
            return this.getAttribute(qname) !== null;
        }),


        setAttribute: constant(function setAttribute(qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (this.isHTML) qname = toLowerCase(qname);
            if (substring(qname, 0, 5) === "xmlns") NamespaceError();

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname) {
                    attr.value = value;     // Setter sends mutation event for us
                    return;
                }
            }

            // The attribute doesn't already exist, so add a new one
            let newattr = new impl.Attr(this, qname, value)
            push(this.attributes, newattr);

            // Send mutation event
            if (this.root) this.root.mutateAddAttr(newattr);
        }),

        removeAttribute: constant(function removeAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname) {
                    splice(this.attributes, i, 1);
                    // Mutation event
                    if (this.root) this.root.mutateRemoveAttr(attr);
                    return;
                }
            }
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname)
                    return attr.value;
            }
            return null;
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
            return this.getAttributeNS(ns, lname) !== null;
        }),

        setAttributeNS: constant(function setAttributeNS(ns, qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (!isValidQName(qname)) NamespaceError();

            let pos = S.indexOf(qname, ":"), prefix, lname;
            if (pos === -1) {
                prefix = null;
                lname = qname;
            }
            else {
                prefix = substring(qname, 0, pos);
                lname = substring(qname, pos+1);
            }

            if (ns === "") ns = null;

            if ((prefix !== null && ns === null) ||
                (prefix === "xml" && ns !== XML_NAMESPACE) ||
                ((qname === "xmlns" || prefix === "xmlns") &&
                 (ns !== XMLNS_NAMESPACE)) ||
                (ns === XMLNS_NAMESPACE && 
                 !(qname === "xmlns" || prefix === "xmlns")))
                NamespaceError();

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname) {

                    // setAttributeNS can change the prefix (and therefore 
                    // qname) of an attribute
                    if (attr.prefix !== prefix) {
                        attr.prefix = prefix;
                        attr.name = prefix + ":" + attr.localName 
                    }

                    attr.value = value;  // this automatically fires an event
                    return;
                }
            }
            let newattr = new impl.Attr(this, lname, value, prefix, ns)
            push(this.attributes, newattr);
            if (this.root) this.root.mutateAddAttr(newattr);
        }),


        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname) {
                    splice(this.attributes, i, 1);
                    if (this.root) this.root.mutateRemoveAttr(attr);
                    return;
                }
            }
        }),

        
        firstElementChild: attribute(function() {
            let kids = this.childNodes;
            for(let i = 0, n = kids.length; i < n; i++) {
                if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
            }
            return null;
        }),

        lastElementChild: attribute(function() {
            let kids = this.childNodes;
            for(let i = kids.length-1; i >= 0; i--) {
                if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
            }
            return null;
        }),

        nextElementSibling: attribute(function() {
            if (this.parentNode) {
                let sibs = this.parentNode.childNodes;
                for(let i = this.index+1, n = sibs.length; i < n; i++) {
                    if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
                }
            }
            return null;
        }),

        previousElementSibling: attribute(function() {
            if (this.parentNode) {
                let sibs = this.parentNode.childNodes;
                for(let i = this.index-1; i >= 0; i--) {
                    if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
                }
            }
            return null;
        }),

        childElementCount: attribute(function() {
            let kids = this.childNodes, count = 0;
            for(let i = 0, n = kids.length; i < n; i++) {
                if (kids[i].nodeType === ELEMENT_NODE) count++
            }
            return count;
        }),

        // Return the next element, in source order, after this one or
        // null if there are no more.  If root element is specified,
        // then don't traverse beyond its subtree.
        // 
        // This is not a DOM method, but is convenient for 
        // lazy traversals of the tree.
        nextElement: constant(function(root) {
            let next = this.firstElementChild || this.nextElementSibling;
            if (next) return next;

            // XXX: still need to implement Document.documentElement
            if (!root) root = this.ownerDocument.documentElement;

            // If we can't go down or across, then we have to go up
            // and across to the parent sibling or another ancestor's
            // sibling.  Be careful, though: if we reach the root
            // element, or if we reach the documentElement, then 
            // the traversal ends.
            for(let parent = this.parentElement;
                parent && parent !== root;
                parent = parent.parentElement) {

                next = parent.nextElementSibling;
                if (next) return next;
            }

            return null;
        }),

        // Just copy this method from the Document prototype
        getElementsByTagName:
            constant(impl.Document.prototype.getElementsByTagName),

        getElementsByTagNameNS:
            constant(impl.Document.prototype.getElementsByTagNameNS),

        getElementsByClassName:
            constant(impl.Document.prototype.getElementsByClassName),

    });

    return Element;
});


/************************************************************************
 *  src/impl/Attr.js
 ************************************************************************/

//@line 1 "src/impl/Attr.js"
defineLazyProperty(impl, "Attr", function() {

    function Attr(elt, lname, value, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        // DOM Attr objects are no longer Nodes, but we still give them a type
        // because we need that property to make the wrap() method work.
        this.nodeType = ATTRIBUTE_NODE;

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.data = value;   // See prototype for value getter/setter
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
        this.name = prefix ? prefix + ":" + lname : lname;
    }

    Attr.prototype = Object.create(Object.prototype, {
        value: attribute(function() { return this.data; },
                         function(v) { 
                             let oldval = this.data;
                             this.data = v;
                             if (this.ownerElement.root)
                                 this.ownerElement.root.mutateAttr(this,oldval);
                         })
    });

    return Attr;
});


/************************************************************************
 *  src/impl/Document.js
 ************************************************************************/

//@line 1 "src/impl/Document.js"
defineLazyProperty(impl, "Document", function() {

    function Document(isHTML) {
        this.isHTML = isHTML;
        this.documentURI = null;    // XXX what should this be?
        this.implementation = new impl.DOMImplementation();

        // These will be initialized by our custom versions of
        // appendChild and insertBefore that override the inherited
        // Node methods.
        // XXX: override those methods!
        this.doctype = null;
        this.documentElement = null;
        this.childNodes = [];

        // Documents are always rooted, by definition
        this.root = this;

        // This maintains the mapping from element ids to element nodes.
        // We may need to update this mapping every time a node is rooted
        // or uprooted, and any time an attribute is added, removed or changed
        // on a rooted element.
        this.byId = Object.create(null); // inherit nothing

        // This property holds a monotonically increasing value akin to 
        // a timestamp used to record the last modification time of nodes
        // and their subtrees. See the lastModified attribute and modify()
        // method of the Node class.  And see FilteredElementList for an example
        // of the use of lastModified
        this.modclock = 0;
    }

    Document.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        compatMode: constant("CSS1Compat"),
        ownerDocument: constant(null),
        parentNode: constant(null),

        createTextNode: constant(function(data) {
            return new impl.Text(this, data);
        }),
        createComment: constant(function(data) {
            return new impl.Comment(this, data);
        }),
        createDocumentFragment: constant(function() {
            return new impl.DocumentFragment(this);
        }),
        createProcessingInstruction: constant(function(target, data) {
            return new impl.ProcessingInstruction(this, target, data);
        }),

        createElement: constant(function(localName) {
            if (!isValidName(localName)) InvalidCharacterError();

            if (this.isHTML)
                localName = toLowerCase(localName);

            return new impl.Element(this, localName, HTML_NAMESPACE, null);
        }),

        createElementNS: constant(function(namespace, qualifiedName) {
            if (!isValidName(qualifiedName)) InvalidCharacterError();
            if (!isValidQName(qualifiedName)) NamespaceError();
            
            let pos, prefix, localName;
            if ((pos = S.indexOf(qualifiedName, ":")) !== -1) {
                prefix = substring(qualifiedName, 0, pos);
                localName = substring(qualifiedName, pos+1);

                if (namespace === "" ||
                    (prefix === "xml" && namespace !== XML_NAMESPACE))
                    NamespaceError();
            }
            else {
                prefix = null;
                localName = qualifiedName;
            }

            if (((qualifiedName === "xmlns" || prefix === "xmlns") &&
                 namespace !== XMLNS_NAMESPACE) ||
                (namespace === XMLNS_NAMESPACE && 
                 qualifiedName !== "xmlns" &&
                 prefix !== "xmlns"))
                NamespaceError();

            return new impl.Element(this, localName, namespace, prefix);
        }),

        // Add some (surprisingly complex) document hierarchy validity
        // checks when adding, removing and replacing nodes into a
        // document object, and also maintain the documentElement and
        // doctype properties of the document.  Each of the following
        // 4 methods chains to the Node implementation of the method
        // to do the actual inserting, removal or replacement.

        appendChild: constant(function(child) {
            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                if (this.documentElement) // We already have a root element
                    HierarchyRequestError();

                this.documentElement = child;
            }
            if (child.nodeType === DOCUMENT_TYPE_NODE) {
                if (this.doctype ||        // Already have one
                    this.documentElement)   // Or out-of-order
                    HierarchyRequestError()

                this.doctype = child;
            }

            // Now chain to our superclass
            return impl.Node.prototype.appendChild.call(this, child);
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
            if (refChild.parentNode !== this) NotFoundError();
            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                // If we already have a root element or if we're trying to
                // insert it before the doctype
                if (this.documentElement ||
                    (this.doctype && this.doctype.index >= refChild.index))
                    HierarchyRequestError();

                this.documentElement = child;
            }
            if (child.nodeType === DOCUMENT_TYPE_NODE) {
                if (this.doctype ||        
                    (this.documentElement &&
                     refChild.index >= this.documentElement.index))
                    HierarchyRequestError()

                this.doctype = child;
            }
            return impl.Node.prototype.insertBefore.call(this, child, refChild);
        }),        

        replaceChild: constant(function replaceChild(child, oldChild) {
            if (oldChild.parentNode !== this) NotFoundError();

            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                // If we already have a root element and we're not replacing it
                if (this.documentElement && this.documentElement !== oldChild)
                    HierarchyRequestError();
                // Or if we're trying to put the element before the doctype
                // (replacing the doctype is okay)
                if (this.doctype && oldChild.index < this.doctype.index)
                    HierarchyRequestError();

                this.documentElement = child;
                if (oldChild === this.doctype) this.doctype = null;
            }
            else if (child.nodeType === DOCUMENT_TYPE_NODE) {
                // If we already have a doctype and we're not replacing it
                if (this.doctype && oldChild !== this.doctype)
                    HierarchyRequestError();
                // If we have a docuemnt element and the old child
                // comes after it
                if (this.documentElement &&
                    oldChild.index > this.documentElement.index)
                    HierarchyRequestError();

                this.doctype = child;
                if (oldChild === this.documentElement)
                    this.documentElement = null;
            }
            else {
                if (oldChild === this.documentElement)
                    this.documentElement = null;
                else if (oldChild === this.doctype)
                    this.doctype = null;
            }
            return impl.Node.prototype.replaceChild.call(this, child, oldChild);
        }),

        removeChild: constant(function removeChild(child) {
            if (child.nodeType === DOCUMENT_TYPE_NODE)
                this.doctype = null;
            else if (child.nodeType === ELEMENT_NODE)
                this.documentElement = null;

            // Now chain to our superclass
            return impl.Node.prototype.removeChild.call(this, child);
        }),

        getElementById: constant(function(id) {
            let n = this.byId[id];
            if (!n) return null;
            if (isArray(n)) { // there was more than one element with this id
                return n[0];  // array is sorted in document order
            }
            return n;
        }),


        getElementsByTagName: constant(function getElementsByTagName(lname) {
            let filter;
            if (lname === "*")
                filter = ftrue;
            else if (this.doc.isHTML) 
                filter = htmlLocalNameElementFilter(lname);
            else 
                filter = localNameElementFilter(lname);

            return new impl.FilteredElementList(this, filter);
        }),

        getElementsByTagNameNS: constant(function getElementsByTagNameNS(ns,
                                                                         lname){
            let filter;
            if (ns === "*" && lname === "*")
                filter = ftrue;
            else if (ns === "*") 
                filter = localNameElementFilter(lname);
            else if (lname === "*")
                filter = namespaceElementFilter(ns);
            else
                filter = namespaceLocalNameElementFilter(ns, lname);

            return new impl.FilteredElementList(this, filter);
        }),

        getElementsByClassName: constant(function getElementsByClassName(names){
            names = names.trim();  
            if (names === "") return []; // Empty node list
            names = names.split(/\s+/);  // Split on spaces
            return new impl.FilteredElementList(this, 
                                           new classNamesElementFilter(names));
        }),

        adoptNode: constant(function(node) {
            if (node.nodeType === DOCUMENT_NODE ||
                node.nodeType === DOCUMENT_TYPE_NODE) NotSupportedError();

            if (node.parentNode) node.parentNode.removeChild(node)

            if (node.ownerDocument !== this)
                recursivelySetOwner(node, this);

            return node;
        }),


        // Implementation-specific function.  Called when a text, comment, 
        // or pi value changes.
        mutateValue: constant(function(node) {
        }),

        // Invoked when an attribute's value changes. Attr holds the new
        // value.  oldval is the old value.  Attribute mutations can also
        // involve changes to the prefix (and therefore the qualified name)
        mutateAttr: constant(function(attr, oldval) {
            if (attr.localName === "id" && attr.namespaceURI === null) {
                if (oldval !== null) delId(oldval, attr.ownerElement);
                addId(attr.value, attr.ownerElement);
            }
            
            // XXX Send a mutation event
        }),

        // Invoked when a new attribute is added to an element
        mutateAddAttr: constant(function(attr) { // Add a new attribute
            this.mutateAttr(attr, null);
        }),

        // Used by removeAttribute and removeAttributeNS for attributes.
        mutateRemoveAttr: constant(function(attr) {
            // Manage id to element mapping 
            if (attr.localName === "id" && attr.namespaceURI === null) {
                delId(attr.value, attr.ownerElement);
            }

            // XXX send mutation event
        }),

        // Called by Node.removeChild, etc. to remove a rooted element from
        // the tree. Only needs to generate a single mutation event when a 
        // node is removed, but must recursively mark all descendants as not
        // rooted.
        mutateRemove: constant(function(node) {
            // Mark this and all descendants as not rooted
            recursivelyUproot(node);

            // XXX Send a single mutation event
        }),

        // Called when a new element becomes rooted.  It must recursively
        // generate mutation events for each of the children, and mark them all
        // as rooted.
        mutateInsert: constant(function(node) {
            root(node);

            // XXX send the mutation event

            // And now recurse on all kids 
            let kids = node.childNodes;
            for(let i = 0, n = kids.length; i < n; i++)
                this.mutateInsert(kids[i]);
        }),

        // Called when a rooted element is moved within the document
        mutateMove: constant(function(node) {
        }),
        
    });

    function root(n) {
        n.root = n.ownerDocument;
        // Manage id to element mapping 
        if (n.nodeType === ELEMENT_NODE) {
            let id = n.getAttribute("id");
            if (id) addId(id, n);
        }
    }

    function uproot(n) {
        // Manage id to element mapping 
        if (n.nodeType === ELEMENT_NODE) {
            let id = n.getAttribute("id");
            if (id) delId(id, n);
        }
        delete n.root;
    }
    let recursivelyUproot = recursive(uproot);

    // Add a mapping from  id to n for n.ownerDocument
    function addId(id, n) {
        let doc = n.ownerDocument, map = doc.byId, val = map[id];
        if (!val) {
            map[id] = n;
        }
        else {
            warn("Duplicate element id " + id);
            if (!isArray(val)) {
                val = [val];
                map[id] = val;
            }
            val.push(n);
            sort(val, documentOrder);
        }
    }

    // Delete the mapping from id to n for n.ownerDocument
    function delId(id, n) {
        let doc = n.ownerDocument, map = doc.byId, val = map[id];
        assert(val);

        if (isArray(val)) {
            let idx = A.indexOf(val, n);
            splice(val, idx, 1);

            if (val.length == 1) { // convert back to a single node
                map[id] = val[0];
            }
        }
        else {
            delete map[id];
        }
    }

    function recursivelySetOwner(node, owner) {
        node.ownerDocument = owner;
        delete node._lastModified; // mod times are document-based
        let kids = node.childNodes;
        for(let i = 0, n = kids.length; i < n; i++)
            recursivelySetOwner(kids[i], owner);
    }


    // These function return predicates for filtering elements.
    // They're used by the Document and Element classes for methods like
    // getElementsByTagName and getElementsByClassName

    function localNameElementFilter(lname) {
        return function(e) { return e.localName === lname; };
    }

    function htmlLocalNameElementFilter(lname) {
        let lclname = toLowerCase(lname);
        if (lclname === lname)
            return localNameElementFilter(lname);

        return function(e) {
            return e.isHTML
                ? e.localName === lclname
                : e.localName === lname;
        };
    }

    function namespaceElementFilter(ns) {
        return function(e) { return e.namespaceURI === ns; };
    }

    function namespaceLocalNameElementFilter(ns, lname) {
        return function(e) {
            return e.namespaceURI === ns && e.localName === lname;
        };
    }

    // XXX
    // Optimize this when I implement classList.
    function classNamesElementFilter(names) {
        return function(e) {
            let classAttr = e.getAttribute("class");
            if (!classAttr) return false;
            let classes = classAttr.trim().split(/\s+/);
            return every(names, function(n) {
                return A.indexOf(classes, n) !== -1;
            })
        }
    }


    return Document;
});



/************************************************************************
 *  src/impl/DocumentFragment.js
 ************************************************************************/

//@line 1 "src/impl/DocumentFragment.js"
defineLazyProperty(impl, "DocumentFragment", function() {
    function DocumentFragment(doc) {
        this.ownerDocument = doc;
        this.childNodes = [];
    }

    DocumentFragment.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(DOCUMENT_FRAGMENT_NODE),
        nodeName: constant("#document-fragment"),
        nodeValue: attribute(fnull, fnoop),
    });

    return DocumentFragment;
});


/************************************************************************
 *  src/impl/DocumentType.js
 ************************************************************************/

//@line 1 "src/impl/DocumentType.js"
defineLazyProperty(impl, "DocumentType", function() {
    function DocumentType(name, publicId, systemId) {
        // Unlike other nodes, doctype nodes always start off unowned
        // until inserted
        this.ownerDocument = null;
        this.name = name;  
        this.publicId = publicId || "";
        this.systemId = systemId || "";
    }

    DocumentType.prototype = Object.create(impl.Leaf.prototype, {
        nodeType: constant(DOCUMENT_TYPE_NODE),
        nodeName: attribute(function() { return this.name; }),
        nodeValue: attribute(fnull, fnoop),
    });

    return DocumentType;
});


/************************************************************************
 *  src/impl/DOMImplementation.js
 ************************************************************************/

//@line 1 "src/impl/DOMImplementation.js"
defineLazyProperty(impl, "DOMImplementation", function() {
    // Each document must have its own instance of the domimplementation object
    // Even though these objects have no state
    function DOMImplementation() {};

    DOMImplementation.prototype = {

        // XXX Since hasFeature is pretty strongly deprecated, can we
        // get away with always just returning false?
        hasFeature: function hasFeature(feature, version) {
            // Warning text directly modified slightly from the DOM Core spec:
            warn("Authors are strongly discouraged from using hasFeature(), " +
                 "as it is notoriously unreliable and imprecise. " +
                 "Use explicit feature testing instead.");
            return false;
        },
        
        createDocumentType: function createDocumentType(qualifiedName,
                                                        publicId, systemId) {
            return new impl.DocumentType(qualifiedName, publicId, systemId);
        },

        createDocument: function createDocument(namespace,
                                                qualifiedName, doctype) {
            // XXX
            // Currently the DOM core spec indicates that this method never
            // creates an HTML document, even if namespace and doctype are
            // properly set.  I've asked for clarification.
            let d = new impl.Document(false), e;
            
            if (qualifiedName) 
                e = d.createElementNS(namespace, qualifiedName);
            else
                e = null;

            if (doctype) {
                if (doctype.ownerDocument) WrongDocumentError();
                d.appendChild(doctype);
            }

            if (e) d.appendChild(e);

            return d;
        },

        createHTMLDocument: function createHTMLDocument(titleText) {
            let d = new impl.Document(true);
            d.appendChild(new impl.DocumentType("html"));
            let html = d.createElement("html");
            d.appendChild(html);
            let head = d.createElement("head");
            html.appendChild(head);
            let title = d.createElement("title");
            head.appendChild(title);
            title.appendChild(d.createTextNode(titleText));
            html.appendChild(d.createElement("body"));
            return d;
        }
    };

    return DOMImplementation;
});


/************************************************************************
 *  src/impl/FilteredElementList.js
 ************************************************************************/

//@line 1 "src/impl/FilteredElementList.js"
//
// This file defines node list implementation that lazily traverses
// the document tree (or a subtree rooted at any element) and includes
// only those elements for which a specified filter function returns true.
// It is used to implement the
// {Document,Element}.getElementsBy{TagName,ClassName}{,NS} methods.
//
defineLazyProperty(impl, "FilteredElementList", function() {
    function FilteredElementList(root, filter) {
        this.root = root;
        this.filter = filter;
        this.lastModified = root.lastModified
        this.done = false;
        this.cache = [];
    }

    FilteredElementList.prototype = {
        get length() { 
            this.checkcache();
            if (!this.done) this.traverse();
            return this.cache.length;
        },

        item: function(n) {
            this.checkcache();
            if (!this.done && n >= this.cache.length)
                this.traverse(n);
            return this.cache[n];
        },

        checkcache: function() {
            if (this.lastModified !== this.root.lastModified) {
                // subtree has changed, so invalidate cache
                this.cache.length = 0;
                this.done = false;
                this.lastModified = this.root.lastModified;
            }
        },

        // If n is specified, then traverse the tree until we've found the nth
        // item (or until we've found all items).  If n is not specified, 
        // traverse until we've found all items.
        traverse: function(n) {
            // increment n so we can compare to length, and so it is never falsy
            if (n !== undefined) n++;  

            let elt;
            while(elt = this.next()) {
                push(this.cache, elt);
                if (n && this.cache.length === n) return;
            }
            
            // no next element, so we've found everything
            this.done = true;
        },

        // Return the next element under root that matches filter
        next: function() {
            let start = (this.cache.length == 0)    // Start at the root or at
                ? this.root                         // the last element we found
                : this.cache[this.cache.length-1];

            let elt;
            if (start.nodeType === DOCUMENT_NODE)
                elt = start.documentElement;
            else
                elt = start.nextElement(this.root);

            while(elt) {
                if (this.filter(elt)) {
                    return elt;
                }

                elt = elt.nextElement(this.root);
            }
            return null;
        }
    };

    return FilteredElementList;
});


/************************************************************************
 *  src/main.js
 ************************************************************************/

//@line 1 "src/main.js"
// The document object is the entry point to the entire DOM
defineLazyProperty(global, "document", function() {
    return wrap(new impl.DOMImplementation().createHTMLDocument(""),
               idl.Document);
});
}(this));
