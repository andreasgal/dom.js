// This file holds any dom.js code that won't work in strict mode

//
// This is a simple class used in src/impl/HTMLEvent.js and elsewhere for
// converting an HTML event handler content attribute into a function with
// a special scope chain.  It uses with, so it can't be in strict mode.
//
// This is a class with a build() method instead of a simple function because
// inside of with statements it is hard to refer to the function arguments.
// By using this class-based design, I can refer to them as properties of this.
// 
// The body argument is a string of js code that becomes the body of the
// event handler function.
// 
// The document, form, and element arguments to the constructor must be
// wrapper objects, not impl objects.  Note that we can't call wrap from
// this file, so they must be passed in wrapped.
// 

function EventHandlerBuilder(body, document, form, element) {
    this.body = body;
    this.document = document;
    this.form = form;
    this.element = element;
}

EventHandlerBuilder.prototype.build = function build() {
    with(this.document)
        with(this.form)
            with(this.element)
                return eval("(function(event){" + this.body + "})");
};

// Define this here so it is not in strict mode
// Because strict mode eval can't define variables.
function evalScript(s) {
    var geval = eval; // Do an indirect eval to get global context
    s = 'try{' +
        s +
        '}catch(e){var msg="exception while evaling script:\\n\\t" + e.message + "\\n" + e.stack; console.log(msg); throw Error(msg);}';

    geval(s);
}