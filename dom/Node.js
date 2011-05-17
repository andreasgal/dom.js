/*

interface Node : EventTarget {
  const unsigned short ELEMENT_NODE = 1;
  const unsigned short ATTRIBUTE_NODE = 2; // historical
  const unsigned short TEXT_NODE = 3;
  const unsigned short CDATA_SECTION_NODE = 4; // historical
  const unsigned short ENTITY_REFERENCE_NODE = 5; // historical
  const unsigned short ENTITY_NODE = 6; // historical
  const unsigned short PROCESSING_INSTRUCTION_NODE = 7;
  const unsigned short COMMENT_NODE = 8;
  const unsigned short DOCUMENT_NODE = 9;
  const unsigned short DOCUMENT_TYPE_NODE = 10;
  const unsigned short DOCUMENT_FRAGMENT_NODE = 11;
  const unsigned short NOTATION_NODE = 12; // historical
  readonly attribute unsigned short nodeType;
  readonly attribute DOMString nodeName;

  readonly attribute DOMString baseURI;

  readonly attribute Document ownerDocument;
  readonly attribute Node parentNode;
  readonly attribute Element parentElement;
  boolean hasChildNodes();
  readonly attribute NodeList childNodes;
  readonly attribute Node firstChild;
  readonly attribute Node lastChild;
  readonly attribute Node previousSibling;
  readonly attribute Node nextSibling;

  const unsigned short DOCUMENT_POSITION_DISCONNECTED = 0x01;
  const unsigned short DOCUMENT_POSITION_PRECEDING = 0x02;
  const unsigned short DOCUMENT_POSITION_FOLLOWING = 0x04;
  const unsigned short DOCUMENT_POSITION_CONTAINS = 0x08;
  const unsigned short DOCUMENT_POSITION_CONTAINED_BY = 0x10;
  const unsigned short DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;
  unsigned short compareDocumentPosition(Node other);

           attribute DOMString nodeValue;
           attribute DOMString textContent;
  Node insertBefore([NoNull] Node newChild, Node refChild);
  Node replaceChild([NoNull] Node newChild, [NoNull] Node oldChild);
  Node removeChild([NoNull] Node oldChild);
  Node appendChild([NoNull] Node newChild);

  Node cloneNode(boolean deep);
  boolean isSameNode(Node node);
  boolean isEqualNode(Node node);

  DOMString lookupPrefix([TreatNullAs=EmptyString] DOMString namespace);
  DOMString lookupNamespaceURI(DOMString? prefix);
  boolean isDefaultNamespace([TreatNullAs=EmptyString] DOMString namespace);
};

The nodeType attribute must return the type of the node, which must be one of the following:

    ELEMENT_NODE (1);
    ATTRIBUTE_NODE (2, historical);
    TEXT_NODE (3);
    CDATA_SECTION_NODE (4, historical);
    ENTITY_REFERENCE_NODE (5, historical);
    ENTITY_NODE (6, historical);
    PROCESSING_INSTRUCTION_NODE (7);
    COMMENT_NODE (8);
    DOCUMENT_NODE (9);
    DOCUMENT_TYPE_NODE (10);
    DOCUMENT_FRAGMENT_NODE (11);
    NOTATION_NODE (12, historical). 

The nodeName attribute must return the following, depending on the context object:

Element

    The context object's tagName attribute. 
Text

    "#text". 
ProcessingInstruction

    The context object's target attribute. 
Comment

    "#comment". 
Document

    "#document". 
DocumentType

    The context object's name attribute. 
DocumentFragment

    "#document-fragment". 


The ownerDocument attribute must return the Document node that the context object is associated with, or null if there is none.

The parentNode attribute must return the parent.

The parentElement attribute must return the parent element.

The hasChildNodes() method must return false if the context object has no children, or true otherwise.

The childNodes attribute must return a NodeList rooted at the context object matching only children.

The firstChild attribute must return the first child of the context object, or null if there is none.

The lastChild attribute must return the last child of the context object, or null if there is none.

The previousSibling attribute must return the first previous sibling of the context object, or null if there is none.

The nextSibling attribute must return the first next sibling of the context object, or null if there is none.

These are the constants compareDocumentPosition() returns.

    DOCUMENT_POSITION_DISCONNECTED (1);
    DOCUMENT_POSITION_PRECEDING (2);
    DOCUMENT_POSITION_FOLLOWING (4);
    DOCUMENT_POSITION_CONTAINS (8);
    DOCUMENT_POSITION_CONTAINED_BY (16);
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC (32). 

The nodeValue attribute must return the following, depending on the context object:

Text
Comment
ProcessingInstruction

    The context object's textContent attribute. 
Any other node

    Null. 

Setting the nodeValue attribute must do as described below, depending on the context object:

Text
Comment
ProcessingInstruction

    Set the context object's textContent attribute to the given value. 
Any other node

    Do nothing. 

The textContent attribute must return the following, depending on the context object:

DocumentFragment
Element

    The concatenation of the data attributes of all the Text object descendants of the context object, in tree order. 
Text
Comment

    The context object's data attribute. 
ProcessingInstruction

    The context object's data attribute. 
Any other node
    Null. 

Setting the textContent attribute must do as described below, depending on the context object:

DocumentFragment
Element

        Remove all the descendants of the context object.

        Let data be the given value.

        If data is not the empty string, append a new Text node to the context object whose data is set to data. 

Text
Comment

    Set context object's data attribute to the given value. 
ProcessingInstruction

    Set the context object's data attribute to the given value. 
Any other node
    Do nothing. 

The insertBefore(newChild, refChild) method must run these steps:

    If the context object is not a Document, DocumentFragment or Element, throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If refChild is null, return the result of invoking context object's appendChild with newChild as argument and terminate these steps.

    If refChild is not a child of the context object, then throw a NOT_FOUND_ERR exception and terminate these steps.

    If newChild is the context object or an ancestor of the context object throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If newChild is a DocumentType node and its ownerDocument is not null throw a NOT_SUPPORTED_ERR exception and terminate these steps.

    If newChild is a DocumentType node set its ownerDocument to the context object's ownerDocument.

    If newChild is not a DocumentType node let newChild be the result of invoking the context object's ownerDocument adoptNode method with newChild as its argument.

    If newChild is a DocumentFragment node, insert the children of newChild in the context object, in tree order, so that the last child becomes the previous sibling of refChild.

    Otherwise insert newChild in the context object as the previous sibling of refChild.

    Return newChild. 

The replaceChild(newChild, oldChild) method must run these steps:

    If the context object is not a Document, DocumentFragment or Element, throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If oldChild is not a child of the context object, then throw a NOT_FOUND_ERR exception and terminate these steps.

    If newChild is the context object or an ancestor of the context object throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If newChild is a DocumentType node and its ownerDocument is not null throw a NOT_SUPPORTED_ERR exception and terminate these steps.

    If newChild is a DocumentType node set its ownerDocument to the context object's ownerDocument.

    If newChild is not a DocumentType node let newChild be the result of invoking the context object's ownerDocument adoptNode method with newChild as its argument.

    Let refChild be oldChild's first next sibling.

    Remove oldChild from the context object.

    Return the result of invoking the context object's insertBefore method with newChild and refChild as arguments. 

The removeChild(oldChild) method must run these steps:

    If the context object is not a Document, DocumentFragment or Element, throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If oldChild is not a child of the context object, then throw a NOT_FOUND_ERR exception and terminate these steps.

    Remove oldChild from the context object.

    Return oldChild. 

The appendChild(newChild) method must run these steps:

    If the context object is not a Document, DocumentFragment or Element, throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If newChild is the context object or an ancestor of the context object throw a HIERARCHY_REQUEST_ERR and terminate these steps.

    If newChild is a DocumentType node and its ownerDocument is not null throw a NOT_SUPPORTED_ERR exception and terminate these steps.

    If newChild is a DocumentType node set its ownerDocument to the context object's ownerDocument.

    If newChild is not a DocumentType node let newChild be the result of invoking the context object's ownerDocument adoptNode method with newChild as its argument.

    Append newChild to the context object.

    Return newChild. 

The cloneNode(deep) method must return a clone of the context object, with new ownerDocument being the context object's ownerDocument, and the clone children flag set if deep is true.

The isSameNode(node) method must return true if node is a reference to the same object as the context object, and false otherwise.

The isEqualNode(node) method must return true if all of the following conditions are true, and false otherwise:

    node is not null.

    node's nodeType is the same as the context object's nodeType.

    node's nodeName is the same as the context object's nodeName.

    node's nodeValue is the same as the context object's nodeValue.

    The following are also equal, depending on node:

    DocumentType

        Its name, public ID, and system ID. 
    Element

        Its namespace, namespace prefix, local name, and its associated collection of Attr objects. 
    Text
    Comment

        Its data. 
    ProcessingInstruction

        Its target and data. 
    Any other node

        — 

    node's childNodes' length is the same as the context object's childNodes' length.

    Calling isEqualNode on each child node of the context object, with the child node of the same index in node as argument returns true for every child node. 


The lookupPrefix(namespace) method must run these steps:

    If namespace is the empty string return null.

    Otherwise it depends on the context object:

    Element

        Return the result of locating a namespace prefix for the node using namespace. 
    Document

        Return the result of locating a namespace prefix for its documentElement, if that is not null, or null otherwise. 
    DocumentType
    DocumentFragment

        Return null. 
    Any other node

        Return the result of locating a namespace prefix for its parent element, or if that is null, null. 

The lookupNamespaceURI(prefix) method must return the result of running locate a namespace for the context object using prefix.

The isDefaultNamespace(namespace) method must run these steps:

    Let defaultNamespace be the result of invoking lookupNamespaceURI with null as argument on the context object.

    If defaultNamespace is null let it be the empty string.

    Return true if defaultNamespace is namespace, or false otherwise. 
*/

defineLazyProperty(DOM, "Node", function() {
    function Node(impl) {
        EventTarget(impl);
    }

    Node.prototype = Object.create(EventTarget.prototype)
});
