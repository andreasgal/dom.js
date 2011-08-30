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

        this.attributes = new impl.Attributes(this);
        this.childNodes = [];
        this.childNodes._idlName = "NodeList";
    }

    let recursiveGetText = recursive(function(n,a) {
        if (n.nodeType === TEXT_NODE) a.push(n._data);
    });

    function textContentGetter() {
        let strings = [];
        recursiveGetText(this, strings);
        return strings.join("");
    }

    function textContentSetter(newtext) {
        this.removeChildren();
        if (newtext !== null && newtext !== "") {
            this.appendChild(this.ownerDocument.createTextNode(newtext));
        }
    }

    Element.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("Element"),
        nodeType: constant(ELEMENT_NODE),
        nodeName: attribute(function() { return this.tagName; }),
        nodeValue: attribute(fnull, fnoop),
        textContent: attribute(textContentGetter, textContentSetter),

        _attributeDeclarations: constant({
            "id": {
                onchange: function(element, lname, oldval, newval) {
                    if (element.rooted) {
                        if (oldval) {
                            element.ownerDocument.delId(oldval, element);
                        }
                        if (newval) {
                            element.ownerDocument.addId(newval, element);
                        }
                    }
                }
            }
        }),


        // XXX
        // Should I try to generate these attributes automatically from
        // the _attributeDeclarations object?
        id: attribute(function() { return this.attributes.get("id"); },
                      function(v) { this.attributes.set("id", v); }),
        className: attribute(function() { return this.attributes.get("class");},
                             function(v) { this.attributes.set("class", v); }),

        getAttribute: constant(function getAttribute(qname) {
            return this.attributes.getAttribute(qname);
        }),

        hasAttribute: constant(function hasAttribute(qname) {
            return this.attributes.hasAttribute(qname);
        }),

        setAttribute: constant(function setAttribute(qname, value) {
            return this.attributes.setAttribute(qname, value);
        }),

        removeAttribute: constant(function removeAttribute(qname) {
            return this.attributes.removeAttribute(qname);
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
            return this.attributes.getAttributeNS(ns, lname);
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
            return this.attributes.hasAttributeNS(ns, lname);
        }),

        setAttributeNS: constant(function setAttributeNS(ns, qname, value) {
            return this.attributes.setAttributeNS(ns, qname, value);
        }),

        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
            return this.attributes.removeAttributeNS(ns, lname);
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

        
        // Utility methods used by the public API methods above

        isHTML: attribute(function() { 
            return this.namespaceURI === HTML_NAMESPACE &&
                this.ownerDocument.isHTML;
        }),

        clone: constant(function clone() {
            let e;

            if (this.namespaceURI !== HTML_NAMESPACE || this.prefix)
                e = this.ownerDocument.createElementNS(this.namespaceURI,
                                                       this.tagName);
            else
                e = this.ownerDocument.createElement(this.localName);

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let a = this.attributes.item(i);
                e.setAttributeNS(a.namespaceURI, a.name, a.value);
            }

            return e;
        }),

        isEqual: constant(function isEqual(that) {
            if (this.localName !== that.localName ||
                this.namespaceURI !== that.namespaceURI ||
                this.prefix !== that.prefix ||
                this.attributes.length !== that.attributes.length)
                return false;

            // Compare the sets of attributes, ignoring order
            // and ignoring attribute prefixes.
            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let a = this.attributes.item(i);
                if (!that.hasAttributeNS(a.namespaceURI, a.localName))
                    return false;
                if (that.getAttributeNS(a.namespaceURI,a.localName) !== a.value)
                    return false;
            }

            return true;
        }),

        // This is the "locate a namespace prefix" algorithm from the
        // DOMCore specification.  It is used by Node.lookupPrefix()
        locateNamespacePrefix: constant(function locateNamespacePrefix(ns) {
            if (this.namespaceURI === ns && this.prefix !== null) 
                return this.prefix;

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let a = this.attributes.item(i);
                if (a.prefix === "xmlns" && a.value === ns)
                    return a.localName;
            }

            let parent = this.parentElement;
            return parent ? parent.locateNamespacePrefix(ns) : null;
        }),

        // This is the "locate a namespace" algorithm for Element nodes
        // from the DOM Core spec.  It is used by Node.lookupNamespaceURI
        locateNamespace: constant(function locateNamespace(prefix) {
            if (this.prefix === prefix && this.namespaceURI !== null)
                return this.namespaceURI;

            for(let i = 0, n = this.attributes.length; i < n; i++) {
                let a = this.attributes.item(i);
                if ((a.prefix === "xmlns" && a.localName === prefix) ||
                    (a.prefix === null && a.localName === "xmlns")) {
                    return a.value || null;
                }
            }

            let parent = this.parentElement;
            return parent ? parent.locateNamespace(prefix) : null;
        }),

    });

    // The children property of an Element will be an instance of this class.
    // It defines length, item() and namedItem() and will be wrapped by an
    // HTMLCollection when exposed through the DOM.
    function ChildrenCollection(e) {
        this.element = e;
    }

    ChildrenCollection.prototype = {
        _idlName: "HTMLCollection",
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
            let namedElts = /^(a|applet|area|embed|form|frame|frameset|iframe|img|object)$/;
            if (this.lastModTime !== this.element.lastModTime) {
                this.lastModTime = this.element.lastModTime;
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