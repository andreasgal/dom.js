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
        
        // The attributes property is added as a lazy property below.

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
                attr = this._newAttr(qname);
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
                var decl = prefix
                    ? null
                    : this._attrDecls[lname];
                var attr = new impl.Attr(this, decl, lname, prefix, ns);
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
            if (attr.declaration && attr.declaration.onchange) 
                attr.declaration.onchange(this, attr.localName, attr.value, null);

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
            if (attr.declaration && attr.declaration.onchange) 
                attr.declaration.onchange(this, attr.localName, attr.value, null);
            // Mutation event
            if (this.rooted) this.ownerDocument.mutateRemoveAttr(attr);
        }),

        // This "raw" version of getAttribute is used by the getter functions
        // of reflected idl attributes. 
        // This is the fast path for reading the idl value of reflected attrs.
        get: constant(function get(qname) {
            // We assume that qname is already lowercased, so we don't 
            // do it here.
            var attr = this._attrsByQName[qname];  
            if (!attr) return "";  // Non-existant attributes reflect as ""

            // We don't check whether attr is an array.  A qname with no
            // prefix will never have two matching Attr objects (because
            // setAttributeNS doesn't allow a non-null namespace with a 
            // null prefix.

            return attr.idlvalue;   // The raw value
        }),

        // The raw version of setAttribute for reflected idl attributes.
        // Assumes the value is in already converted form, so skips 
        // the conversion step that setAttribute does.
        set: constant(function set(qname, value) {
            var attr = this._attrsByQName[qname];  
            if (!attr) attr = this._newAttr(qname);
            attr.idlvalue = value;
        }),

        // Create a new Attr object, insert it, and return it.
        // Used by setAttribute() and by set()
        _newAttr: constant(function _newAttr(qname) {
            var attr = new impl.Attr(this, this._attrDecls[qname], qname);
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

    // Define getters and setters for an "id" property that reflects
    // the content attribute "id". Call the onchange function whenever
    // this attribute changes in anyway.
    reflectAttribute(Element, "id", {
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
    });

    // Define getters and setters for a "className" property that reflects
    // the content attribute "class".
    reflectAttribute(Element, "class", {
        idlname: "className"
    });


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

defineLazyProperty(impl, "Attr", function() {
    function Attr(elt, decl, lname, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        // If the attribute requires special onchange behavior (even
        // if it is not a reflected attribute) this declaration object
        // specifies the onchange hook to call.
        this.declaration = decl;

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
    }

    Attr.prototype = O.create(Object.prototype, {
        _idlName: constant("Attr"),
        name: attribute(function() {
            return this.prefix
                ? this.prefix + ":" + this.localName
                : this.localName;
        }),
        // Query and set the content attribute value
        value: attribute(
            function() {
                return this.data;
            },
            function(v) {
                if (this.data === v) return;
                let oldval = this.data;
                this.data = v;
                
                // Run the onchange hook for the attribute
                // if there is one.
                if (this.declaration &&
                    this.declaration.onchange)
                    this.declaration.onchange(this.ownerElement,
                                              this.localName,
                                              oldval, v);
                
                // Generate a mutation event if the element is rooted
                if (this.ownerElement.rooted)
                    this.ownerElement.ownerDocument.mutateAttr(
                        this,
                        oldval);
            }
        ), 
    });

    return Attr;
});

// Many reflected attributes do not need to specify anything in their
// attribute declaration object.  So we can just reuse this object for them all
const SimpleAttributeDeclaration = {};

// This is a utility function for setting up reflected attributes.
// Pass an element impl class like impl.HTMLElement as the first
// argument.  Pass the content attribute name as the second
// argument. And pass an attribute declaration object as the third.
// The method adds the attribute declaration to the class c's
// _attrDecls object.  And it sets up getter and setter methods for
// the reflected attribute on the element class's prototype
// If the declaration includes a legalValues property, then this method
// adds appopriate conversion functions to it.
function reflectAttribute(c, name, declaration) {
    var p = c.prototype;
    if (!declaration) declaration = SimpleAttributeDeclaration;
    
    // If p does not already have its own _attrDecls then create one
    // for it, inheriting from the inherited _attrDecls. At the top
    // (for the impl.Element class) the _attrDecls object will be
    // created with a null prototype.
    if (!hasOwnProperty(p, "_attrDecls")) {
        p._attrDecls =
            Object.create(p._attrDecls || null);
    }

    // I don't think we should ever override a reflected attribute of
    // a superclass.
    assert(!(name in p._attrDecls), "Redeclared attribute " + name);

    // See if we need to fix up the declaration object at all.
    if (declaration.legalValues) {
        // Don't specify both conversions and legal values
        assert(!declaration.contentToIDL && !declaration.idlToContent);
        
        // Note that we only have to convert in one direction.
        // Any value set on the idl attribute will become the value of
        // the content attribute.  But content attributes get filtered
        // so that only canonical legal ones are reflected
        // XXX: if an attribute declares an invalid value default or a 
        // missing value default, we may need to use them here...
        declaration.contentToIDL = function(v) {
            return declaration.legalValues[v.toLowerCase()] || "";
        }
    }


    // Add the attribute declaration to the _attrDecls object
    p._attrDecls[name] = declaration;

    var getter, setter;
    if (declaration.contentToIDL) 
        getter = function() {
            return declaration.contentToIDL(this.getAttribute(name));
        };
    else
        getter = function() { return this.getAttribute(name) || ""; }

    if (declaration.idlToContent) 
        setter = function(v) {
            this.setAttribute(name, declaration.idlToContent(v));
        }
    else 
        setter = function(v) { this.setAttribute(name, v); }

    // Now create the accessor property for the reflected attribute
    O.defineProperty(p, declaration.idlname || name, {
        get: getter,
        set: setter
    });
}
