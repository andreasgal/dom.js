

assert(Event);
assert(EventTarget);

assertThrows(function() {
    document.createEvent("this event does not exist");
});

var evt = document.createEvent("Event");

evt.initEvent("click", true, true);

var node = document.createElement("div");
node.appendChild(document.createTextNode("click me"));

var clicked = false;

function click_handler(evt) {
    assert(evt.type === "click", evt.type);
    assert(evt.bubbles);
    assert(evt.cancelable);
    assert(evt.timeStamp);
    assert(!evt.isTrusted);
    assert(evt.target === node);
    assert(evt.currentTarget === node, evt.currentTarget);
    assert(evt.eventPhase === evt.AT_TARGET, evt.eventPhase);
    // TODO move these to another test that actually tests that they function
    evt.stopPropagation();
    evt.stopImmediatePropagation();
    evt.preventDefault();
    assert(evt.defaultPrevented === true, evt.defaultPrevented);
    clicked = true;
}

node.addEventListener("click", click_handler, false);
// should be able to add again and it will be ignored
node.addEventListener("click", click_handler, false);
// should be able to pass no event handler and it will be ignored
node.addEventListener("click", null, false);

document.body.appendChild(node);

node.dispatchEvent(evt);

assert(clicked);

clicked = false;

node.removeEventListener("click", click_handler, false);

node.dispatchEvent(evt);
assert(!clicked);

var newevent = new Event("click", {bubbles: true, cancelable: true});

assert(newevent.type === "click", newevent.type);
assert(newevent.bubbles === true);
assert(newevent.cancelable === true);

var defaultevent = new Event("click");

assert(defaultevent.type === "click", defaultevent.type);
assert(defaultevent.bubbles === false);
assert(defaultevent.cancelable === false);

var customevent = new CustomEvent("foo", {bubbles: true, cancelable: true, detail: "hello"});

assert(customevent.type === "foo", customevent.type);
assert(customevent.bubbles === true);
assert(customevent.cancelable === true);
assert(customevent.detail === "hello", customevent.detail);

var defaultcustom = new CustomEvent("bar");

assert(defaultcustom.type === "bar", defaultcustom.type);
assert(defaultcustom.bubbles === false);
assert(defaultcustom.cancelable === false);
