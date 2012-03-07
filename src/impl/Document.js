defineLazyProperty(impl, "Document", function() {

    function Document(isHTML, address) {
        this.nodeType = DOCUMENT_NODE;
        this.isHTML = isHTML;
        this._address = address || "about:blank";
        this.implementation = new impl.DOMImplementation();

        // DOMCore says that documents are always associated with themselves.
        this.ownerDocument = this;

        // These will be initialized by our custom versions of
        // appendChild and insertBefore that override the inherited
        // Node methods.
        // XXX: override those methods!
        this.doctype = null;
        this.documentElement = null;
        this.childNodes = [];
        this.childNodes._idlName = "NodeList";

        // Documents are always rooted, by definition
        this._nid = 1;
        this._nextnid = 2; // For numbering children of the document
        this._nodes = [null, this];  // nid to node map

        // This maintains the mapping from element ids to element nodes.
        // We may need to update this mapping every time a node is rooted
        // or uprooted, and any time an attribute is added, removed or changed
        // on a rooted element.
        this.byId = O.create(null); // inherit nothing

        // This property holds a monotonically increasing value akin to
        // a timestamp used to record the last modification time of nodes
        // and their subtrees. See the lastModTime attribute and modify()
        // method of the Node class.  And see FilteredElementList for an example
        // of the use of lastModTime
        this.modclock = 0;
    }

    // Map from lowercase event category names (used as arguments to
    // createEvent()) to the property name in the impl object of the
    // event constructor.
    var supportedEvents = {
        event: "Event",
        customevent: "CustomEvent",
        uievent: "UIEvent",
        mouseevent: "MouseEvent"
    };

    // Certain arguments to document.createEvent() must be treated specially
    var replacementEvent = {
        htmlevents: "event",
        mouseevents: "mouseevent",
        mutationevents: "mutationevent",
        uievents: "uievent"
    };

    Document.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("Document"),


        // This method allows dom.js to communicate with a renderer
        // that displays the document in some way
        // XXX: I should probably move this to the window object
        _setMutationHandler: constant(function(handler) {
            this.mutationHandler = handler;
        }),

        // This method allows dom.js to receive event notifications
        // from the renderer.
        // XXX: I should probably move this to the window object
        _dispatchRendererEvent: constant(function(targetNid, type, details) {
            var target = this._nodes[targetNid];
            if (!target) return;
            target._dispatchEvent(new impl.Event(type, details), true);
        }),

//        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        // XXX: DOMCore may remove documentURI, so it is NYI for now
        documentURI: attribute(nyi, nyi),
        compatMode: attribute(function() {
            // The _quirks property is set by the HTML parser
            return this._quirks ? "BackCompat" : "CSS1Compat";
        }),
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
            if (!xml.isValidName(target) || S.indexOf(data, "?>") !== -1)
                InvalidCharacterError();
            return new impl.ProcessingInstruction(this, target, data);
        }),

        createElement: constant(function(localName) {
            if (!xml.isValidName(localName)) InvalidCharacterError();

            if (this.isHTML)
                localName = toLowerCase(localName);

            var interfaceName = tagNameToInterfaceName[localName] ||
                "HTMLUnknownElement";
            return new impl[interfaceName](this, localName, null);
        }),

        createElementNS: constant(function(namespace, qualifiedName) {
            if (!xml.isValidName(qualifiedName)) InvalidCharacterError();
            if (!xml.isValidQName(qualifiedName)) NamespaceError();

            var pos, prefix, localName;
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

            if (namespace === HTML_NAMESPACE) {
                var interfaceName = tagNameToInterfaceName[localName] ||
                    "HTMLUnknownElement";
                return new impl[interfaceName](this, localName, prefix);
            }

            return new impl.Element(this, localName, namespace, prefix);
        }),

        createEvent: constant(function createEvent(interfaceName) {
            interfaceName = toLowerCase(interfaceName);
            var name = replacementEvent[interfaceName] || interfaceName;
            var constructor = impl[supportedEvents[name]];

            if (constructor) {
                var e = new constructor();
                e._initialized = false;
                return e;
            }
            else {
                NotSupportedError();
            }
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
            return call(impl.Node.prototype.appendChild, this, child);
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
            if (refChild === null) return call(impl.Document.prototype.appendChild, this, child);
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
                     refChild.index > this.documentElement.index))
                    HierarchyRequestError()

                this.doctype = child;
            }
            return call(impl.Node.prototype.insertBefore,this, child, refChild);
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

                if (oldChild === this.doctype) this.doctype = null;
            }
            else if (child.nodeType === DOCUMENT_TYPE_NODE) {
                // If we already have a doctype and we're not replacing it
                if (this.doctype && oldChild !== this.doctype)
                    HierarchyRequestError();
                // If we have a document element and the old child
                // comes after it
                if (this.documentElement &&
                    oldChild.index > this.documentElement.index)
                    HierarchyRequestError();

                if (oldChild === this.documentElement)
                    this.documentElement = null;
            }
            else {
                if (oldChild === this.documentElement)
                    this.documentElement = null;
                else if (oldChild === this.doctype)
                    this.doctype = null;
            }
            return call(impl.Node.prototype.replaceChild, this,child,oldChild);
        }),

        removeChild: constant(function removeChild(child) {
            if (child.nodeType === DOCUMENT_TYPE_NODE)
                this.doctype = null;
            else if (child.nodeType === ELEMENT_NODE)
                this.documentElement = null;

            // Now chain to our superclass
            return call(impl.Node.prototype.removeChild, this, child);
        }),

        getElementById: constant(function(id) {
            var n = this.byId[id];
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
            var filter;
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
            var filter;
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
            if (names === "") {
                var result = []; // Empty node list
                result._idlName = "NodeList";
                return result;
            }
            names = names.split(/\s+/);  // Split on spaces
            return new impl.FilteredElementList(this,
                                                classNamesElementFilter(names));
        }),

        getElementsByName: constant(function getElementsByName(name) {
            return new impl.FilteredElementList(this, elementNameFilter(name));
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

        // The following attributes and methods are from the HTML spec
        URL: attribute(nyi),
        domain: attribute(nyi, nyi),
        referrer: attribute(nyi),
        cookie: attribute(nyi, nyi),
        lastModified: attribute(nyi),
        // XXX Temporary hack
        readyState: attribute(function() { return "complete" }),
        title: attribute(fnoop, nyi),
        dir:  attribute(nyi, nyi),
        // Return the first <body> child of the document element.
        // XXX For now, setting this attribute is not implemented.
        body: attribute(function() {
            if (this.isHTML && this.documentElement) {
                var kids = this.documentElement.childNodes;
                for(var i = 0, n = kids.length; i < n; i++) {
                    if (kids[i].nodeType === ELEMENT_NODE &&
                        kids[i].localName === "body" &&
                        kids[i].namespaceURI === HTML_NAMESPACE) {
                        return kids[i];
                    }
                }
            }
            return null;
        }, nyi),
        // Return the first <head> child of the document element.
        head: attribute(function() {
            if (this.isHTML && this.documentElement) {
                var kids = this.documentElement.childNodes;
                for(var i = 0, n = kids.length; i < n; i++) {
                    if (kids[i].nodeType === ELEMENT_NODE &&
                        kids[i].localName === "head" &&
                        kids[i].namespaceURI === HTML_NAMESPACE) {
                        return kids[i];
                    }
                }
            }
            return null;
        }),
        images: attribute(nyi),
        embeds: attribute(nyi),
        plugins: attribute(nyi),
        links: attribute(nyi),
        forms: attribute(nyi),
        scripts: attribute(nyi),
        innerHTML: attribute(function() { return this.serialize() }, nyi),

        write: constant(function(args) {
            if (!this.isHTML) InvalidStateError();

            // XXX: still have to implement the ignore part
            if (!this._parser /* && this._ignore_destructive_writes > 0 */ )
                return;

            if (!this._parser) {
                // XXX call document.open, etc.
            }

            var s = join(arguments, "");

            // If the Document object's reload override flag is set, then
            // append the string consisting of the concatenation of all the
            // arguments to the method to the Document's reload override
            // buffer.
            // XXX: don't know what this is about.  Still have to do it

            // If there is no pending parsing-blocking script, have the
            // tokenizer process the characters that were inserted, one at a
            // time, processing resulting tokens as they are emitted, and
            // stopping when the tokenizer reaches the insertion point or when
            // the processing of the tokenizer is aborted by the tree
            // construction stage (this can happen if a script end tag token is
            // emitted by the tokenizer).

            // XXX: still have to do the above. Sounds as if we don't
            // always call parse() here.  If we're blocked, then we just
            // insert the text into the stream but don't parse it reentrantly...

            // Invoke the parser reentrantly
            this._parser.parse(s);
        }),

        writeln: constant(function writeln(args) {
            this.write(join(arguments, "") + "\n");
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
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_VALUE,
                    target: node._nid,
                    data: node.data
                });
            }
        }),

        // Invoked when an attribute's value changes. Attr holds the new
        // value.  oldval is the old value.  Attribute mutations can also
        // involve changes to the prefix (and therefore the qualified name)
        mutateAttr: constant(function(attr, oldval) {
            // Manage id->element mapping for getElementsById()
            // XXX: this special case id handling should not go here,
            // but in the attribute declaration for the id attribute
            /*
            if (attr.localName === "id" && attr.namespaceURI === null) {
                if (oldval) delId(oldval, attr.ownerElement);
                addId(attr.value, attr.ownerElement);
            }
            */
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_ATTR,
                    target: attr.ownerElement._nid,
                    name: attr.localName,
                    ns: attr.namespaceURI,
                    value: attr.value,
                    prefix: attr.prefix
                });
            }
        }),

        // Used by removeAttribute and removeAttributeNS for attributes.
        mutateRemoveAttr: constant(function(attr) {
/*
 * This is now handled in Attributes.js
            // Manage id to element mapping
            if (attr.localName === "id" && attr.namespaceURI === null) {
                this.delId(attr.value, attr.ownerElement);
            }
*/
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_REMOVE_ATTR,
                    target: attr.ownerElement._nid,
                    name: attr.localName,
                    ns: attr.namespaceURI
                });
            }
        }),

        // Called by Node.removeChild, etc. to remove a rooted element from
        // the tree. Only needs to generate a single mutation event when a
        // node is removed, but must recursively mark all descendants as not
        // rooted.
        mutateRemove: constant(function(node) {
            // Send a single mutation event
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_REMOVE,
                    target: node._nid
                });
            }

            // Mark this and all descendants as not rooted
            recursivelyUproot(node);
        }),

        // Called when a new element becomes rooted.  It must recursively
        // generate mutation events for each of the children, and mark them all
        // as rooted.
        mutateInsert: constant(function(node) {
            // Mark node and its descendants as rooted
            recursivelyRoot(node);

            // Send a single mutation event
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_INSERT,
                    target: node.parentNode._nid,
                    index: node.index,
                    nid: node._nid,
                    child: DOMSTR.serialize(node)
                });
            }
        }),

        // Called when a rooted element is moved within the document
        mutateMove: constant(function(node) {
            if (this.mutationHandler) {
                this.mutationHandler({
                    type: MUTATE_MOVE,
                    target: node._nid,
                    parent: node.parentNode._nid,
                    index: node.index
                });
            }
        }),


        // Add a mapping from  id to n for n.ownerDocument
        addId: constant(function addId(id, n) {
            var val = this.byId[id];
            if (!val) {
                this.byId[id] = n;
            }
            else {
                warn("Duplicate element id " + id);
                if (!isArray(val)) {
                    val = [val];
                    this.byId[id] = val;
                }
                val.push(n);
                sort(val, documentOrder);
            }
        }),

        // Delete the mapping from id to n for n.ownerDocument
        delId: constant(function delId(id, n) {
            var val = this.byId[id];
            assert(val);

            if (isArray(val)) {
                var idx = A.indexOf(val, n);
                splice(val, idx, 1);

                if (val.length == 1) { // convert back to a single node
                    this.byId[id] = val[0];
                }
            }
            else {
                delete this.byId[id];
            }
        }),

        _documentBaseURL: attribute(function() {
            // XXX: This is not implemented correctly yet
            return this._address;

            // The document base URL of a Document object is the
            // absolute URL obtained by running these substeps:

            //     Let fallback base url be the document's address.

            //     If fallback base url is about:blank, and the
            //     Document's browsing context has a creator browsing
            //     context, then let fallback base url be the document
            //     base URL of the creator Document instead.

            //     If the Document is an iframe srcdoc document, then
            //     let fallback base url be the document base URL of
            //     the Document's browsing context's browsing context
            //     container's Document instead.

            //     If there is no base element that has an href
            //     attribute, then the document base URL is fallback
            //     base url; abort these steps. Otherwise, let url be
            //     the value of the href attribute of the first such
            //     element.

            //     Resolve url relative to fallback base url (thus,
            //     the base href attribute isn't affected by xml:base
            //     attributes).

            //     The document base URL is the result of the previous
            //     step if it was successful; otherwise it is fallback
            //     base url.


        }),
    });

    var eventHandlerTypes = [
        "abort", "canplay", "canplaythrough", "change", "click", "contextmenu",
        "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave",
        "dragover", "dragstart", "drop", "durationchange", "emptied", "ended",
        "input", "invalid", "keydown", "keypress", "keyup", "loadeddata",
        "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel", "pause", "play", "playing",
        "progress", "ratechange", "readystatechange", "reset", "seeked",
        "seeking", "select", "show", "stalled", "submit", "suspend",
        "timeupdate", "volumechange", "waiting",

        "blur", "error", "focus", "load", "scroll"
    ];

    // Add event handler idl attribute getters and setters to Document
    eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(Document.prototype, "on" + type, {
            get: function() {
                return this._getEventHandler(type);
            },
            set: function(v) {
                this._setEventHandler(type, v);
            }
        });
    });



    function root(n) {
        n._nid = n.ownerDocument._nextnid++;
        n.ownerDocument._nodes[n._nid] = n;
        // Manage id to element mapping
        if (n.nodeType === ELEMENT_NODE) {
            var id = n.getAttribute("id");
            if (id) n.ownerDocument.addId(id, n);

            // Script elements need to know when they're inserted
            // into the document
            if (n._roothook) n._roothook();
        }
    }

    function uproot(n) {
        // Manage id to element mapping
        if (n.nodeType === ELEMENT_NODE) {
            var id = n.getAttribute("id");
            if (id) n.ownerDocument.delId(id, n);
        }
        delete n.ownerDocument._nodes[n._nid];
        delete n._nid;
    }

    function recursivelyRoot(node) {
        root(node);
        // XXX:
        // accessing childNodes on a leaf node creates a new array the
        // first time, so be careful to write this loop so that it
        // doesn't do that. node is polymorphic, so maybe this is hard to
        // optimize?  Try switching on nodeType?
/*
        if (node.hasChildNodes()) {
            var kids = node.childNodes;
            for(var i = 0, n = kids.length;  i < n; i++)
                recursivelyRoot(kids[i]);
        }
*/
        if (node.nodeType === ELEMENT_NODE) {
            var kids = node.childNodes;
            for(var i = 0, n = kids.length;  i < n; i++)
                recursivelyRoot(kids[i]);
        }
    }

    function recursivelyUproot(node) {
        uproot(node);
        for(var i = 0, n = node.childNodes.length;  i < n; i++)
            recursivelyUproot(node.childNodes[i]);
    }

    function recursivelySetOwner(node, owner) {
        node.ownerDocument = owner;
        delete node._lastModTime; // mod times are document-based
        var kids = node.childNodes;
        for(var i = 0, n = kids.length; i < n; i++)
            recursivelySetOwner(kids[i], owner);
    }


    // These functions return predicates for filtering elements.
    // They're used by the Document and Element classes for methods like
    // getElementsByTagName and getElementsByClassName

    function localNameElementFilter(lname) {
        return function(e) { return e.localName === lname; };
    }

    function htmlLocalNameElementFilter(lname) {
        var lclname = toLowerCase(lname);
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
            var classAttr = e.getAttribute("class");
            if (!classAttr) return false;
            var classes = classAttr.trim().split(/\s+/);
            return every(names, function(n) {
                return A.indexOf(classes, n) !== -1;
            })
        }
    }

    function elementNameFilter(name) {
        return function(e) {
            return e.getAttribute("name") === name;
        }
    }


    return Document;
});
