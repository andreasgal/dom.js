defineLazyProperty(impl, "Document", function() {

    function Document(isHTML) {
        this.isHTML = isHTML;
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
        customevent: "CustomEvent"
    };

    // Certain arguments to document.createEvent() must be treated specially
    var replacementEvent = {
        htmlevents: "event",
        mouseevents: "mouseevent",
        mutationevents: "mutationevent",
        uievents: "uievent"
    };

    var tagNameToInterfaceName = {
        "a": "HTMLAnchorElement",
        "abbr": "HTMLElement",
        "address": "HTMLElement",
        "area": "HTMLAreaElement",
        "article": "HTMLElement",
        "aside": "HTMLElement",
        "audio": "HTMLAudioElement",
        "b": "HTMLElement",
        "base": "HTMLBaseElement",
        "bdi": "HTMLElement",
        "bdo": "HTMLElement",
        "blockquote": "HTMLQuoteElement",
        "body": "HTMLBodyElement",
        "br": "HTMLBRElement",
        "button": "HTMLButtonElement",
        "canvas": "HTMLCanvasElement",
        "caption": "HTMLTableCaptionElement",
        "cite": "HTMLElement",
        "code": "HTMLElement",
        "col": "HTMLTableColElement",
        "colgroup": "HTMLTableColElement",
        "command": "HTMLCommandElement",
        "datalist": "HTMLDataListElement",
        "dd": "HTMLElement",
        "del": "HTMLModElement",
        "details": "HTMLDetailsElement",
        "dfn": "HTMLElement",
        "div": "HTMLDivElement",
        "dl": "HTMLDListElement",
        "dt": "HTMLElement",
        "em": "HTMLElement",
        "embed": "HTMLEmbedElement",
        "fieldset": "HTMLFieldSetElement",
        "figcaption": "HTMLElement",
        "figure": "HTMLElement",
        "footer": "HTMLElement",
        "form": "HTMLFormElement",
        "h1": "HTMLHeadingElement",
        "h2": "HTMLHeadingElement",
        "h3": "HTMLHeadingElement",
        "h4": "HTMLHeadingElement",
        "h5": "HTMLHeadingElement",
        "h6": "HTMLHeadingElement",
        "head": "HTMLHeadElement",
        "header": "HTMLElement",
        "hgroup": "HTMLElement",
        "hr": "HTMLHRElement",
        "html": "HTMLHtmlElement",
        "i": "HTMLElement",
        "iframe": "HTMLIFrameElement",
        "img": "HTMLImageElement",
        "input": "HTMLInputElement",
        "ins": "HTMLModElement",
        "kbd": "HTMLElement",
        "keygen": "HTMLKeygenElement",
        "label": "HTMLLabelElement",
        "legend": "HTMLLegendElement",
        "li": "HTMLLIElement",
        "link": "HTMLLinkElement",
        "map": "HTMLMapElement",
        "mark": "HTMLElement",
        "menu": "HTMLMenuElement",
        "meta": "HTMLMetaElement",
        "meter": "HTMLMeterElement",
        "nav": "HTMLElement",
        "noscript": "HTMLElement",
        "object": "HTMLObjectElement",
        "ol": "HTMLOListElement",
        "optgroup": "HTMLOptGroupElement",
        "option": "HTMLOptionElement",
        "output": "HTMLOutputElement",
        "p": "HTMLParagraphElement",
        "param": "HTMLParamElement",
        "pre": "HTMLPreElement",
        "progress": "HTMLProgressElement",
        "q": "HTMLQuoteElement",
        "rp": "HTMLElement",
        "rt": "HTMLElement",
        "ruby": "HTMLElement",
        "s": "HTMLElement",
        "samp": "HTMLElement",
        "script": "HTMLScriptElement",
        "section": "HTMLElement",
        "select": "HTMLSelectElement",
        "small": "HTMLElement",
        "source": "HTMLSourceElement",
        "span": "HTMLSpanElement",
        "strong": "HTMLElement",
        "style": "HTMLStyleElement",
        "sub": "HTMLElement",
        "summary": "HTMLElement",
        "sup": "HTMLElement",
        "table": "HTMLTableElement",
        "tbody": "HTMLTableSectionElement",
        "td": "HTMLTableDataCellElement",
        "textarea": "HTMLTextAreaElement",
        "tfoot": "HTMLTableSectionElement",
        "th": "HTMLTableHeaderCellElement",
        "thead": "HTMLTableSectionElement",
        "time": "HTMLTimeElement",
        "title": "HTMLTitleElement",
        "tr": "HTMLTableRowElement",
        "track": "HTMLTrackElement",
        "u": "HTMLElement",
        "ul": "HTMLUListElement",
        "var": "HTMLElement",
        "video": "HTMLVideoElement",
        "wbr": "HTMLElement",
    };

    Document.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("Document"),
        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        // XXX: DOMCore may remove documentURI, so it is NYI for now
        documentURI: attribute(nyi, nyi),
        compatMode: constant("CSS1Compat"),
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

            let interfaceName = tagNameToInterfaceName[localName] ||
                "HTMLUnknownElement";
            return new impl[interfaceName](this, localName, null);
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

            if (namespace === HTML_NAMESPACE) {
                let interfaceName = tagNameToInterfaceName[localName] ||
                    "HTMLUnknownElement";
                return new impl[interfaceName](this, localName, prefix);
            }

            return new impl.Element(this, localName, namespace, prefix);
        }),

        createEvent: constant(function createEvent(interfaceName) {
            interfaceName = toLowerCase(interfaceName);
            let name = replacementEvent[interfaceName] || interfaceName;
            let constructor = impl[supportedEvents[name]];

            if (constructor) 
                return new constructor();
            else
                NotSupportedError();
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

        // The following attributes and methods are from the HTML spec
        URL: attribute(nyi),
        domain: attribute(nyi, nyi),
        referrer: attribute(nyi),
        cookie: attribute(nyi, nyi),
        lastModified: attribute(nyi),
        readyState: attribute(nyi),
        title: attribute(nyi, nyi),
        dir:  attribute(nyi, nyi),
        // Return the first <body> child of the document element.
        // XXX For now, setting this attribute is not implemented.
        body: attribute(function() {
            if (this.isHTML && this.documentElement) {
                let kids = this.documentElement.childNodes;
                for(let i = 0, n = kids.length; i < n; i++) {
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
                let kids = this.documentElement.childNodes;
                for(let i = 0, n = kids.length; i < n; i++) {
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
        getElementsByName: constant(nyi),
        innerHTML: attribute(nyi, nyi),


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
            if (attr.localName === "id" && attr.namespaceURI === null) {
                if (oldval) delId(oldval, attr.ownerElement);
                addId(attr.value, attr.ownerElement);
            }
            
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
            // Manage id to element mapping 
            if (attr.localName === "id" && attr.namespaceURI === null) {
                delId(attr.value, attr.ownerElement);
            }

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
                    parent: node.parentNode._nid,
                    index: node.index,
                    nid: node._nid,
                    child: DOMSTR.stringify(node)
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
    });

    function root(n) {
        n._nid = n.ownerDocument._nextnid++;
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
        delete n._nid;
    }

    let recursivelyRoot = recursive(root),
        recursivelyUproot = recursive(uproot);

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
        delete node._lastModTime; // mod times are document-based
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
