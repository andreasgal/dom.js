
assert(DOMImplementation);

assert(document.implementation.hasFeature("HTML", "1.0"));
assert(document.implementation.hasFeature("HTML", "2.0"));
assert(document.implementation.hasFeature("XHTML", "1.0"));
assert(document.implementation.hasFeature("XHTML", "2.0"));

assert(document.compatMode === 'CSS1Compat', document.compatMode);

assert(document.doctype);

assert(
    document.implementation.toString() === "[object DOMImplementation]",
    document.implementation.toString());

