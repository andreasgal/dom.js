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

        this.childNodes = [];
        this.childNodes._idlName = "NodeList";

        // These properties maintain the set of attributes
        this._attrsByQName = Object.create(null);  // The qname->Attr map
        this._attrsByLName = Object.create(null);  // The ns|lname->Attr map
        this._attrKeys = [];                       // attr index -> ns|lname
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

        children: attribute(function() {
            if (!this._children) {
                this._children = new ChildrenCollection(this);
            }
            return this._children;
        }),

        attributes: attribute(function() {
            if (!this._attributes) {
                this._attributes = new AttributesArray(this);
            }
            return this._attributes;
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

            for(let i = 0, n = this._numattrs; i < n; i++) {
                let a = this._attr(i);
                e.setAttributeNS(a.namespaceURI, a.name, a.value);
            }

            return e;
        }),

        isEqual: constant(function isEqual(that) {
            if (this.localName !== that.localName ||
                this.namespaceURI !== that.namespaceURI ||
                this.prefix !== that.prefix ||
                this._numattrs !== that._numattrs)
                return false;

            // Compare the sets of attributes, ignoring order
            // and ignoring attribute prefixes.
            for(let i = 0, n = this._numattrs; i < n; i++) {
                let a = this._attr(i);
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

            for(let i = 0, n = this._numattrs; i < n; i++) {
                let a = this._attr(i);
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

            for(let i = 0, n = this._numattrs; i < n; i++) {
                let a = this._attr(i);
                if ((a.prefix === "xmlns" && a.localName === prefix) ||
                    (a.prefix === null && a.localName === "xmlns")) {
                    return a.value || null;
                }
            }

            let parent = this.parentElement;
            return parent ? parent.locateNamespace(prefix) : null;
        }),

        // 
        // Attribute handling methods and utilities
        //
        
        /*
         * Attributes in the DOM are tricky:
         * 
         * - there are the 8 basic get/set/has/removeAttribute{NS} methods
         * 
         * - but many HTML attributes are also "reflected" through IDL
         *   attributes which means that they can be queried and set through
         *   regular properties of the element.  There is just one attribute
         *   value, but two ways to get and set it.
         * 
         * - Different HTML element types have different sets of reflected
             attributes.
         *
         * - attributes can also be queried and set through the .attributes
         *   property of an element.  This property behaves like an array of
         *   Attr objects.  The value property of each Attr is writeable, so
         *   this is a third way to read and write attributes.
         * 
         * - for efficiency, we really want to store attributes in some kind
         *   of name->attr map.  But the attributes[] array is an array, not a
         *   map, which is kind of unnatural.
         *
         * - When using namespaces and prefixes, and mixing the NS methods
         *   with the non-NS methods, it is apparently actually possible for
         *   an attributes[] array to have more than one attribute with the
         *   same qualified name.  And certain methods must operate on only
         *   the first attribute with such a name.  So for these methods, an
         *   inefficient array-like data structure would be easier to
         *   implement.
         * 
         * - The attributes[] array is live, not a snapshot, so changes to the
         *   attributes must be immediately visible through existing arrays.
         * 
         * - When attributes are queried and set through IDL properties
         *   (instead of the get/setAttributes() method or the attributes[]
         *   array) they may be subject to type conversions, URL
         *   normalization, etc., so some extra processing is required in that
         *   case.
         * 
         * - But access through IDL properties is probably the most common
         *   case, so we'd like that to be as fast as possible.
         * 
         * - We can't just store attribute values in their parsed idl form,
         *   because setAttribute() has to return whatever string is passed to
         *   getAttribute even if it is not a legal, parseable value. So
         *   attribute values must be stored in unparsed string form.
         * 
         * - We need to be able to send change notifications or mutation
         *   events of some sort to the renderer whenever an attribute value
         *   changes, regardless of the way in which it changes.
         * 
         * - Some attributes, such as id and class affect other parts of the
         *   DOM API, like getElementById and getElementsByClassName and so
         *   for efficiency, we need to specially track changes to these
         *   special attributes.
         * 
         * - Some attributes like class have different names (className) when
         *   reflected.
         * 
         * - Attributes whose names begin with the string "data-" are treated
             specially.
         * 
         * - Reflected attributes that have a boolean type in IDL have special
         *   behavior: setting them to false (in IDL) is the same as removing
         *   them with removeAttribute()
         * 
         * - numeric attributes (like HTMLElement.tabIndex) can have default
         *   values that must be returned by the idl getter even if the
         *   content attribute does not exist. (The default tabIndex value
         *   actually varies based on the type of the element, so that is a
         *   tricky one).
         * 
         * See
         * http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#reflect
         * for rules on how attributes are reflected.
         *
         */

        getAttribute: constant(function getAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);
            var attr = this._attrsByQName[qname];
            if (!attr) return null;

            if (isArray(attr))  // If there is more than one
                attr = attr[0];   // use the first

            return attr.value;
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
            var attr = this._attrsByLName[ns + "|" + lname];
            return attr ? attr.value : null;
        }),
        
        hasAttribute: constant(function hasAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);
            return qname in this._attrsByQName;
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
            var key = ns + "|" + lname;
            return key in this._attrsByLName;
        }),

        setAttribute: constant(function setAttribute(qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (this.isHTML) qname = toLowerCase(qname);
            if (substring(qname, 0, 5) === "xmlns") NamespaceError();

            // XXX: the spec says that this next search should be done 
            // on the local name, but I think that is an error.
            // email pending on www-dom about it.
            var attr = this._attrsByQName[qname];
            if (!attr) {
                attr = this._newattr(qname);
            }
            else {
                if (isArray(attr)) attr = attr[0];
            }

            // Now set the attribute value on the new or existing Attr object.
            // The Attr.value setter method handles mutation events, etc.
            attr.value = value;
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

            var key = ns + "|" + lname;
            if (ns === "") ns = null;

            if ((prefix !== null && ns === null) ||
                (prefix === "xml" && ns !== XML_NAMESPACE) ||
                ((qname === "xmlns" || prefix === "xmlns") &&
                 (ns !== XMLNS_NAMESPACE)) ||
                (ns === XMLNS_NAMESPACE && 
                 !(qname === "xmlns" || prefix === "xmlns")))
                NamespaceError();

            var attr = this._attrsByLName[key];
            if (!attr) {
                var attr = new Attr(this, lname, prefix, ns);
                this._attrsByLName[key] = attr;
                this._attrKeys = O.keys(this._attrsByLName);

                // We also have to make the attr searchable by qname.
                // But we have to be careful because there may already
                // be an attr with this qname.
                this._addQName(attr);
            }
            else {
                // Calling setAttributeNS() can change the prefix of an 
                // existing attribute!
                if (attr.prefix !== prefix) {
                    // Unbind the old qname
                    this._removeQName(attr);
                    // Update the prefix
                    attr.prefix = prefix;
                    // Bind the new qname
                    this._addQName(attr);
                }
            }
            attr.value = value; // Automatically sends mutation event
        }),

        removeAttribute: constant(function removeAttribute(qname) {
            if (this.isHTML) qname = toLowerCase(qname);

            var attr = this._attrsByQName[qname];
            if (!attr) return;

            // If there is more than one match for this qname
            // so don't delete the qname mapping, just remove the first
            // element from it.
            if (isArray(attr)) {
                if (attr.length > 2) {
                    attr = A.shift(attr);  // remove it from the array
                }
                else {
                    this._attrsByQName[qname] = attr[1];
                    attr = attr[0];
                }
            }
            else {
                // only a single match, so remove the qname mapping
                delete this._attrsByQName[qname];
            }

            // Now attr is the removed attribute.  Figure out its
            // ns+lname key and remove it from the other mapping as well.
            var key = (attr.namespaceURI || "") + "|" + attr.localName;
            delete this._attrsByLName[key];
            this._attrKeys = O.keys(this._attrsByLName);

            // Onchange handler for the attribute
            if (attr.onchange)
                attr.onchange(this, attr.localName, attr.value, null);

            // Mutation event
            if (this.rooted) this.ownerDocument.mutateRemoveAttr(attr);
        }),

        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
            var key = (ns || "") + "|" + lname;
            var attr = this._attrsByLName[key];
            if (!attr) return;

            delete this._attrsByLName[key];
            this._attrKeys = O.keys(this._attrsByLName);

            // Now find the same Attr object in the qname mapping and remove it
            // But be careful because there may be more than one match.
            this._removeQName(attr);

            // Onchange handler for the attribute
            if (attr.onchange) 
                attr.onchange(this, attr.localName, attr.value, null);
            // Mutation event
            if (this.rooted) this.ownerDocument.mutateRemoveAttr(attr);
        }),

        // This "raw" version of getAttribute is used by the getter functions
        // of reflected attributes. It skips some error checking and
        // namespace steps
        _getattr: constant(function _getattr(qname) {
            // Assume that qname is already lowercased, so don't do it here.
            // Also don't check whether attr is an array: a qname with no
            // prefix will never have two matching Attr objects (because
            // setAttributeNS doesn't allow a non-null namespace with a 
            // null prefix.
            var attr = this._attrsByQName[qname];  
            return attr ? attr.value : null;
        }),

        // The raw version of setAttribute for reflected idl attributes.
        _setattr: constant(function _setattr(qname, value) {
            var attr = this._attrsByQName[qname];  
            if (!attr) attr = this._newattr(qname);
            attr.value = value;
        }),

        // Create a new Attr object, insert it, and return it.
        // Used by setAttribute() and by set()
        _newattr: constant(function _newattr(qname) {
            var attr = new Attr(this, qname);
            this._attrsByQName[qname] = attr;
            this._attrsByLName["|" + qname] = attr;
            this._attrKeys = O.keys(this._attrsByLName);
            return attr;
        }),

        // Add a qname->Attr mapping to the _attrsByQName object, taking into 
        // account that there may be more than one attr object with the 
        // same qname
        _addQName: constant(function(attr) {
            var qname = attr.name;
            var existing = this._attrsByQName[qname];
            if (!existing) {
                this._attrsByQName[qname] = attr;
            }
            else if (isArray(existing)) {
                push(existing, attr);
            }
            else {
                this._attrsByQName[qname] = [existing, attr];
            }
        }),

        // Remove a qname->Attr mapping to the _attrsByQName object, taking into 
        // account that there may be more than one attr object with the 
        // same qname
        _removeQName: constant(function(attr) {
            var qname = attr.name;
            var target = this._attrsByQName[qname];

            if (isArray(target)) {
                var idx = A.indexOf(target, attr);
                assert(idx !== -1); // It must be here somewhere
                if (target.length === 2) {
                    this._attrsByQName[qname] = target[1-idx];
                }
                else {
                    splice(target, idx, 1)
                }
            }
            else {
                assert(target === attr);  // If only one, it must match
                delete this._attrsByQName[qname];
            }
        }),

        // Return the number of attributes
        _numattrs: attribute(function() { return this._attrKeys.length; }),
        // Return the nth Attr object
        _attr: constant(function(n) {
            return this._attrsByLName[this._attrKeys[n]];
        }),
    });

    // A utility function used by those below
    function defineAttribute(c, idlname, getter, setter) {
        // I don't think we should ever override an existing attribute
        assert(!(idlname in c.prototype), "Redeclared attribute " + idlname);
        O.defineProperty(c.prototype, idlname, { get: getter, set: setter });
    }


    // This is a utility function for setting up reflected attributes.
    // Pass an element impl class like impl.HTMLElement as the first
    // argument.  Pass the content attribute name as the second argument.
    // And pass the idl attribute name as the third, if it is different.
    Element.reflectStringAttribute = function(c, name, idlname) {
        defineAttribute(c, idlname || name, 
                        function() { return this._getattr(name) || ""; },
                        function(v) { this._setattr(name, v); });
    };

    // Define an idl attribute that reflects an enumerated content
    // attribute.  This is for attributes that the HTML spec describes as
    // "limited to only known values".  legalvals should be an array that
    // maps the lowercased versions of allowed enumerated values to the
    // canonical value that it should convert to. Usually the name and
    // value of most properties in the object will be the same.
    Element.reflectEnumeratedAttribute = function(c, name, legalvals,
                                                  defaultval, idlname)
    {
        defineAttribute(c, idlname || name, 
                        function() {
                            var v = this._getattr(name);
                            v = legalvals[v.toLowerCase()];
                            if (v !== undefined) return v;
                            if (defaultval !== undefined) return defaultval;
                            return "";
                        },
                        function(v) { this._setattr(name, v); });
    };

    // This is a utility function for setting up change handler functions
    // for attributes like 'id' that require special handling when they change.
    Element.registerAttributeChangeHandler = function(c, name, handler) {
        var p = c.prototype;
        
        // If p does not already have its own _attributeChangeHandlers
        // then create one for it, inheriting from the inherited
        // _attributeChangeHandlers. At the top (for the impl.Element class) the
        // _attributeChangeHandlers object will be created with a null prototype.
        if (!hasOwnProperty(p, "_attributeChangeHandlers")) {
            p._attributeChangeHandlers =
                Object.create(p._attributeChangeHandlers || null);
        }

        // There can only be one
        assert(!(name in p._attributeChangeHandlers));

        p._attributeChangeHandlers[name] = handler;
    };



    // Register special handling for the id attribute
    Element.registerAttributeChangeHandler(Element, "id",
               function(element, lname, oldval, newval) {
                   if (element.rooted) {
                       if (oldval) {
                           element.ownerDocument.delId(oldval, element);
                       }
                       if (newval) {
                           element.ownerDocument.addId(newval, element);
                       }
                   }
               });

    // Define getters and setters for an "id" property that reflects
    // the content attribute "id".
    Element.reflectStringAttribute(Element, "id");

    // Define getters and setters for a "className" property that reflects
    // the content attribute "class".
    Element.reflectStringAttribute(Element, "class", "className");


    // The Attr class represents a single attribute.  The values in 
    // _attrsByQName and _attrsByLName are instances of this class.
    function Attr(elt, lname, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        if (!namespace && !prefix && lname in elt._attributeChangeHandlers)
            this.onchange = elt._attributeChangeHandlers[lname];

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
    }

    Attr.prototype = {
        _idlName: "Attr",
        get name() {
            return this.prefix
                ? this.prefix + ":" + this.localName
                : this.localName;
        },

        get value() {
            return this.data;
        },

        set value(v) {
            if (this.data === v) return;
            let oldval = this.data;
            this.data = v;
            
            // Run the onchange hook for the attribute
            // if there is one.
            if (this.onchange)
                this.onchange(this.ownerElement,this.localName, oldval, v);
            
            // Generate a mutation event if the element is rooted
            if (this.ownerElement.rooted)
                this.ownerElement.ownerDocument.mutateAttr(
                    this,
                    oldval);
        }
    };


    // The attributes property of an Element will be an instance of this class.
    // This class is really just a dummy, though. The AttrArrayProxy that
    // defines the public API just uses the Element object itself.  But in
    // order to get wrapped properly, we need to return an object with the
    // right _idlName property
    function AttributesArray(elt) { this.element = elt; }
    AttributesArray.prototype = { _idlName: "AttrArray" };


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
