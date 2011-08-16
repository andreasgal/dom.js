
assert(Comment);

var comment = document.createComment("comment.");

assert(comment.nodeValue === "comment.", comment.nodeValue);

var cloned = comment.cloneNode();

cloned.nodeValue = "cloned.";

assert(comment.nodeValue === "comment.", comment.nodeValue);
assert(cloned.nodeValue === "cloned.", cloned.nodeValue);

assert(comment.length === 8, comment.length);
assert(cloned.length === 7, cloned.length);
