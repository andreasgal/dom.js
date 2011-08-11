defineLazyProperty(impl, "CharacterData", function() {
    function CharacterData() {
    }
    
    CharacterData.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("CharacterData"),

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
        substringData: constant(function substringData(offset, count) {
            if (offset > this.data.length) IndexSizeError();
            return substring(this.data, offset, offset+count);
        }),

        // void appendData(DOMString data);
        // The appendData(data) method must append data to the context
        // object's data.
        appendData: constant(function appendData(data) {
            this.data = this.data + data;
        }),

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
        insertData: constant(function insertData(offset, data) {
            let curtext = this.data;
            if (offset > curtext.length) IndexSizeError();
            let prefix = substring(curtext, 0, offset), 
            suffix = substring(curtext, offset);
            this.data = prefix + data + suffix;
        }),
        

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
        deleteData: constant(function deleteData(offset, count) {
            let curtext = this.data, len = curtext.length;

            if (offset > len) IndexSizeError();
            
            if (offset+count > len)
                count = len - offset;

            let prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

            this.data = prefix + suffix;
        }),


        // void replaceData(unsigned long offset, unsigned long count,
        //                  DOMString data);
        // 
        // The replaceData(offset, count, data) method must act as
        // if the deleteData() method is invoked with offset and
        // count as arguments followed by the insertData() method
        // with offset and data as arguments and re-throw any
        // exceptions these methods might have thrown.
        replaceData: constant(function replaceData(offset, count, data) {
            let curtext = this.data, len = curtext.length;

            if (offset > len) IndexSizeError();
            
            if (offset+count > len)
                count = len - offset;

            let prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

            this.data = prefix + data + suffix;
        }),

        // Utility method that Node.isEqualNode() calls to test Text and
        // Comment nodes for equality.  It is okay to put it here, since
        // Node will have already verified that nodeType is equal
        isEqual: constant(function isEqual(n) {
            return this._data === n._data;
        }),

    });

    return CharacterData;
});