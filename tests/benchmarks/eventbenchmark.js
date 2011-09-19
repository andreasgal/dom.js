// This benchmark runs in dom.js, but not in browsers.
// Browsers seem to implement dispatchEvent by actually putting the
// event on an event queue. I think DOM Core says that it should
// work synchronously, though.  Maybe dom.js is wrong here.

if (!this.console) {
    var console = { log: print };
}

// Given a document, add an event hander at the root, and then 
// traverse the tree and dispatch an event on every element, letting it
// bubble up to the root, then remove the event handler
function testevents(d) {

    var events_sent = 0, events_received = 0;
    d.addEventListener("test", function(e) {
        events_received++;
        e.stopPropagation();
    }, false);

    dispatch(d);

    function dispatch(node) {
        var event = d.createEvent("Event");
        event.initEvent("test", true, true);
        
        node.dispatchEvent(event);
        events_sent++;

        var c = node.firstChild;
        while(c) {
            if (c.nodeType === Node.ELEMENT_NODE) {
                dispatch(c);
            }
            c = c.nextSibling;
        }

        if (events_sent != events_received)
            console.log("Event numbers don't match!");
    }
}

d = buildtree();

// Warm up
for(var i = 0; i < 10; i++) testevents(d);

var start = Date.now();
for(var i = 0; i < 500; i++) testevents(d);
var end = Date.now();
console.log("500 runs in: ", (end-start)/1000, " seconds.");