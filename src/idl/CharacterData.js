defineLazyProperty(global, "CharacterData", function() {
    return idl.CharacterData.publicInterface;
}, true);

defineLazyProperty(idl, "CharacterData", function() {
    return implementIDLInterface({
        name: "CharacterData",
        superclass: idl.Node,
        members: {
            // [TreatNullAs=EmptyString] attribute DOMString data;
            // The data attribute must return the data of the node, and on
            // setting, must change the node's data to the new value.
            get data() { return unwrap(this).data; },
            set data(newval) { unwrap(this).data = StringOrEmpty(newval); },

            // readonly attribute unsigned long length;
            // The length attribute must return the number of UTF-16 code units
            // represented by the node's data.
            get length() { return unwrap(this).data.length; },

            // The following methods are defined at this level rather than 
            // in dom/text.js and dom/comment.js because they are probably
            // just slightly more efficient here.


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
                let data = unwrap(this).data, length = data.length;
                if (offset > length) IndexSizeError();
                return substring(data, offset, offset+count);
            },

            // void appendData(DOMString data);
            // The appendData(data) method must append data to the context
            // object's data.
            appendData: function appendData(data) {
                data = String(data);
                let impl = unwrap(this);
                impl.data = impl.data + data;
            },

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
            insertData: function insertData(offset, data) {
                offset = toULong(offset);
                data = String(data);

                let impl = unwrap(this),
                    curtext = impl.data;
                if (offset > curtext.length) IndexSizeError();
                let prefix = substring(curtext, 0, offset), 
                    suffix = substring(curtext, offset);
                impl.data = prefix + data + suffix;
            },
            

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
            deleteData: function deleteData(offset, count) {
                offset = toULong(offset);
                count = toULong(count);

                let impl = unwrap(this),
                    curtext = impl.value,
                    len = curtext.length;

                if (offset > len) IndexSizeError();
                    
                if (offset+count > len)
                    count = len - offset;

                let prefix = substring(curtext, 0, offset),
                    suffix = substring(curtext, offset+count);

                impl.data = prefix + suffix;
            },


            // void replaceData(unsigned long offset, unsigned long count,
            //                  DOMString data);
            // 
            // The replaceData(offset, count, data) method must act as
            // if the deleteData() method is invoked with offset and
            // count as arguments followed by the insertData() method
            // with offset and data as arguments and re-throw any
            // exceptions these methods might have thrown.
            replaceData: function replaceData(offset, count, data) {
                offset = toULong(offset);
                count = toULong(count);
                data = String(data);

                let impl = unwrap(this),
                    curtext = impl.value,
                    len = curtext.length;

                if (offset > len) IndexSizeError();
                    
                if (offset+count > len)
                    count = len - offset;

                let prefix = substring(curtext, 0, offset),
                    suffix = substring(curtext, offset+count);

                impl.data = prefix + data + suffix;
            },
        }
    });
});
