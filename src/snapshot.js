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

function shallow_frozen_copy(o) {
    var r = {};
    Object.getOwnPropertyNames(o).forEach(function(n) {
        Object.defineProperty(r, n, Object.getOwnPropertyDescriptor(o, n));
    });
    return Object.freeze(r);
}

const undefined = void 0,

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
    WeakMap = global.WeakMap;


// callbind parameterizes the binding of `this`
// [].map(callback) -> map([], callback)
const callbind = Function.prototype.call.bind.bind(Function.prototype.call);


// String and array generics are not defined in Node, so define them now
// if needed
if (!String.indexOf) {
    Object.getOwnPropertyNames(String.prototype).forEach(function(m) {
        if (typeof String.prototype[m] !== "function") return;
        if (m === "length" || m === "constructor") return;
        String[m] = callbind(String.prototype[m]);
    });
}

if (!Array.forEach) {
    Object.getOwnPropertyNames(Array.prototype).forEach(function(m) {
        if (typeof Array.prototype[m] !== "function") return;
        if (m === "length" || m === "constructor") return;
        Array[m] = callbind(Array.prototype[m]);
    });
}


const
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
    // We also want to make a snapshot of the static methods of Object, Array,
    // and String. (Firefox defines useful "Array generics" and "String
    // generics" that are quite helpful to us).  Since we've already bound
    // the names Object, Array, and String, we use O, A, and S as shorthand
    // notation for these frequently-accessed sets of methods.
    JSON = shallow_frozen_copy(global.JSON),
    Math = shallow_frozen_copy(global.Math),
    Proxy = shallow_frozen_copy(global.Proxy),
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
    call = callbind(Function.prototype.call),
    // apply(f, o, [args])
    apply = callbind(Function.prototype.apply),
    // bind(f, o)
    bind = callbind(Function.prototype.bind),

    // WeakMap functions
    wmget = callbind(WeakMap.prototype.get),
    wmset = callbind(WeakMap.prototype.set),

    // Object functions
    hasOwnProperty = callbind(Object.prototype.hasOwnProperty),

    // Array functions are all defined as generics like A.pop, but its
    // convenient to give the most commonly-used ones unqualified
    // names.  The less-commonly used functions (and those that have
    // name collisions like indexOf, lastIndexOf and slice) can be
    // accessed on the A or S objects.
    concat = A.concat || callbind(Array.prototype.concat),
    every = A.every || callbind(Array.prototype.every),
    // Note lowercase e
    foreach = A.forEach || callbind(Array.prototype.forEach),
    isArray = A.isArray || callbind(Array.prototype.isArray),
    join = A.join || callbind(Array.prototype.join),
    map = A.map || callbind(Array.prototype.map),
    push = A.push || callbind(Array.prototype.push),
    pop = A.pop || callbind(Array.prototype.pop),
    unshift = A.unshift || callbind(Array.prototype.unshift),
    reduce = A.reduce || callbind(Array.prototype.reduce),
    sort = A.sort || callbind(Array.prototype.sort),
    filter = A.filter || callbind(Array.prototype.filter),
    splice = A.splice || callbind(Array.prototype.splice),

    // Ditto for the String generic functions
    fromCharCode = S.fromCharCode || callbind(String.prototype.fromCharCode),
    match = S.match || callbind(String.prototype.match),
    replace = S.replace || callbind(String.prototype.replace),
    search = S.search || callbind(String.prototype.search),
    split = S.split || callbind(String.prototype.split),
    substring = S.substring || callbind(String.prototype.substring),
    toLowerCase = S.toLowerCase || callbind(String.prototype.toLowerCase),
    toUpperCase = S.toUpperCase || callbind(String.prototype.toUpperCase),
    trim = S.trim || callbind(String.prototype.trim),

    // One more array-related function
    pushAll = Function.prototype.apply.bind(Array.prototype.push),

    // RegExp functions, too
    exec = callbind(RegExp.prototype.exec),
    test = callbind(RegExp.prototype.test)

    ;

// These are all unique and have their uses, particularly for formatting.
// Also, only when accessing directly from primitive wrapper (string/number) is
// the native version assured to be used.
const toString = Object.freeze({
    // `[].join(',')`
    Array: callbind(Array.prototype.toString),
    // 'true' or 'false'
    Boolean: callbind(Boolean.prototype.toString),
    // "Sat Dec 10 2011 23:40:56 GMT-0500 (US Eastern Standard Time)"
    Date: callbind(Date.prototype.toString),
    // Works generically, `e.name + ' ' + e.message`
    Error: callbind(Error.prototype.toString),
    // unmodified source in V8, normalized in spidermonkey
    Function: callbind(Function.prototype.toString),
    // Works generically, '[object InternalClass]'
    Object: callbind(Object.prototype.toString),
    // input must be number, has optional radix parameter
    Number: callbind(Number.prototype.toString),
    // RegExp('^\s+', 'g').toString() -> '/\s+/g'
    RegExp: callbind(RegExp.prototype.toString),
    // input must be string
    String: callbind(String.prototype.toString)
});