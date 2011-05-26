// As a testing measure, monkeypatch all the builtin constructors,
// functions and methods to issue a warning if I actually use any of them.
// See also snapshot.js.
// This code is designed to run outside the big function that encloses
// the rest of dom.js.
(function(global) {
    global.debug = true;  // Unset this to turn off annoying warning

    const
        Error = global.Error,
        split = String.split,
        substring = String.substring,
	getOwnPropNames = Object.getOwnPropertyNames,
        foreach = Array.forEach,
	fpCall = Function.prototype.call,
	fpApply = Function.prototype.apply,
	apply = fpCall.bind(fpApply);

    function warn(n) {
	if (!global.debug) return;
	let debug = global.print || console.log;
	let where = split(new Error().stack, '\n')[2];

	// Don't issue warnings if the call came direct from the console
	// We still get warnings from indirect ones
	if (substring(where, 0, 7) === "@typein") return;


	debug("WARNING: Interceptable call to " + n + "() from " + where);
    }

    function monkeypatch(name) {
	let o = eval(name);

	// For each of the properties in o
	foreach(getOwnPropNames(o), function(prop) {
	    let val = o[prop];
	    if (typeof val !== "function") return;
	    if (prop === "toSource") return; // Don't mess up console
	    // monkey patch the method to issue a warning
	    o[prop] = function() {
		warn(name + "." + prop);
		return apply(val, this, arguments);
	    }
	});
    }
    
    // Monkeypatch all the static functions and instance methods defined
    // on the following objects
    foreach([
	"Array", "Boolean", "Date", "Error", "Function",
	"Number", "Object", "RangeError", "RegExp", "String",
	"TypeError", "WeakMap", "JSON", "Math", "Proxy", 
	"Array.prototype", "Date.prototype", "Function.prototype",
	"Number.prototype", "Object.prototype", "RegExp.prototype",
	"String.prototype", "WeakMap.prototype"
    ], monkeypatch);

    // XXX For complete evilness, we should also patch global
    // functions like parseInt and isNaN, and even patch 
    // global constructors like Array() and String().
	    
}(this));

