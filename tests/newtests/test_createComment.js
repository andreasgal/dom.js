
assert(Comment);

var comment = document.createComment("comment.");

assert(comment.nodeValue === "comment.", comment.nodeValue);

var cloned = comment.cloneNode();

cloned.nodeValue = "cloned.";

assert(comment.nodeValue === "comment.", comment.nodeValue);
assert(cloned.nodeValue === "cloned.", cloned.nodeValue);

assert(comment.length === 8, comment.length);
assert(cloned.length === 7, cloned.length);

// Cover the document mutation event when the node is rooted
// TODO Make sure the document mutation event fires

document.body.appendChild(comment);
comment.nodeValue = "changed.";
