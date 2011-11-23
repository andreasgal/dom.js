// In a node module, in non-strict mode, we get the global object
// one way.  In spidermonkey, in strict mode, we just use this.
var global = (function() { return this; }()) || this;

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

// 
// Now test that idl and content attributes like "onclick" work correctly
// to register event handlers, that they are invoked before listeners
// registered with addEventListener, and that handlers registered with
// content attributes are invoked with the correct scope chain.
// 
// Also test that all of the event types work.
// 

// Does an idl attribute event handler work?
(function() {
    var elt = document.createElement("div");
    var evt = document.createEvent("Event");
    evt.initEvent("click", true, true);
    
    var pass = false;
    elt.onclick = function() { pass = true; }
    elt.dispatchEvent(evt);
    assert(pass === true);
}());

// Does a content event handler work?
(function() {
    var elt = document.createElement("div");
    var evt = document.createEvent("Event");
    evt.initEvent("click", true, true);
    
    global.pass = false;
    elt.setAttribute("onclick", "pass = true;");
    elt.dispatchEvent(evt);
    assert(global.pass === true);
}());

// Are handlers invoked before listeners?
(function() {
    var elt = document.createElement("div");
    var evt = document.createEvent("Event");
    evt.initEvent("click", true, true);
    
    var s = "";
    elt.addEventListener("click", function() { s += "foo"; });
    elt.onclick = function() { s += "bar" };
    elt.dispatchEvent(evt);
    assert(s === "barfoo");
}());

// Does the scope chain get set appropriately for content attribute handlers?
// XXX: can't test the form element on the scope chain yet, since HTMLElement
// does not yet support the form property
(function() {
    var elt = document.createElement("div");
    var evt = document.createEvent("Event");
    evt.initEvent("click", true, true);
    
    global.x = "globalx";
    document.y = "docy";
    elt.z = "eltz";
    global.result = "";
    elt.setAttribute("onclick", "result = x + y + z;");
    elt.dispatchEvent(evt);

    assert(global.result === "globalxdocyeltz");
}());

// Do idl and content handlers respond as expected when the other is set?
(function() {
    var elt = document.createElement("div");

    function f() {};
    function g() {};

    elt.onclick = f;
    assert(elt.onclick === f);
    elt.setAttribute("onclick", "foo()");
    assert(elt.getAttribute("onclick") === "foo()");
    assert(elt.onclick !== f);
    elt.onclick = g;
    assert(elt.onclick === g);
    // Surprising, but setting the idl attribute does not change the
    // value of the content attribute.  This is the correct behavior.
    assert(elt.getAttribute("onclick") === "foo()");
}());

// Now test that all of these event handler attributes work
["abort",
 "canplay",
 "canplaythrough",
 "change",
 "click",
 "contextmenu",
 "cuechange",
 "dblclick",
 "drag",
 "dragend",
 "dragenter",
 "dragleave",
 "dragover",
 "dragstart",
 "drop",
 "durationchange",
 "emptied",
 "ended",
 "input",
 "invalid",
 "keydown",
 "keypress",
 "keyup",
 "loadeddata",
 "loadedmetadata",
 "loadstart",
 "mousedown",
 "mousemove",
 "mouseout",
 "mouseover",
 "mouseup",
 "mousewheel",
 "pause",
 "play",
 "playing",
 "progress",
 "ratechange",
 "reset",
 "seeked",
 "seeking",
 "select",
 "show",
 "stalled",
 "submit",
 "suspend",
 "timeupdate",
 "volumechange",
 "waiting",
 "blur",
 "error",
 "focus",
 "load",
 "scroll"
].forEach(function(type) {
    var elt = document.createElement("div");
    var evt = document.createEvent("Event");
    evt.initEvent(type, true, true);
    
    var pass = false;
    elt["on" + type] = function() { pass = true; }
    elt.dispatchEvent(evt);
    assert(pass === true);

    global.pass = false;
    elt.setAttribute("on" + type, "pass = true;");
    elt.dispatchEvent(evt);
    assert(global.pass === true);
});

// In addition, make sure that the following ones work for <body> tags
[
    "afterprint",
    "beforeprint",
    "beforeunload",
    "blur",
    "error",
    "focus",
    "hashchange",
    "load",
    "message",
    "offline",
    "online",
    "pagehide",
    "pageshow",
    "popstate",
    "resize",
    "scroll",
    "storage",
    "unload",
].forEach(function(type) {
    var elt = document.body
    var evt = document.createEvent("Event");
    evt.initEvent(type, true, true);
    
    var pass = false;
    elt["on" + type] = function() { pass = true; }
    elt.dispatchEvent(evt);
    assert(pass === true);

    global.pass = false;
    elt.setAttribute("on" + type, "pass = true;");
    elt.dispatchEvent(evt);
    assert(global.pass === true);
});