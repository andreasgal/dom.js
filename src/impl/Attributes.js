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
 */
