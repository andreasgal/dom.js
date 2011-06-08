defineLazyProperty(impl, "Document", function() {

    function Document(isHTML) {
        this.isHTML = isHTML;
        this.documentURI = null;    // XXX what should this be?
        this.implementation = new impl.DOMImplementation();

        // These will be initialized by our custom versions of
        // appendChild and insertBefore that override the inherited
        // Node methods.
        // XXX: override those methods!
        this.doctype = null;
        this.documentElement = null;
        this.childNodes = [];

        // Documents are always rooted, by definition
        this.root = this;

        // This maintains the mapping from element ids to element nodes.
        // We may need to update this mapping every time a node is rooted
        // or uprooted, and any time an attribute is added, removed or changed
        // on a rooted element.
        this.byId = Object.create(null); // inherit nothing
    }

    Document.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        compatMode: constant("CSS1Compat"),
        ownerDocument: constant(null),
        parentNode: constant(null),

        createTextNode: constant(function(data) {
            return new impl.Text(this, data);
        }),
        createComment: constant(function(data) {
            return new impl.Comment(this, data);
        }),
        createDocumentFragment: constant(function() {
            return new impl.DocumentFragment(this);
        }),
        createProcessingInstruction: constant(function(target, data) {
            return new impl.ProcessingInstruction(this, target, data);
        }),

        createElement: constant(function(localName) {
            if (!isValidName(localName)) InvalidCharacterError();

            if (this.isHTML)
                localName = toLowerCase(localName);

            return new impl.Element(this, localName, HTML_NAMESPACE, null);
        }),

        createElementNS: constant(function(namespace, qualifiedName) {
            if (!isValidName(qualifiedName)) InvalidCharacterError();
            if (!isValidQName(qualifiedName)) NamespaceError();
            
            let pos, prefix, localName;
            if ((pos = S.indexOf(qualifiedName, ":")) !== -1) {
                prefix = substring(qualifiedName, 0, pos);
                localName = substring(qualifiedName, pos+1);

                if (namespace === "" ||
                    (prefix === "xml" && namespace !== XML_NAMESPACE))
                    NamespaceError();
            }
            else {
                prefix = null;
                localName = qualifiedName;
            }

            if (((qualifiedName === "xmlns" || prefix === "xmlns") &&
                 namespace !== XMLNS_NAMESPACE) ||
                (namespace === XMLNS_NAMESPACE && 
                 qualifiedName !== "xmlns" &&
                 prefix !== "xmlns"))
                NamespaceError();

            return new impl.Element(this, localName, namespace, prefix);
        }),

        getElementById: constant(function(id) {
            let n = this.byId[id];
            if (!n) return null;
            if (isArray(n)) { // there was more than one element with this id
                return n[0];  // array is sorted in document order
            }
            return n;
        }),


        adoptNode: constant(function(node) {
            if (node.nodeType === DOCUMENT_NODE ||
                node.nodeType === DOCUMENT_TYPE_NODE) NotSupportedError();

            if (node.parentNode) node.parentNode.removeChild(node)

            recursivelySetOwner(node, this);

            return node;
        }),


        // Implementation-specific function.  Called when a text, comment, 
        // or pi value changes.
        mutateValue: constant(function(node) {
        }),

        // Invoked when an attribute's value changes. Attr holds the new
        // value.  oldval is the old value.  Attribute mutations can also
        // involve changes to the prefix (and therefore the qualified name)
        mutateAttr: constant(function(attr, oldval) {
            if (attr.localName === "id" && attr.namespaceURI === null) {
                if (oldval !== null) delId(oldval, attr.ownerElement);
                addId(attr.value, attr.ownerElement);
            }
            
            // XXX Send a mutation event
        }),

        // Invoked when a new attribute is added to an element
        mutateAddAttr: constant(function(attr) { // Add a new attribute
            this.mutateAttr(attr, null);
        }),

        // Used by removeAttribute and removeAttributeNS for attributes.
        mutateRemoveAttr: constant(function(attr) {
            // Manage id to element mapping 
            if (attr.localName === "id" && attr.namespaceURI === null) {
                delId(attr.value, attr.ownerElement);
            }

            // XXX send mutation event
        }),

        // Called by Node.removeChild, etc. to remove a rooted element from
        // the tree. Only needs to generate a single mutation event when a 
        // node is removed, but must recursively mark all descendants as not
        // rooted.
        mutateRemove: constant(function(node) {
            // Mark this and all descendants as not rooted
            recursivelyUproot(node);

            // XXX Send a single mutation event
        }),

        // Called when a new element becomes rooted.  It must recursively
        // generate mutation events for each of the children, and mark them all
        // as rooted.
        mutateInsert: constant(function(node) {
            root(node);

            // XXX send the mutation event

            // And now recurse on all kids 
            let kids = node.childNodes;
            for(let i = 0, n = kids.length; i < n; i++)
                this.mutateInsert(kids[i]);
        }),

        // Called when a rooted element is moved within the document
        mutateMove: constant(function(node) {
        }),
        
    });

    function root(n) {
        n.root = n.ownerDocument;
        // Manage id to element mapping 
        if (n.nodeType === ELEMENT_NODE) {
            let id = n.getAttribute("id");
            if (id) addId(id, n);
        }
    }

    function uproot(n) {
        // Manage id to element mapping 
        if (n.nodeType === ELEMENT_NODE) {
            let id = n.getAttribute("id");
            if (id) delId(id, n);
        }
        delete n.root;
    }
    let recursivelyUproot = recursive(uproot);

    // Add a mapping from  id to n for n.ownerDocument
    function addId(id, n) {
        let doc = n.ownerDocument, map = doc.byId, val = map[id];
        if (!val) {
            map[id] = n;
        }
        else {
            warn("Duplicate element id " + id);
            if (!isArray(val)) {
                val = [val];
                map[id] = val;
            }
            val.push(n);
            sort(val, documentOrder);
        }
    }

    // Delete the mapping from id to n for n.ownerDocument
    function delId(id, n) {
        let doc = n.ownerDocument, map = doc.byId, val = map[id];
        assert(val);

        if (isArray(val)) {
            let idx = A.indexOf(val, n);
            splice(val, idx, 1);

            if (val.length == 1) { // convert back to a single node
                map[id] = val[0];
            }
        }
        else {
            delete map[id];
        }
    }

    function recursivelySetOwner(node, owner) {
        node.ownerDocument = owner;
        let kids = node.childNodes;
        for(let i = 0, n = kids.length; i < n; i++)
            recursivelySetOwner(kids[i], owner);
    }

    return Document;
});