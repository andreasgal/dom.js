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
            get data() { return unwrap(this).data || ""; },
            set data(newval) { unwrap(this).data = StringOrEmpty(newval); },

            // readonly attribute unsigned long length;
            // The length attribute must return the number of UTF-16 code units
            // represented by the node's data.
            get length() { return unwrap(this).data.length; },


            // DOMString substringData(unsigned long offset,
            //                         unsigned long count);
            substringData: function substringData(offset, count) {
                return unwrap(this).substringData(toULong(offset),
                                                  toULong(count));
            },

            // void appendData(DOMString data);
            appendData: function appendData(data) {
                unwrap(this).appendData(String(data));
            },

            // void insertData(unsigned long offset, DOMString data);
            insertData: function insertData(offset, data) {
                unwrap(this).insertData(toULong(offset), String(data));
            },
            

            // void deleteData(unsigned long offset, unsigned long count);
            deleteData: function deleteData(offset, count) {
                unwrap(this).deleteData(toULong(offset), toULong(count));
            },


            // void replaceData(unsigned long offset, unsigned long count,
            //                  DOMString data);
            replaceData: function replaceData(offset, count, data) {
                unwrap(this).replaceData(toULong(offset), 
                                         toULong(count),
                                         String(data));
            }
        }
    });
});
