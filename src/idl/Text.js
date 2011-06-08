// The Text interface is a subtype of CharacterData.  It adds three methods.
defineLazyProperty(global, "Text", function() {
    return idl.Text.publicInterface;
}, true);

defineLazyProperty(idl, "Text", function() {
    return implementIDLInterface({
        name: "Text",
        superclass: idl.CharacterData,
        members: {
            // Text splitText(unsigned long offset);
            //
            // The splitText(offset) method must run the following
            // steps:
            //
            // If offset is greater than the context object's length,
            // throw an INDEX_SIZE_ERR exception and terminate these
            // steps.
            //
            // Let length be the context object's length − offset.
            //
            // Call the context object's substringData method with
            // offset and length as its arguments. If this threw an
            // exception, terminate these steps. Otherwise, let new
            // data be the value returned.
            //
            // Call the context object's deleteData method with offset
            // and length as its arguments. If this threw an
            // exception, terminate these steps.
            //
            // Let new node be a new Text object, with the same
            // ownerDocument as the context object. Set new node's
            // data to new data.
            //
            // Let parent be the context object's parent. If parent is
            // null, return new node and terminate these steps.
            //
            // Call parent's insertBefore method with new node and the
            // context object's first next sibling as its argument.
            //
            // Return new node.
            //
            splitText: function splitText(offset) { nyi(); },

            // readonly attribute DOMString wholeText;
            // XXX: not stable in the spec, yet, so not implemented yet
            get wholeText() { nyi(); },

            // Text replaceWholeText(DOMString data);       
            // XXX: not stable in the spec, yet, so not implemented yet
            replaceWholeText: function replaceWholeText(data) { nyi(); }
        }
    });
});
