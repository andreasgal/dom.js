defineLazyProperty(impl, "Document", function() {

    function Document(isHTML) {
        this.isHTML = isHTML;
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

        // This property holds a monotonically increasing value akin to 
        // a timestamp used to record the last modification time of nodes
        // and their subtrees. See the lastModified attribute and modify()
        // method of the Node class.  And see FilteredElementList for an example
        // of the use of lastModified
        this.modclock = 0;
    }

    Document.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        // XXX: DOMCore may remove documentURI, so it is NYI for now
        documentURI: attribute(nyi, nyi),
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
            if (this.isHTML) NotSupportedError();
            if (!isValidName(target) || S.indexOf(data, "?>") !== -1)
                InvalidCharacterError();
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

        // Add some (surprisingly complex) document hierarchy validity
        // checks when adding, removing and replacing nodes into a
        // document object, and also maintain the documentElement and
        // doctype properties of the document.  Each of the following
        // 4 methods chains to the Node implementation of the method
        // to do the actual inserting, removal or replacement.

        appendChild: constant(function(child) {
            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                if (this.documentElement) // We already have a root element
                    HierarchyRequestError();

                this.documentElement = child;
            }
            if (child.nodeType === DOCUMENT_TYPE_NODE) {
                if (this.doctype ||        // Already have one
                    this.documentElement)   // Or out-of-order
                    HierarchyRequestError()

                this.doctype = child;
            }

            // Now chain to our superclass
            return impl.Node.prototype.appendChild.call(this, child);
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
            if (refChild.parentNode !== this) NotFoundError();
            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                // If we already have a root element or if we're trying to
                // insert it before the doctype
                if (this.documentElement ||
                    (this.doctype && this.doctype.index >= refChild.index))
                    HierarchyRequestError();

                this.documentElement = child;
            }
            if (child.nodeType === DOCUMENT_TYPE_NODE) {
                if (this.doctype ||        
                    (this.documentElement &&
                     refChild.index >= this.documentElement.index))
                    HierarchyRequestError()

                this.doctype = child;
            }
            return impl.Node.prototype.insertBefore.call(this, child, refChild);
        }),        

        replaceChild: constant(function replaceChild(child, oldChild) {
            if (oldChild.parentNode !== this) NotFoundError();

            if (child.nodeType === TEXT_NODE) HierarchyRequestError();
            if (child.nodeType === ELEMENT_NODE) {
                // If we already have a root element and we're not replacing it
                if (this.documentElement && this.documentElement !== oldChild)
                    HierarchyRequestError();
                // Or if we're trying to put the element before the doctype
                // (replacing the doctype is okay)
                if (this.doctype && oldChild.index < this.doctype.index)
                    HierarchyRequestError();

                this.documentElement = child;
                if (oldChild === this.doctype) this.doctype = null;
            }
            else if (child.nodeType === DOCUMENT_TYPE_NODE) {
                // If we already have a doctype and we're not replacing it
                if (this.doctype && oldChild !== this.doctype)
                    HierarchyRequestError();
                // If we have a docuemnt element and the old child
                // comes after it
                if (this.documentElement &&
                    oldChild.index > this.documentElement.index)
                    HierarchyRequestError();

                this.doctype = child;
                if (oldChild === this.documentElement)
                    this.documentElement = null;
            }
            else {
                if (oldChild === this.documentElement)
                    this.documentElement = null;
                else if (oldChild === this.doctype)
                    this.doctype = null;
            }
            return impl.Node.prototype.replaceChild.call(this, child, oldChild);
        }),

        removeChild: constant(function removeChild(child) {
            if (child.nodeType === DOCUMENT_TYPE_NODE)
                this.doctype = null;
            else if (child.nodeType === ELEMENT_NODE)
                this.documentElement = null;

            // Now chain to our superclass
            return impl.Node.prototype.removeChild.call(this, child);
        }),

        getElementById: constant(function(id) {
            let n = this.byId[id];
            if (!n) return null;
            if (isArray(n)) { // there was more than one element with this id
                return n[0];  // array is sorted in document order
            }
            return n;
        }),


        // XXX: 
        // Tests are currently failing for this function.
        // Awaiting resolution of:
        // http://lists.w3.org/Archives/Public/www-dom/2011JulSep/0016.html
        getElementsByTagName: constant(function getElementsByTagName(lname) {
            let filter;
            if (lname === "*")
                filter = ftrue;
            else if (this.doc.isHTML) 
                filter = htmlLocalNameElementFilter(lname);
            else 
                filter = localNameElementFilter(lname);

            return new impl.FilteredElementList(this, filter);
        }),

        getElementsByTagNameNS: constant(function getElementsByTagNameNS(ns,
                                                                         lname){
            let filter;
            if (ns === "*" && lname === "*")
                filter = ftrue;
            else if (ns === "*") 
                filter = localNameElementFilter(lname);
            else if (lname === "*")
                filter = namespaceElementFilter(ns);
            else
                filter = namespaceLocalNameElementFilter(ns, lname);

            return new impl.FilteredElementList(this, filter);
        }),

        getElementsByClassName: constant(function getElementsByClassName(names){
            names = names.trim();  
            if (names === "") return []; // Empty node list
            names = names.split(/\s+/);  // Split on spaces
            return new impl.FilteredElementList(this, 
                                           new classNamesElementFilter(names));
        }),

        adoptNode: constant(function adoptNode(node) {
            if (node.nodeType === DOCUMENT_NODE ||
                node.nodeType === DOCUMENT_TYPE_NODE) NotSupportedError();

            if (node.parentNode) node.parentNode.removeChild(node)

            if (node.ownerDocument !== this)
                recursivelySetOwner(node, this);

            return node;
        }),

        importNode: constant(function importNode(node, deep) {
            return this.adoptNode(node.cloneNode());
        }),


        // Utility methods
        clone: constant(function clone() {
            // Can't clone an entire document
            DataCloneError();  
        }),
        isEqual: constant(function isEqual(n) {
            // Any two documents are shallowly equal.
            // Node.isEqualNode will also test the children
            return true;
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
        delete node._lastModified; // mod times are document-based
        let kids = node.childNodes;
        for(let i = 0, n = kids.length; i < n; i++)
            recursivelySetOwner(kids[i], owner);
    }


    // These function return predicates for filtering elements.
    // They're used by the Document and Element classes for methods like
    // getElementsByTagName and getElementsByClassName

    function localNameElementFilter(lname) {
        return function(e) { return e.localName === lname; };
    }

    function htmlLocalNameElementFilter(lname) {
        let lclname = toLowerCase(lname);
        if (lclname === lname)
            return localNameElementFilter(lname);

        return function(e) {
            return e.isHTML
                ? e.localName === lclname
                : e.localName === lname;
        };
    }

    function namespaceElementFilter(ns) {
        return function(e) { return e.namespaceURI === ns; };
    }

    function namespaceLocalNameElementFilter(ns, lname) {
        return function(e) {
            return e.namespaceURI === ns && e.localName === lname;
        };
    }

    // XXX
    // Optimize this when I implement classList.
    function classNamesElementFilter(names) {
        return function(e) {
            let classAttr = e.getAttribute("class");
            if (!classAttr) return false;
            let classes = classAttr.trim().split(/\s+/);
            return every(names, function(n) {
                return A.indexOf(classes, n) !== -1;
            })
        }
    }


    return Document;
});
