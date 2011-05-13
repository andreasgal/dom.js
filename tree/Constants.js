// These constants identify node types in a tree. They match the DOM values.
const ELEMENT = 1;
const TEXT = 3;
const PROCESSING_INSTRUCTION = 7;
const COMMENT = 8;
const DOCUMENT = 9;
const DOCTYPE = 10;


// These constants are used in the tree mutation event serialization format

// Field separators
const FS1 = '\x01';  // Separates one event from the next, if concatenated
const FS2 = '\x02';  // Separates events fields from each other
const FS3 = '\x03';  // Separates attribute names and values

// opcodes
const APPEND = 'A';  // Append a new node
const INSERT = 'I';  // Insert a new node
const MOVEA = 'M';   // Move a node, appending it to another
const MOVEI = 'B';   // Move a node, inserting it Before another
const REMOVE = 'R';  // Remove a node
const SETTEXT = 'T'; // Set node text
const SETATTR = 'S'; // Set or remove an attribute
