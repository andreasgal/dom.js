defineLazyProperty(impl, "DOMImplementation", function() {
    // Each document must have its own instance of the domimplementation object
    // Even though these objects have no state
    function DOMImplementation() {};

    DOMImplementation.prototype = {

	// XXX Since hasFeature is pretty strongly deprecated, can we
	// get away with always just returning false?
	hasFeature: function hasFeature(feature, version) {
	    // Warning text directly modified slightly from the DOM Core spec:
	    warn("Authors are strongly discouraged from using hasFeature(), " +
		 "as it is notoriously unreliable and imprecise. " +
		 "Use explicit feature testing instead.");
	    return false;
	},
	
	createDocumentType: function createDocumentType(qualifiedName,
							publicId, systemId) {
	    return new impl.DocumentType(qualifiedName, publicId, systemId);
	},

	createDocument: function createDocument(namespace,
						qualifiedName, doctype) {
	    // XXX
	    // Currently the DOM core spec indicates that this method never
	    // creates an HTML document, even if namespace and doctype are
	    // properly set.  I've asked for clarification.
	    let d = new impl.Document(false), e;
	    
	    if (qualifiedName) 
		e = d.createElementNS(namespace, qualifiedName);
	    else
		e = null;

	    if (doctype) {
		if (doctype.ownerDocument) WrongDocumentError();
		d.appendChild(doctype);
	    }

	    if (e) d.appendChild(e);

	    return d;
	},

	createHTMLDocument: function createHTMLDocument(titleText) {
	    let d = new impl.Document(true);
	    d.appendChild(new impl.DocumentType("html"));
	    let html = d.createElement("html");
	    d.appendChild(html);
	    let head = d.createElement("head");
	    html.appendChild(head);
	    let title = d.createElement("title");
	    head.appendChild(title);
	    title.appendChild(d.createTextNode(titleText));
	    html.appendChild(d.createElement("body"));
	    return d;
	}
    };

    return DOMImplementation;
});