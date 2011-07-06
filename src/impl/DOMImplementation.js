defineLazyProperty(impl, "DOMImplementation", function() {
    // Each document must have its own instance of the domimplementation object
    // Even though these objects have no state
    function DOMImplementation() {};


    // Feature/version pairs that DOMImplementation.hasFeature() returns
    // true for.  It returns false for anything else.
    const supportedFeatures = {
        "xml": { "": true, "1.0": true, "2.0": true },   // DOM Core 
        "core": { "": true, "2.0": true },               // DOM Core
        "html": { "": true, "1.0": true, "2.0": true} ,  // HTML
        "xhtml": { "": true, "1.0": true, "2.0": true} , // HTML
    };

    DOMImplementation.prototype = {
        hasFeature: function hasFeature(feature, version) {
            // Warning text directly modified slightly from the DOM Core spec:
            warn("Authors are strongly discouraged from using " +
                 "DOMImplementation.hasFeature(), as it is notoriously " +
                 "unreliable and imprecise. " +
                 "Use explicit feature testing instead.");

            let f = supportedFeatures[feature.toLowerCase()];

            return (f && f[version]) || false;
        },
        

        createDocumentType: function createDocumentType(qualifiedName,
                                                        publicId, systemId) {
            // XXX
            // Awaiting resolution of this:
            // http://lists.w3.org/Archives/Public/www-dom/2011JulSep/0015.html
            //
            if (!isValidName(qualifiedName)) InvalidCharacterError();
            if (!isValidQName(qualifiedName)) NamespaceError();

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