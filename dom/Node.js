// DOM node type constants
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;

// Constants used in the return value of compareDocumentPosition
const DOCUMENT_POSITION_DISCONNECTED = 0x01;
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;
const DOCUMENT_POSITION_CONTAINS = 0x08;
const DOCUMENT_POSITION_CONTAINED_BY = 0x10;
const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

defineLazyProperty(global, "Node", function() {
    return DOM.Node.interface;
}, true);

defineLazyProperty(DOM, "Node", function() {
    return implementIDLInterface({
        name: "Node",
        superclass: DOM.EventTarget,
        init: function(impl) { },
        constants: {
            ELEMENT_NODE: ELEMENT_NODE,
            ATTRIBUTE_NODE: 2,         // historical
            TEXT_NODE: TEXT_NODE,
            CDATA_SECTION_NODE: 4,     // historical
            ENTITY_REFERENCE_NODE: 5,  // historical
            ENTITY_NODE: 6,            // historical
            PROCESSING_INSTRUCTION_NODE: PROCESSING_INSTRUCTION_NODE,
            COMMENT_NODE: COMMENT_NODE,
            DOCUMENT_NODE: DOCUMENT_NODE,
            DOCUMENT_TYPE_NODE: DOCUMENT_TYPE_NODE,
            DOCUMENT_FRAGMENT_NODE: DOCUMENT_FRAGMENT_NODE,
            NOTATION_NODE: 12,         // historical

            DOCUMENT_POSITION_DISCONNECTED: DOCUMENT_POSITION_DISCONNECTED,
            DOCUMENT_POSITION_PRECEDING: DOCUMENT_POSITION_PRECEDING,
            DOCUMENT_POSITION_FOLLOWING: DOCUMENT_POSITION_FOLLOWING,
            DOCUMENT_POSITION_CONTAINS: DOCUMENT_POSITION_CONTAINS,
            DOCUMENT_POSITION_CONTAINED_BY: DOCUMENT_POSITION_CONTAINED_BY,
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:
               DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,
        },
        members: {
            // readonly attribute unsigned short nodeType;
	    // The nodeType attribute must return the type of the
	    // node, which must be one of the following:
	    //     ELEMENT_NODE (1);
	    //     ATTRIBUTE_NODE (2, historical);
	    //     TEXT_NODE (3);
	    //     CDATA_SECTION_NODE (4, historical);
	    //     ENTITY_REFERENCE_NODE (5, historical);
	    //     ENTITY_NODE (6, historical);
	    //     PROCESSING_INSTRUCTION_NODE (7);
	    //     COMMENT_NODE (8);
	    //     DOCUMENT_NODE (9);
	    //     DOCUMENT_TYPE_NODE (10);
	    //     DOCUMENT_FRAGMENT_NODE (11);
	    //     NOTATION_NODE (12, historical). 
            get nodeType() {
		// In order to avoid looking up the implementation object
		// in the weak map, I could based this on the constructor
		// property. But WebIDL says that property is writable, so
		// that is not a safe optimization.
		return unwrap(this).type;
	    },

            // readonly attribute DOMString nodeName;
	    // The nodeName attribute must return the following,
	    // depending on the context object:
	    // Element
	    //     The context object's tagName attribute. 
	    // Text
	    //     "#text". 
	    // ProcessingInstruction
	    //     The context object's target attribute. 
	    // Comment
	    //     "#comment". 
	    // Document
	    //     "#document". 
	    // DocumentType
	    //     The context object's name attribute. 
	    // DocumentFragment
	    //     "#document-fragment". 
	    //
            get nodeName() {
		let impl = unwrap(this);
		switch(impl.type) {  // Cases roughly in order of frequency
		case ELEMENT_NODE:
		    return impl.value;
		case TEXT_NODE:
		    return "#text";
		case DOCUMENT_NODE:
		    return "#document";
		case COMMENT_NODE:
		    return "#comment";
		case DOCUMENT_TYPE_NODE:
		    return impl.value;  // XXX?
		case DOCUMENT_FRAGMENT_NODE:
		    return "#document-fragment";
		case PROCESSING_INSTRUCTION_NODE:
		    return impl.target;
		}
	    },

            // readonly attribute DOMString baseURI;
            get baseURI() { nyi(); },

            // readonly attribute Document ownerDocument; 
	    // The ownerDocument attribute must return the Document
	    // node that the context object is associated with, or
	    // null if there is none.
            get ownerDocument() { return wrap(unwrap(this).doc); },

            // readonly attribute Node parentNode;
	    // The parentNode attribute must return the parent.
            get parentNode() {
		let parent = unwrap(this).parent;
		return parent ? wrap(parent) : null;
	    },

            // readonly attribute Element parentElement;
	    // The parentElement attribute must return the parent element.
            get parentElement() { 
		let parent = unwrap(this).parent;
		return (parent && parent.type === ELEMENT_NODE) ?
		    wrap(parent) :
		    null;
	    },

            // boolean hasChildNodes();
	    // The hasChildNodes() method must return false if the
	    // context object has no children, or true otherwise.
            hasChildNodes: function hasChildNodes() { 
		let impl = unwrap(this);
		return !!(impl.kids && impl.kids.length);
	    },

            // readonly attribute NodeList childNodes;
	    // The childNodes attribute must return a NodeList rooted
	    // at the context object matching only children.
            get childNodes() { nyi(); },

            // readonly attribute Node firstChild; 
	    // The firstChild attribute must return the first child of
	    // the context object, or null if there is none.
            get firstChild() {
		let kids = unwrap(this).kids;
		if (kids && kids.length > 0) return wrap(kids[0]);
		else return null;
	    },

            // readonly attribute Node lastChild;
	    // The lastChild attribute must return the last child of
	    // the context object, or null if there is none.
            get lastChild() {
		let kids = unwrap(this).kids;
		if (kids && kids.length > 0) return wrap(kids[kids.length-1]);
		else return null;
	    },

            // readonly attribute Node previousSibling;
	    // The previousSibling attribute must return the first
	    // previous sibling of the context object, or null if
	    // there is none.
            get previousSibling() { 
		let impl = unwrap(this);
		if (impl.parent) {
		    let index = impl.index();
		    if (index > 0) return wrap(impl.parent.kids[index-1]);
		}
		return null;
	    },
            
            // readonly attribute Node nextSibling;
	    // The nextSibling attribute must return the first next
	    // sibling of the context object, or null if there is
	    // none.
            get nextSibling() {
		let impl = unwrap(this);
		if (impl.parent) {
		    let index = impl.index();
		    if (index < impl.parent.kids.length-1)
			return wrap(impl.parent.kids[index+1]);
		}
		return null;
	    },

            // unsigned short compareDocumentPosition(Node other);
	    // 
	    // These are the constants compareDocumentPosition() returns.
	    //     DOCUMENT_POSITION_DISCONNECTED (1);
	    //     DOCUMENT_POSITION_PRECEDING (2);
	    //     DOCUMENT_POSITION_FOLLOWING (4);
	    //     DOCUMENT_POSITION_CONTAINS (8);
	    //     DOCUMENT_POSITION_CONTAINED_BY (16);
	    //     DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC (32). 
            compareDocumentPosition: function compareDocumentPosition(other) {
                nyi();
            },

            // attribute DOMString nodeValue;

	    // The nodeValue attribute must return the following,
	    // depending on the context object:
	    // Text
	    // Comment
	    // ProcessingInstruction
	    //     The context object's textContent attribute. 
	    // Any other node
	    //     Null. 
            get nodeValue() {
		let impl = unwrap(this);
		switch(impl.type) {
		case TEXT_NODE:
		case COMMENT_NODE:
		case PROCESSING_INSTRUCTION_NODE:
		    return impl.value;
		default:
		    return null;
		}
	    },

	    // Setting the nodeValue attribute must do as described
	    // below, depending on the context object:
	    // Text
	    // Comment
	    // ProcessingInstruction
	    //     Set the context object's textContent attribute to
	    //     the given value. 
	    // Any other node
	    //     Do nothing. 
            set nodeValue(newval) {
		let impl = unwrap(this);
		newval = String(newval);
		switch(impl.type) {
		case TEXT_NODE:
		case COMMENT_NODE:
		case PROCESSING_INSTRUCTION_NODE:
		    impl.setText(newval);
		}
	    },

            // attribute DOMString textContent;

	    // The textContent attribute must return the following,
	    // depending on the context object:
	    // DocumentFragment
	    // Element
	    //     The concatenation of the data attributes of all the
	    //     Text object descendants of the context object, in
	    //     tree order.
	    // 
	    // Text
	    // Comment
	    //     The context object's data attribute. 
	    // 
	    // ProcessingInstruction
	    //     The context object's data attribute. 
	    // 
	    // Any other node
	    //     Null. 
	    // 
            get textContent() {
		let impl = unwrap(this);
		switch(impl.type) {
		case TEXT_NODE:
		case COMMENT_NODE:
		case PROCESSING_INSTRUCTION_NODE:
		    return impl.value;
		case ELEMENT_NODE:
		case DOCUMENT_FRAGMENT_NODE:
		    nyi();
		default:
		    return null;
		}
	    },


	    // Setting the textContent attribute must do as described
	    // below, depending on the context object:
	    // 
	    // DocumentFragment
	    // Element
	    //         Remove all the descendants of the context object.
	    //         Let data be the given value.
	    //         If data is not the empty string, append a new
	    //         Text node to the context object whose data is
	    //         set to data.
	    //
	    // Text
	    // Comment
	    //     Set context object's data attribute to the given value. 
	    //
	    // ProcessingInstruction
	    //     Set the context object's data attribute to the given value. 
	    //
	    // Any other node
	    //     Do nothing. 
            set textContent(newval) { 
		let impl = unwrap(this);
		newval = String(newval);
		switch(impl.type) {
		case TEXT_NODE:
		case COMMENT_NODE:
		case PROCESSING_INSTRUCTION_NODE:
		    impl.setText(newval);
		    return;
		case ELEMENT_NODE:
		case DOCUMENT_FRAGMENT_NODE:
		    nyi();
		}
	    },

            // Node insertBefore([NoNull] Node newChild, Node refChild);
	    // 
	    // The insertBefore(newChild, refChild) method must run these steps:
	    //
	    //     If the context object is not a Document,
	    //     DocumentFragment or Element, throw a
	    //     HIERARCHY_REQUEST_ERR and terminate these steps.
	    //
	    //     If refChild is null, return the result of invoking
	    //     context object's appendChild with newChild as
	    //     argument and terminate these steps.
	    //
	    //     If refChild is not a child of the context object,
	    //     then throw a NOT_FOUND_ERR exception and terminate
	    //     these steps.
	    //
	    //     If newChild is the context object or an ancestor of
	    //     the context object throw a HIERARCHY_REQUEST_ERR
	    //     and terminate these steps.
	    //
	    //     If newChild is a DocumentType node and its
	    //     ownerDocument is not null throw a NOT_SUPPORTED_ERR
	    //     exception and terminate these steps.
	    //
	    //     If newChild is a DocumentType node set its
	    //     ownerDocument to the context object's
	    //     ownerDocument.
	    //
	    //     If newChild is not a DocumentType node let newChild
	    //     be the result of invoking the context object's
	    //     ownerDocument adoptNode method with newChild as its
	    //     argument.
	    //
	    //     If newChild is a DocumentFragment node, insert the
	    //     children of newChild in the context object, in tree
	    //     order, so that the last child becomes the previous
	    //     sibling of refChild.
	    //
	    //     Otherwise insert newChild in the context object as
	    //     the previous sibling of refChild.
	    //
	    //     Return newChild. 
            insertBefore: function insertBefore(newChild, refChild) {
                if (refChild == null) // Also treat undefined as null
                    return this.appendChild(newChild);

                let parent = unwrap(this);

                if (parent.type !== ELEMENT_NODE &&
                    parent.type !== DOCUMENT_NODE &&
                    parent.type !== DOCUMENT_FRAGMENT_NODE)
                    throw new DOM.DOMException(HIERARCHY_REQUEST_ERR);

                let target = unwrap(refChild);
                if (target.parent !== parent)
                    throw new DOM.DOMException(NOT_FOUND_ERR);

                let child = unwrap(newChild);

                if (child.isAncestor(parent))
                    throw new DOM.DOMException(HIERARCHY_REQUEST_ERR);
                    
                // XXX: how can this happen?
                // Check the doctype creation functions
                if (child.type == DOCUMENT_TYPE_NODE) {
                    if (child.doc != null) 
                        throw new DOM.DOMException(NOT_SUPPORTED_ERR);
                    else 
                        child.doc = parent.doc;
                }

                if (child.type == DOCUMENT_FRAGMENT_NODE) {
                    for(let i = 0; i < child.kids.length; i++) {
                        let k = child.kids[i];
                        // Simplify the insertion by first removing the
                        // kid from the fragment
                        k.parent = null; 
                        k.insert(target);
                    }
                    // And remove all the kids from the fragment
                    child.kids.length = 0; 
                }
                else {
                    // This method handles the adoptNode details when needed
                    child.insert(target);
                }

                return newChild;
            },

            // Node replaceChild([NoNull] Node newChild,[NoNull] Node oldChild);
            //
	    // The replaceChild(newChild, oldChild) method must run these steps:
	    //
	    //     If the context object is not a Document,
	    //     DocumentFragment or Element, throw a
	    //     HIERARCHY_REQUEST_ERR and terminate these steps.
	    //
	    //     If oldChild is not a child of the context object,
	    //     then throw a NOT_FOUND_ERR exception and terminate
	    //     these steps.
	    //
	    //     If newChild is the context object or an ancestor of
	    //     the context object throw a HIERARCHY_REQUEST_ERR
	    //     and terminate these steps.
	    //
	    //     If newChild is a DocumentType node and its
	    //     ownerDocument is not null throw a NOT_SUPPORTED_ERR
	    //     exception and terminate these steps.
	    //
	    //     If newChild is a DocumentType node set its
	    //     ownerDocument to the context object's
	    //     ownerDocument.
	    //
	    //     If newChild is not a DocumentType node let newChild
	    //     be the result of invoking the context object's
	    //     ownerDocument adoptNode method with newChild as its
	    //     argument.
	    //
	    //     Let refChild be oldChild's first next sibling.
	    //
	    //     Remove oldChild from the context object.
	    //
	    //     Return the result of invoking the context object's
	    //     insertBefore method with newChild and refChild as
	    //     arguments.
	    //
            replaceChild: function replaceChild(newChild, oldChild) {
                // The error checking steps above seem to be performed
                // by the methods called below.
                let refChild = oldChild.nextSibling;
                this.removeChild(oldChild);
                return this.insertBefore(newChild, refChild);
            },

            // Node removeChild([NoNull] Node oldChild);
	    //
	    // The removeChild(oldChild) method must run these steps:
	    //
	    //     If the context object is not a Document,
	    //     DocumentFragment or Element, throw a
	    //     HIERARCHY_REQUEST_ERR and terminate these steps.
	    //
	    //     If oldChild is not a child of the context object,
	    //     then throw a NOT_FOUND_ERR exception and terminate
	    //     these steps.
	    //
	    //     Remove oldChild from the context object.
	    //
	    //     Return oldChild.
	    //
            removeChild: function removeChild(oldChild) {
                let parent = unwrap(this);
                if (parent.type !== ELEMENT_NODE &&
                    parent.type !== DOCUMENT_NODE &&
                    parent.type !== DOCUMENT_FRAGMENT_NODE)
                    throw new DOM.DOMException(HIERARCHY_REQUEST_ERR);

                let child = unwrap(oldChild);
                if (child.parent !== parent)
                    throw new DOM.DOMException(NOT_FOUND_ERR);

                child.remove();

                return oldChild;
            },

            // Node appendChild([NoNull] Node newChild);
	    // The appendChild(newChild) method must run these steps:
	    //
	    //     If the context object is not a Document,
	    //     DocumentFragment or Element, throw a
	    //     HIERARCHY_REQUEST_ERR and terminate these steps.
	    //
	    //     If newChild is the context object or an ancestor of
	    //     the context object throw a HIERARCHY_REQUEST_ERR
	    //     and terminate these steps.
	    //
	    //     If newChild is a DocumentType node and its
	    //     ownerDocument is not null throw a NOT_SUPPORTED_ERR
	    //     exception and terminate these steps.
	    //
	    //     If newChild is a DocumentType node set its
	    //     ownerDocument to the context object's
	    //     ownerDocument.
	    //
	    //     If newChild is not a DocumentType node let newChild
	    //     be the result of invoking the context object's
	    //     ownerDocument adoptNode method with newChild as its
	    //     argument.
	    //
	    //     Append newChild to the context object.
	    //
	    //     Return newChild.
            appendChild: function appendChild(newChild) { 
                let parent = unwrap(this);

                if (parent.type !== ELEMENT_NODE &&
                    parent.type !== DOCUMENT_NODE &&
                    parent.type !== DOCUMENT_FRAGMENT_NODE)
                    throw new DOM.DOMException(HIERARCHY_REQUEST_ERR);

                let child = unwrap(newChild);

                if (child.isAncestor(parent))
                    throw new DOM.DOMException(HIERARCHY_REQUEST_ERR);
                    
                // XXX: how can this happen?
                // Check the doctype creation functions
                if (child.type == DOCUMENT_TYPE_NODE) {
                    if (child.doc != null) 
                        throw new DOM.DOMException(NOT_SUPPORTED_ERR);
                    else 
                        child.doc = parent.doc;
                }

                if (child.type == DOCUMENT_FRAGMENT_NODE) {
                    for(let i = 0; i < child.kids.length; i++) {
                        let k = child.kids[i];
                        // Simplify the insertion by first removing the
                        // kid from the fragment
                        k.parent = null; 
                        k.append(parent);
                    }
                    // And remove all the kids from the fragment
                    child.kids.length = 0; 
                }
                else {
                    // This method handles the adoptNode details when needed
                    child.append(parent);
                }

                return newChild;
            },

            // Node cloneNode(boolean deep);
	    //
	    // The cloneNode(deep) method must return a clone of the
	    // context object, with new ownerDocument being the
	    // context object's ownerDocument, and the clone children
	    // flag set if deep is true.
            cloneNode: function cloneNode(deep) { nyi(); },

            // boolean isSameNode(Node node);
	    //
	    // The isSameNode(node) method must return true if node is
	    // a reference to the same object as the context object,
	    // and false otherwise.
            isSameNode: function isSameNode(node) { nyi(); },

            // boolean isEqualNode(Node node);
	    //
	    // The isEqualNode(node) method must return true if all of
	    // the following conditions are true, and false otherwise:
	    //
	    //     node is not null.
	    //
	    //     node's nodeType is the same as the context object's
	    //     nodeType.
	    //
	    //     node's nodeName is the same as the context object's
	    //     nodeName.
	    //
	    //     node's nodeValue is the same as the context
	    //     object's nodeValue.
	    //
	    //     The following are also equal, depending on node:
	    //
	    //     DocumentType
	    //
	    //         Its name, public ID, and system ID.
	    // 
	    //     Element
	    //
	    //         Its namespace, namespace prefix, local name,
	    //     and its associated collection of Attr objects.
	    //
	    //     Text Comment
	    //
	    //         Its data.
	    //
	    //     ProcessingInstruction
	    //
	    //         Its target and data.  
	    //
	    //     Any other node
	    //         —
	    //
	    //     node's childNodes' length is the same as the
	    //     context object's childNodes' length.
	    // 
	    //     Calling isEqualNode on each child node of the
	    //     context object, with the child node of the same
	    //     index in node as argument returns true for every
	    //     child node.
            isEqualNode: function isEqualNode(node) { nyi(); },

            // DOMString lookupPrefix([TreatNullAs=EmptyString] DOMString namespace);
	    //
	    // The lookupPrefix(namespace) method must run these steps:
	    //
	    //     If namespace is the empty string return null.
	    //
	    //     Otherwise it depends on the context object:
	    //
	    //     Element
	    //
	    //         Return the result of locating a namespace
	    //         prefix for the node using namespace.
	    //
	    //     Document
	    //
	    //         Return the result of locating a namespace
	    //         prefix for its documentElement, if that is not
	    //         null, or null otherwise.
	    //
	    //     DocumentType
	    //     DocumentFragment
	    //
	    //         Return null. 
	    //
	    //     Any other node
	    //
	    //         Return the result of locating a namespace
	    //         prefix for its parent element, or if that is
	    //         null, null.
            lookupPrefix: function lookupPrefix(namespace) { nyi(); },

            // DOMString lookupNamespaceURI(DOMString? prefix);
	    //
	    // The lookupNamespaceURI(prefix) method must return the
	    // result of running locate a namespace for the context
	    // object using prefix.
            lookupNamespaceURI: function lookupNamespaceURI(prefix) { nyi(); },

            // boolean isDefaultNamespace([TreatNullAs=EmptyString] DOMString namespace);

	    // The isDefaultNamespace(namespace) method must run these steps:
	    //
	    //     Let defaultNamespace be the result of invoking
	    //     lookupNamespaceURI with null as argument on the
	    //     context object.
	    //
	    //     If defaultNamespace is null let it be the empty string.
	    //
	    //     Return true if defaultNamespace is namespace, or
	    //     false otherwise.
            isDefaultNamespace: function isDefaultNamespace(namespace) {nyi();},
        }
    });
});
