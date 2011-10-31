// The document object is the entry point to the entire DOM
defineLazyProperty(global, "document", function() {
    var doc = new impl.DOMImplementation().createHTMLDocument("");
    doc._scripting_enabled = true;
    return wrap(doc);
});
