// The document object is the entry point to the entire DOM
defineLazyProperty(global, "document", function() {
    return wrap(new impl.DOMImplementation().createHTMLDocument(""),
               idl.Document);
});

global.HTMLParser = HTMLParser;