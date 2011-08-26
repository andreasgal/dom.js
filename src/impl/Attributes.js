/*
 * Attributes in the DOM are tricky:
 * 
 * - there are the 8 basic get/set/has/removeAttribute{NS} methods
 * 
 * - but many HTML attributes are also "reflected" through IDL attributes
 *   which means that they can be queried and set through regular properties
 *   of the element.  There is just one attribute value, but two ways to get
 *   and set it.
 * 
 * - Different HTML element types have different sets of reflected attributes.
 *
 * - attributes can also be queried and set through the .attributes property
 *   of an element.  This property behaves like an array of Attr objects.  The
 *   value property of each Attr is writeable, so this is a third way to 
 *   read and write attribugtes.
 * 
 * - for efficiency, we really want to store attributes in some kind of
 *   name->attr map.  But the attributes[] array is an array, not a map, which
 *   is kind of unnatural.
 *
 * - When using namespaces and prefixes, and mixing the NS methods with the
 *   non-NS methods, it is apparently actually possible for an attributes[]
 *   array to have more than one attribute with the same qualified name.  And
 *   certain methods must operate on only the first attribute with such a
 *   name.  So for these methods, an inefficient array-like data structure
 *   would be easier to implement. 
 * 
 * - The attributes[] array is live, not a snapshot, so changes to the
 *   attributes must be immediately visible through existing arrays.
 * 
 * - When attributes are queried and set through IDL properties (instead of
 *   the get/setAttributes() method or the attributes[] array) they may be
 *   subject to type conversions, URL normalization, etc., so some extra
 *   processing is required in that case.
 * 
 * - But access through IDL properties is probably the most common case, so
 *   we'd like that to be the fast path.  That means that we'll have to do the
 *   type conversions on the other, slower, access paths.
 * 
 * - We need to be able to send change notifications or mutation events of
 *   some sort to the renderer whenever an attribute value changes, regardless
 *   of the way in which it changes.
 * 
 * - Some attributes, such as id and class affect other parts of the DOM API, 
 *   like getElementById and getElementsByClassName and so for efficiency, we
 *   need to specially track changes to these special attributes.
 * 
 * - Some attributes like class have different names (className) when
 *   reflected. 
 * 
 * - Attributes whose names begin with the string "data-" are treated specially.
 * 
 * - Reflected attributes that have a boolean type in IDL have special
 *   behavior: setting them to false (in IDL) is the same as removing them
 *   with removeAttribute()
 *
 * This Attributes class attempts to deal with all of these issues. 
 * Each element will have a single instance of this class.  The getters and
 * setters for its idl attribute properties will call methods on that
 * attributes object.  The get/set/has/removeAttribute{NS}() methods will all
 * call methods on the attributes object.  And there will be a proxy handler
 * that can be used when wrapping the element so that the attributes object
 * behaves like an Attr[], as required by WebIDL.
 *
 * In order to make this work, Element and each of its subtypes must declare
 * the set of reflected attributes that they define.  So each element type
 * should have an _attributeDeclarations property on its prototype. This
 * property refers to an object that maps attribute names to attribute
 * declaration objects that  describe "reflected" attributes and the special
 * handling they require.
 *
 * An attribute declaration object may have the following properties:
 * 
 *   onchange: a function to be invoked when the value of the attribute changes.
 *     for the id attribute, for example, this function would update the
 *     id->elt map for the document.
 * 
 *   idlToContent: a conversion function to convert the idl attribute
 *     value to a string content attribute.  If undefined then
 *     no conversion is necessary.
 *
 *   contentToIDL: a conversion function to convert from a string
 *     content attribute value to the appropriate idl attribute type.
 *     The conversion may not be a type conversion: url properties,
 *     e.g. require some normalization but remain strings. 
 *     undefined if no conversion is needed.
 * 
 *   idlname:  the name of the property that holds the idl attribute
 *      this is usually the same as the content attribute name, but
 *      is different for class/className, for example
 *
 *   boolean: true if this is a boolean attribute and undefined
 *      otherwise.  boolean attribute have special behavior: setting
 *      their IDL value to false is like calling removeAttribute() on them.
 * 
 * XXX: For enumerated attributes (such as dir) is it useful to declare
 *   the complete set of legal values here?
 * 
 * See
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#reflect
 * for rules on how attributes are reflected.
 *
 * Notice that the simplest string-valued reflected attributes do not
 * require any of these AttrDecl properties so an empty object (or null?)
 * or some constant value will work for them.
 * 
 * XXX: I don't know yet if these can just be plain JS objects created with
 *  object literals, or whether it will be useful to define a factory method
 *  or even an AttrDecl class with methods in it.
 *
 * IMPL NOTES:
 *
 * I think each Attr object I create from here will refer to the 
 * attribute declaration, if there is one, and it is the value property
 * of the attr that will do the interesting setter stuff in one location.
 * 
 * For the NS versions I have to find attributes by ns/lname. For the non-NS
 * methods, I have to find them by qname.  So I think I need two maps. (Or in
 * the ns case, a ns->{lname->Attr} 2-layer map? (No: probably just append
 * ns string to the lname with some kind of prefix)  In the qname map, I have
 * to be prepared to have more than one Attr that matches, so it maps to an
 * attr or an array of attrs.
 *
 * the byNSAndLName map will work by using ns + "|" + lname as the map key "|"
 * is not legal in a localname, so this should be unique.  If ns is "" or null
 * then we'll use "|" + lname.  (I think that null and "" namespaces should
 * always be treated as equivalent.)
 */
defineLazyProperty(impl, "Attributes", function() {

    function Attributes(element) {
        this.element = element;  // The element to which these attributes belong
        this.length = 0;         // How many attributes are there?
        this.byQName = Object.create(null);      // The qname->Attr map
        this.byNSAndLName = Object.create(null); // The ns|lname map
    }

    Attributes.prototype = O.create(Object.prototype, {
        _idlName: constant("AttrArray"),

        getAttribute: constant(function getAttribute(qname) {
            if (this.element.isHTML) qname = toLowerCase(qname);
            var attr = this.byQName[qname];
            if (!attr) return null;

            if (isArray(attr))  // If there is more than one
                attr = attr[0];   // use the first

            return attr.value;
        }),

        // The raw version is used by the getter functions of idl attributes
        // Note that it doesn't do lowercasing
        getAttributeRaw: constant(function getAttribute(qname) {
            var attr = this.byQName[qname];
            if (!attr) return null;

            // XXX Reflected attributes will never have a prefix, so does that
            // mean I can get rid of this isArray test? Think this through...
            if (isArray(attr))  // If there is more than one
                attr = attr[0];   // use the first

            return attr.data;   // The raw value
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
            if (ns === null) ns = "";
            var attr = this.byNSAndLName[ns + "|" + lname];
            return attr ? attr.value : null;
        }),
        
        hasAttribute: constant(function hasAttribute(qname) {
            if (this.element.isHTML) qname = toLowerCase(qname);
            return this.byQName[qname] !== null
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
            if (ns === null) ns = "";
            return this.byNSAndLName[ns + "|" + lname] !== null;
        }),

        setAttribute: constant(function setAttribute(qname, value) {
            if (!isValidName(qname)) InvalidCharacterError();
            if (this.element.isHTML) qname = toLowerCase(qname);
            // XXX: the spec says just "xmlns". I've added the colon
            // and have an email pending on www-dom about it.
            if (substring(qname, 0, 6) === "xmlns:") NamespaceError();

            // XXX: the spec says that this next search should be done 
            // on the local name, but I think that is an error.
            // email pending on www-dom about it.
            var attr = this.byQName[qname];
            if (!attr) {
                // If the attr doesn't exist, create it and insert it.
                attr = new impl.Attr(this.element, qname);
                this.byQName[qname] = attr;
                this.byNSAndLName["|" + qname] = attr;
                this.length++;
            }
            else {
                if (isArray(attr)) attr = attr[0];
            }

            // Now set the attribute value on the new or existing Attr object.
            // The Attr.value setter method handles mutation events, etc.
            attr.value = value;
        }),
        
        // XXX: setAttributeRaw() here?
        // Would be a lot of duplication to copy the whole method and 
        // just change the last line.  Maybe add a "raw" flag as a 3rd argument?
        

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

            var key = (ns||"") + "|" + lname;
            var attr = this.byNSAndLName[key];
            if (!attr) {
                var attr = new impl.Attr(this.element, lname, prefix, ns);
                this.byNSAndLName[key] = attr;

                // We also have to make the attr searchable by qname.
                // But we have to be careful because there may already
                // be an attr with this qname.
                var existing = this.byQName[qname];
                if (!existing) {
                    this.byQName[qname] = attr;
                }
                else if (isArray(existing)) {
                    push(existing, attr);
                }
                else {
                    this.byQName[qname] = [existing, attr];
                }
            }
            else {
                // existing attributes may have their prefix changed
                attr.prefix = prefix;
            }
            attr.value = value; // Automatically sends mutation event
        }),


        removeAttribute: constant(function removeAttribute(qname) {
            if (this.element.isHTML) qname = toLowerCase(qname);

            var attr = this.byQName[qname];
            if (!attr) return;

            // If there is more than one match for this qname
            // so don't delete the qname mapping, just remove the first
            // element from it.
            if (isArray(attr)) {
                if (attr.length > 2) {
                    attr = A.shift(attr);  // remove it from the array
                }
                else {
                    this.byQName[qname] = attr[1];
                    attr = attr[0];
                }
            }
            else {
                // only a single match, so remove the qname mapping
                delete this.byQName[qname];
            }

            // Now attr is the removed attribute.  Figure out its
            // ns+lname key and remove it from the other mapping as well.
            var key = (attr.namespaceURI || "") + "|" + attr.localName;
            delete this.byNSAndLName[key];

            // Mutation event
            if (this.element.rooted)
                this.element.ownerDocument.mutateRemoveAttr(attr);
        }),

        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
            var key = (ns || "") + "|" + lname;
            var attr = this.byNSAndLName[key];
            if (!attr) return;

            delete this.byNSAndLName[key];

            // Now find the same Attr object in the qname mapping and remove it
            // But be careful because there may be more than one match.
            var qname = attr.name;
            var target = this.byQName[qname];

            if (isArray(target)) {
                var idx = A.indexOf(target, attr);
                assert(idx !== -1); // It must be here somewhere
                if (target.length === 2) {
                    this.byQName[qname] = target[1-idx];
                }
                else {
                    splice(target, idx, 1)
                }
            }
            else {
                assert(target === attr);  // If only one, it must match
                delete this.byQName[qname];
            }
        }),

    });

    return Attributes;
});
