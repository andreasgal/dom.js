// boot.js: 
// The global entry point to the DOM is the global 'document' property.
// This file defines it lazily. If a script ever uses it, the DOM "boots up"
// creating the default HTML document the Document, Element, Node and other
// interfaces.
defineLazyProperty(global, "document", function() {
    return wrap(DOM.implementation.createHTMLDocument(""));
});

defineLazyProperty(DOM, "implementation", function() {
    return new domimplementation();
});