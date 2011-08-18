

assert(Event);
assert(EventTarget);

var evt = document.createEvent("Event");

evt.initEvent("click", true, true);

var node = document.createElement("div");
node.appendChild(document.createTextNode("click me"));

var clicked = false;

function click_handler(evt) {
    assert(evt.type === "click", evt.type);
    //assert(evt.target === node, evt.target.nodeName);
    //assert(evt.currentTarget === node, evt.currentTarget);
    clicked = true;
}

node.addEventListener("click", click_handler, false);

document.body.appendChild(node);

node.dispatchEvent(evt);

assert(clicked);

clicked = false;

node.removeEventListener("click", click_handler, false);

node.dispatchEvent(evt);
assert(!clicked);

