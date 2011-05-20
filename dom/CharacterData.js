defineLazyProperty(global, "CharacterData", function() {
    return DOM.CharacterData.interface;
}, true);

defineLazyProperty(DOM, "CharacterData", function() {
    return implementIDLInterface({
        name: "CharacterData",
        superclass: DOM.Node,
	init: function(impl) {},
	members: {
	    // [TreatNullAs=EmptyString] attribute DOMString data;
	    // The data attribute must return the data of the node, and on
	    // setting, must change the node's data to the new value.
	    get data() { return unwrap(this).value; },
	    set data(newval) {
		unwrap(this).setText(newval === null ? "" : String(newval));
	    },

	    // readonly attribute unsigned long length;
	    // The length attribute must return the number of UTF-16 code units
	    // represented by the node's data.
	    get length() { return unwrap(this).value.length; },

	    // DOMString substringData(unsigned long offset,
	    //                         unsigned long count);
	    // The substringData(offset, count) method must run these steps:
	    //
	    //     If offset is greater than the context object's
	    //     length, throw an INDEX_SIZE_ERR exception and
	    //     terminate these steps.
	    //
	    //     If offset+count is greater than the context
	    //     object's length, return a DOMString whose value is
	    //     the UTF-16 code units from the offsetth UTF-16 code
	    //     unit to the end of data.
	    //
	    //     Return a DOMString whose value is the UTF-16 code
	    //     units from the offsetth UTF-16 code unit to the
	    //     offset+countth UTF-16 code unit in data.
	    substringData: function substringData(offset, count) {
		offset = toULong(offset);
		count = toULong(count);
		let data = unwrap(this).value, length = data.length;

		if (offset > length) throw new DOM.DOMException(INDEX_SIZE_ERR);
		if (offset + count > length)
		    return data.substring(offset);
		else
		    return data.substring(offset, count);
	    },

	    // void appendData(DOMString data);
	    // The appendData(data) method must append data to the context
	    // object's data.
	    appendData: function appendData(data) { nyi(); },

	    // void insertData(unsigned long offset, DOMString data);
	    // The insertData(offset, data) method must run these steps:
	    //
	    //     If offset is greater than the context object's
	    //     length, throw an INDEX_SIZE_ERR exception and
	    //     terminate these steps.
	    //
	    //     Insert data into the context object's data after
	    //     offset UTF-16 code units.
	    //
	    insertData: function insertData(offset, data) { nyi(); },

	    // void deleteData(unsigned long offset, unsigned long count);
	    // The deleteData(offset, count) method must run these steps:
	    //
	    //     If offset is greater than the context object's
	    //     length, throw an INDEX_SIZE_ERR exception and
	    //     terminate these steps.
	    //
	    //     If offset+count is greater than the context
	    //     object's length let count be length-offset.
	    //
	    //     Starting from offset UTF-16 code units remove count
	    //     UTF-16 code units from the context object's data.
	    deleteData: function deleteData(offset, count) { nyi(); },


	    // void replaceData(unsigned long offset, unsigned long count,
	    //                  DOMString data);
	    // 
	    // The replaceData(offset, count, data) method must act as
	    // if the deleteData() method is invoked with offset and
	    // count as arguments followed by the insertData() method
	    // with offset and data as arguments and re-throw any
	    // exceptions these methods might have thrown.
	    replaceData: function replaceData(offset, count, data) { nyi(); },
	}
    });
});
