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
 */
function snapshot(o) {
    let r = {};
    Object.getOwnPropertyNames(o).forEach(function(n) {
	Object.defineProperty(r, n, Object.getOwnPropertyDescriptor(o, n));
    });
    return r;
}

// XXX
// For now, we just snapshot everything that seems like it might be
// important. Later, we might come back and optimize this to just take
// copies of the stuff we actually use.
let O = snapshot(Object), Op = snapshot(Object.prototype);
let A = snapshot(Array), Ap = snapshot(Array.prototype);
let S = snapshot(String), Sp = snapshot(String.prototype);
let Fp = snapshot(Function.prototype);
let Rp = snapshot(RegExp.prototype);

// Some function primitives
let call = Fp.call.bind(Fp.call);   // call(f, o, args...)
let apply = Fp.call.bind(Fp.apply); // apply(f, o, [args])
let bind = Fp.call.bind(Fp.bind);   // bind(f, o)

// Array generics I'm likely to use a lot
let foreach = A.forEach, map = A.map;
let push = A.push, pop = A.pop;


// As a testing measure, monkeypatch all the builtin methods to issue
// a warning if I actually use any of them.
let global = this;
let debug = global.print || console.log;
function patch(names) {  // patch all the own methods of the named objects
    for(let i = 0; i < arguments.length; i++) {
	let name = arguments[i], o = eval(name);
	foreach(O.getOwnPropertyNames(o), function(n) {
	    let val = o[n];
	    if (typeof val !== "function") return;
	    o[n] = function() {
		debug("Interceptable call to " + name + "." + n + "()");
		return apply(val, this, arguments);
	    }
	});
    }
}
    
patch("Object", "Object.prototype", "Array", "Array.prototype", 
      "String", "String.prototype", "Function", "Function.prototype",
      "RegExp", "RegExp.prototype", "Date", "Date.prototype",
      "Number", "Number.prototype", "Error", "Error.prototype",
      "Math", "JSON");
