/*

exception DOMException {
  const unsigned short INDEX_SIZE_ERR = 1;
  const unsigned short DOMSTRING_SIZE_ERR = 2; // historical
  const unsigned short HIERARCHY_REQUEST_ERR = 3;
  const unsigned short WRONG_DOCUMENT_ERR = 4;
  const unsigned short INVALID_CHARACTER_ERR = 5;
  const unsigned short NO_DATA_ALLOWED_ERR = 6; // historical
  const unsigned short NO_MODIFICATION_ALLOWED_ERR = 7;
  const unsigned short NOT_FOUND_ERR = 8;
  const unsigned short NOT_SUPPORTED_ERR = 9;
  const unsigned short INUSE_ATTRIBUTE_ERR = 10; // historical
  const unsigned short INVALID_STATE_ERR = 11;
  const unsigned short SYNTAX_ERR = 12;
  const unsigned short INVALID_MODIFICATION_ERR = 13;
  const unsigned short NAMESPACE_ERR = 14;
  const unsigned short INVALID_ACCESS_ERR = 15;
  const unsigned short VALIDATION_ERR = 16; // historical
  const unsigned short TYPE_MISMATCH_ERR = 17;
  const unsigned short SECURITY_ERR = 18;
  const unsigned short NETWORK_ERR = 19;
  const unsigned short ABORT_ERR = 20;
  const unsigned short URL_MISMATCH_ERR = 21;
  const unsigned short QUOTA_EXCEEDED_ERR = 22;
  const unsigned short TIMEOUT_ERR = 23;
  const unsigned short INVALID_NODE_TYPE_ERR = 24;
  const unsigned short DATA_CLONE_ERR = 25;
  unsigned short code;
  DOMString name;
};

The code exception field must return the code for the exception, which must be one of the following:

    INDEX_SIZE_ERR (1): the index is not in the allowed range;
    DOMSTRING_SIZE_ERR (2): the text does not fit in a DOMString (historical);
    HIERARCHY_REQUEST_ERR (3): the operation would yield an incorrect nodes model;
    WRONG_DOCUMENT_ERR (4): the object is in the wrong Document, a call to importNode is required;
    INVALID_CHARACTER_ERR (5): the string contains invalid characters;
    NO_DATA_ALLOWED_ERR (6): data is specified for an object that does not support it (historical);
    NO_MODIFICATION_ALLOWED_ERR (7): the object can not be modified;
    NOT_FOUND_ERR (8): the object can not be found here;
    NOT_SUPPORTED_ERR (9): this operation is not supported;
    INUSE_ATTRIBUTE_ERR (10): the attribute is in use (historical);
    INVALID_STATE_ERR (11): the object is in an invalid state;
    SYNTAX_ERR (12): the string did not match the expected pattern;
    INVALID_MODIFICATION_ERR (13): the object can not be modified in this way;
    NAMESPACE_ERR (14): the operation is not allowed by Namespaces in XML; [XMLNS]
    INVALID_ACCESS_ERR (15): the object does not support the operation or argument;
    VALIDATION_ERR (16): the operation is invalid (historical);
    TYPE_MISMATCH_ERR (17): the type of the object does not match the expected type;
    SECURITY_ERR (18): the operation is insecure;
    NETWORK_ERR (19): a network error occurred;
    ABORT_ERR (20): the user aborted an operation;
    URL_MISMATCH_ERR (21): the given URL does not match another URL;
    QUOTA_EXCEEDED_ERR (22): the quota has been exceeded;
    TIMEOUT_ERR (23): a timeout occurred;
    INVALID_NODE_TYPE_ERR (24): the supplied node is invalid or has an invalid ancestor for this operation;
    DATA_CLONE_ERR (25): the object can not be cloned. 

The name exception field must return the name of the exception constant as a string. 


*/
