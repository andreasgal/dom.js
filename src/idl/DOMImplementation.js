defineLazyProperty(global, "DOMImplementation", function() {
    return idl.DOMImplementation.publicInterface;
}, true);

defineLazyProperty(idl, "DOMImplementation", function() {
    return implementIDLInterface({
        name: "DOMImplementation",
        members: {
            //  boolean hasFeature(DOMString feature,
            //                     [TreatNullAs=EmptyString] DOMString version);
            hasFeature: function hasFeature(feature, version) {
                return unwrap(this).hasFeature(feature, version);
            },
            
            //  DocumentType createDocumentType(
            //             [TreatNullAs=EmptyString] DOMString qualifiedName,
            //             DOMString publicId, DOMString systemId);
            createDocumentType: function createDocumentType(qname,
                                                            publicid,
                                                            systemid) {
                return wrap(unwrap(this).createDocumentType(qname,
                                                            publicid,
                                                            systemid));
            },

            //  Document createDocument(
            //             [TreatNullAs=EmptyString] DOMString namespace,
            //             [TreatNullAs=EmptyString] DOMString qualifiedName,
            //             DocumentType? doctype);
            createDocument: function createDocument(ns, qname, doctype){
                return wrap(unwrap(this).createDocument(ns, qname, doctype));
            },

            // Document createHTMLDocument(DOMString title);        
            //
            // The createHTMLDocument(title) method, when invoked,
            // must run the following steps:
            //
            // Let doc be a newly created Document object.
            //
            // Mark doc as being an HTML document.
            //
            // Create a new DocumentType, with "html" as its name and
            // with its ownerDocument set to doc. Append the newly
            // created node to doc.
            //
            // Create an html element in the HTML namespace, and
            // append it to doc.
            //
            // Create a head element in the HTML namespace, and append
            // it to the html element created in the previous step.
            //
            // Create a title element in the HTML namespace, and
            // append it to the head element created in the previous
            // step.
            //
            // Create a Text node, and set its data attribute to the
            // string given by the method's argument (which could be
            // the empty string). Append it to the title element
            // created in the previous step.
            //
            // Create a body element in the HTML namespace, and append
            // it to the html element created in the earlier step.
            //
            // Return doc.
            createHTMLDocument: function createHTMLDocument(title) {
                return wrap(unwrap(this).createHTMLDocument(title));
            },
        }
    });
});
