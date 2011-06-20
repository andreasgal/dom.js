// This is a factory method for creating custom ArrayProxyHandlers
// But it can be used as a constructor with not too much inefficiency.
function AttrArrayProxyHandler(array) {
    return new ArrayProxyHandler(array, idl.AttrArray, idl.Attr);
}

// XXX: I need to modify tools/idl2domjs to detect the use of types 
// like Attr[] and automatically output the idl.AttrArray type.