// As a testing measure, monkeypatch all the builtin constructors,
// functions and methods to issue a warning if I actually use any of them.
// See also ../src/snapshot.js.
// This code is designed to run outside the big function that encloses
// the rest of dom.js.
(function(global) {
    global.monkey_patch_warnings = false;  // Set this to turn on warnings

    const
        String = global.String,
        Error = global.Error,
        split = String.split,
        substring = String.substring,
        indexOf = String.indexOf,
        match = String.match,
	getOwnPropNames = Object.getOwnPropertyNames,
        foreach = Array.forEach,
	fpCall = Function.prototype.call,
	fpApply = Function.prototype.apply,
	apply = fpCall.bind(fpApply);

    function warn(n) {
	if (!global.monkey_patch_warnings) return;
	let debug = console.log || global.print;

	// Get the filename and line number from the stack
	let where = split(new Error().stack, '\n')[2], 
     	    parts = match(where, /^([^@]*)@(.*):(\d*)$/),
	    filename = parts[2], linenumber = parts[3];

	// Don't issue warnings if the call came direct from the console
	// Or from other files that we don't want to test
	if (filename === "typein") return;
	if (indexOf(filename, "test/harness.js") !== -1) return;

	debug("WARNING: Interceptable call to " + n + "() from " +
	      filename + ":" + linenumber);
    }

    function monkeypatch(name) {
	let o = eval(name);

	// For each of the properties in o
	foreach(getOwnPropNames(o), function(prop) {
	    let val = o[prop];
	    if (typeof val !== "function") return;
	    if (prop === "toSource") return; // Don't mess up console
	    if (prop === "valueOf") return;  // Or the Web Console
	    if (substring(prop, 0, 2) == "__") return;
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

