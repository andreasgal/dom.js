defineLazyProperty(global, "Node", function() {
    return idl.Node.publicInterface;
}, true);

defineLazyProperty(idl, "Node", function() {
    return implementIDLInterface({
        name: "Node",
        superclass: idl.EventTarget,
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
                return unwrap(this).nodeType;
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
                return unwrap(this).nodeName;
            },

            // readonly attribute DOMString baseURI;
            get baseURI() { nyi(); },

            // readonly attribute Document ownerDocument; 
            // The ownerDocument attribute must return the Document
            // node that the context object is associated with, or
            // null if there is none.
            get ownerDocument() {
                return wrap(unwrap(this).ownerDocument);
            },

            // readonly attribute Node parentNode;
            // The parentNode attribute must return the parent.
            get parentNode() {
                return wrap(unwrap(this).parentNode);
            },

            // readonly attribute Element parentElement;
            // The parentElement attribute must return the parent element.
            get parentElement() { 
                return wrap(unwrap(this).parentElement);
            },

            // boolean hasChildNodes();
            // The hasChildNodes() method must return false if the
            // context object has no children, or true otherwise.
            hasChildNodes: function hasChildNodes() { 
                return unwrap(this).hasChildNodes();
            },

            // readonly attribute NodeList childNodes;
            // The childNodes attribute must return a NodeList rooted
            // at the context object matching only children.
            get childNodes() {
                return wrap(unwrap(this).childNodes, idl.NodeList);
            },

            // readonly attribute Node firstChild; 
            // The firstChild attribute must return the first child of
            // the context object, or null if there is none.
            get firstChild() {
                return wrap(unwrap(this).firstChild);
            },

            // readonly attribute Node lastChild;
            // The lastChild attribute must return the last child of
            // the context object, or null if there is none.
            get lastChild() {
                return wrap(unwrap(this).lastChild);
            },

            // readonly attribute Node previousSibling;
            // The previousSibling attribute must return the first
            // previous sibling of the context object, or null if
            // there is none.
            get previousSibling() { 
                return wrap(unwrap(this).previousSibling);
            },
            
            // readonly attribute Node nextSibling;
            // The nextSibling attribute must return the first next
            // sibling of the context object, or null if there is
            // none.
            get nextSibling() {
                return wrap(unwrap(this).nextSibling);
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
                return unwrap(this).compareDocumentPosition(unwrap(other));
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
                return unwrap(this).nodeValue;
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
                unwrap(this).nodeValue = newval;
            },

            // attribute DOMString textContent;
            //
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
                return unwrap(this).textContent;
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
                unwrap(this).textContent = newval;
            },

            insertBefore: function insertBefore(newChild, refChild) {
                unwrap(this).insertBefore(unwrap(newChild), unwrap(refChild));
                return newChild;
            },


            replaceChild: function replaceChild(newChild, oldChild) {
                unwrap(this).replaceChild(unwrap(newChild), unwrap(oldChild));
                return newChild;
            },

            // Node removeChild([NoNull] Node oldChild);
            removeChild: function removeChild(oldChild) {
                unwrap(this).removeChild(unwrap(oldChild));
                return oldChild;
            },

            appendChild: function appendChild(newChild) { 
                unwrap(this).appendChild(unwrap(newChild));
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
