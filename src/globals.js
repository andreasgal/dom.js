// These constants and variables aren't really globals.  They're all within
// the closure added by the Makefile, so they don't affect the global
// environment.  But they are visible everywhere within dom.js

// Namespaces
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink"

// Anything I want to define lazily using defineLazyProperty above has
// to be a property of something; it can't just be a local variable.
// So these objects are holders for lazy properties.  
const impl = {}; // implementation construtors defined here
const idl = {};  // interface constructors defined here


