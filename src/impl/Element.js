defineLazyProperty(impl, "Element", function() {
    function Element(doc, localName, namespaceURI, prefix) {
        this.ownerDocument = doc;
        this.localName = localName;
        this.namespaceURI = namespaceURI;
        this.prefix = prefix;

        this.tagName = (prefix !== null)
            ? prefix + ":" + localName
            : localName;

        if (this.isHTML)
            this.tagName = toUpperCase(this.tagName);

        this.attributes = [];
        this.childNodes = [];
    }

    Element.prototype = Object.create(impl.Node.prototype, {
        nodeType: constant(ELEMENT_NODE),
        nodeName: attribute(function() { return this.tagName; }),
        nodeValue: attribute(fnull, fnoop),
        
        isHTML: attribute(function() { 
            return this.namespaceURI === HTML_NAMESPACE &&
                this.ownerDocument.isHTML;
        }),

        getAttribute: constant(function getAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname)
                    return attr.value;
            }
            return null;
        }),

        hasAttribute: constant(function hasAttribute(qname) {
            return this.getAttribute(qname) !== null;
        }),


        setAttribute: constant(function setAttribute(qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (this.isHTML) qname = toLowerCase(qname);
            if (substring(qname, 0, 5) === "xmlns") NamespaceError();

            // If id, class, or name changes, that may invalidate 
            // NodeList or HTMLCollection caches.
            if (qname === "id" || qname === "class" || qname === "name")
                this.modify();

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname) {
                    attr.value = value;  // Setter sends mutation event for us
                    return;
                }
            }

            // The attribute doesn't already exist, so add a new one
            let newattr = new impl.Attr(this, qname, value)
            push(this.attributes, newattr);

            // Send mutation event
            if (this.root) this.root.mutateAddAttr(newattr);
        }),

        removeAttribute: constant(function removeAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.name === qname) {
                    splice(this.attributes, i, 1);

                    // If id, class, or name changes, that may invalidate 
                    // NodeList or HTMLCollection caches.
                    if (qname === "id" || qname === "class" || qname === "name")
                        this.modify();
                    
                    // Mutation event
                    if (this.root) this.root.mutateRemoveAttr(attr);
                    return;
                }
            }
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname)
                    return attr.value;
            }
            return null;
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
            return this.getAttributeNS(ns, lname) !== null;
        }),

        setAttributeNS: constant(function setAttributeNS(ns, qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (!isValidQName(qname)) NamespaceError();

            let pos = S.indexOf(qname, ":"), prefix, lname;
            if (pos === -1) {
                prefix = null;
                lname = qname;
            }
            else {
                prefix = substring(qname, 0, pos);
                lname = substring(qname, pos+1);
            }

            if (ns === "") ns = null;

            if ((prefix !== null && ns === null) ||
                (prefix === "xml" && ns !== XML_NAMESPACE) ||
                ((qname === "xmlns" || prefix === "xmlns") &&
                 (ns !== XMLNS_NAMESPACE)) ||
                (ns === XMLNS_NAMESPACE && 
                 !(qname === "xmlns" || prefix === "xmlns")))
                NamespaceError();

            // If id, class, or name changes, that may invalidate 
            // NodeList or HTMLCollection caches.
            if (ns === null &&
                (qname === "id" || qname === "class" || qname === "name"))
                this.modify();

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname) {

                    // setAttributeNS can change the prefix (and therefore 
                    // qname) of an attribute
                    if (attr.prefix !== prefix) {
                        attr.prefix = prefix;
                        attr.name = prefix + ":" + attr.localName 
                    }

                    attr.value = value;  // this automatically fires an event
                    return;
                }
            }
            let newattr = new impl.Attr(this, lname, value, prefix, ns)
            push(this.attributes, newattr);
            if (this.root) this.root.mutateAddAttr(newattr);
        }),


        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let attr = this.attributes[i];
                if (attr.namespaceURI === ns && attr.localName === lname) {
                    splice(this.attributes, i, 1);

                    // If id, class, or name changes, that may invalidate 
                    // NodeList or HTMLCollection caches.
                    if (ns === null &&
                        (lname === "id"||lname === "class"||lname === "name"))
                        this.modify();

                    if (this.root) this.root.mutateRemoveAttr(attr);
                    return;
                }
            }
        }),

        children: attribute(function() {
            if (!this._children) {
                this._children = new ChildrenCollection(this);
            }
            return this._children;
        }),

        firstElementChild: attribute(function() {
            let kids = this.childNodes;
            for(let i = 0, n = kids.length; i < n; i++) {
                if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
            }
            return null;
        }),

        lastElementChild: attribute(function() {
            let kids = this.childNodes;
            for(let i = kids.length-1; i >= 0; i--) {
                if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
            }
            return null;
        }),

        nextElementSibling: attribute(function() {
            if (this.parentNode) {
                let sibs = this.parentNode.childNodes;
                for(let i = this.index+1, n = sibs.length; i < n; i++) {
                    if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
                }
            }
            return null;
        }),

        previousElementSibling: attribute(function() {
            if (this.parentNode) {
                let sibs = this.parentNode.childNodes;
                for(let i = this.index-1; i >= 0; i--) {
                    if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
                }
            }
            return null;
        }),

        childElementCount: attribute(function() {
            return this.children.length;
        }),


        // Return the next element, in source order, after this one or
        // null if there are no more.  If root element is specified,
        // then don't traverse beyond its subtree.
        // 
        // This is not a DOM method, but is convenient for 
        // lazy traversals of the tree.
        nextElement: constant(function(root) {
            let next = this.firstElementChild || this.nextElementSibling;
            if (next) return next;

            // XXX: still need to implement Document.documentElement
            if (!root) root = this.ownerDocument.documentElement;

            // If we can't go down or across, then we have to go up
            // and across to the parent sibling or another ancestor's
            // sibling.  Be careful, though: if we reach the root
            // element, or if we reach the documentElement, then 
            // the traversal ends.
            for(let parent = this.parentElement;
                parent && parent !== root;
                parent = parent.parentElement) {

                next = parent.nextElementSibling;
                if (next) return next;
            }

            return null;
        }),

        // Just copy this method from the Document prototype
        getElementsByTagName:
            constant(impl.Document.prototype.getElementsByTagName),

        getElementsByTagNameNS:
            constant(impl.Document.prototype.getElementsByTagNameNS),

        getElementsByClassName:
            constant(impl.Document.prototype.getElementsByClassName),

    });

    // The children property of an Element will be an instance of this class.
    // It defines length, item() and namedItem() and will be wrapped by an
    // HTMLCollection when exposed through the DOM.
    function ChildrenCollection(e) {
        this.element = e;
    }

    ChildrenCollection.prototype = {
        get length() { 
            this.updateCache();
            return this.childrenByNumber.length;
        },

        item: function item(n) {
            this.updateCache();
            return this.childrenByNumber[n] || null;
        },
        
        namedItem: function namedItem(name) {
            this.updateCache();
            return this.childrenByName[name] || null;
        },

        // This attribute returns the entire name->element map.
        // It is not part of the HTMLCollection API, but we need it in
        // src/HTMLCollectionProxy
        get namedItems() {
            this.updateCache();
            return this.childrenByName;
        },

        updateCache: function updateCache() {
            if (this.lastModified !== this.element.lastModified) {
                this.lastModified = this.element.lastModified;
                this.childrenByNumber = [];
                this.childrenByName = {};

                for(let i = 0, n = this.element.childNodes.length; i < n; i++) {
                    let c = this.element.childNodes[i];
                    if (c.nodeType == ELEMENT_NODE) {
                        push(this.childrenByNumber, c);
                        
                        // XXX Are there any requirements about the namespace
                        // of the id property?
                        let id = c.getAttribute("id");

                        // If there is an id that is not already in use...
                        if (id && !this.childrenByName[id]) 
                            this.childrenByName[id] = c;

                        let namedElts = /^(a|applet|area|embed|form|frame|frameset|iframe|img|object)$/;

                        // For certain HTML elements we check the name attribute
                        let name = c.getAttribute("name");
                        if (name && 
                            this.element.namespaceURI === HTML_NAMESPACE &&
                            namedElts.test(this.element.localName) &&
                            !this.childrenByName[name])
                            this.childrenByName[id] = c;
                    }
                }
            }
        }
    };


    return Element;
});