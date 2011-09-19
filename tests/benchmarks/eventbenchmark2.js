// This benchmark runs in dom.js, but not in browsers.
// Browsers seem to implement dispatchEvent by actually putting the
// event on an event queue. I think DOM Core says that it should
// work synchronously, though.  Maybe dom.js is wrong here.

if (!this.console) {
    var console = { log: print };
}

// Build a DOM tree (based on the Firefox about:home page) in a new document.
// I've commented out href and src attributes so gecko doesn't try to 
// fetch anything.  And I've changed the <form> element since dom.js doesn't
// support those yet.
function buildtree() {
    var e, parent = document.head;

    e = document.createElement("link");
    e.setAttribute("rel", "icon");
    e.setAttribute("type", "image/png");
    e.setAttribute("id", "favicon");
    parent.appendChild(e);

    e = document.createElement("link");
    e.setAttribute("rel", "stylesheet");
    e.setAttribute("type", "text/css");
    e.setAttribute("media", "all");
    parent.appendChild(e);

    e = document.createElement("div");
    e.setAttribute("id", "brandStartSpacer");
    parent = document.body;
    parent.appendChild(e);

    e = document.createElement("div");
    e.setAttribute("id", "brandStart");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("img");
    e.setAttribute("id", "brandStartLogo");
    e.setAttribute("alt", "");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "searchContainer");
    parent.appendChild(e);
    parent = e;

    // XXX: should be a form element, but dom.js doesn't support them yet
    e = document.createElement("deformed");
    e.setAttribute("name", "searchForm");
    e.setAttribute("id", "searchForm");
    e.setAttribute("onsubmit", "onSearchSubmit(event)");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("div");
    e.setAttribute("id", "searchLogoContainer");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("img");
    e.setAttribute("id", "searchEngineLogo");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "searchInputContainer");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("input");
    e.setAttribute("type", "text");
    e.setAttribute("name", "q");
    e.setAttribute("value", "");
    e.setAttribute("id", "searchText");
    e.setAttribute("maxlength", "256");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "searchButtons");
    parent.appendChild(e);
    parent = e;


    e = document.createElement("input");
    e.setAttribute("id", "searchSubmit");
    e.setAttribute("type", "submit");
    e.setAttribute("value", "&abouthome.searchEngineButton.label;");
    parent.appendChild(e);
    parent = parent.parentNode.parentNode.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "contentContainer");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("div");
    e.setAttribute("id", "snippetContainer");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("div");
    e.setAttribute("id", "defaultSnippets");
    e.setAttribute("hidden", "true");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("span");
    e.setAttribute("id", "defaultSnippet1");
    e.appendChild(document.createTextNode("&abouthome.defaultSnippet1.v1;"));
    parent.appendChild(e);

    e = document.createElement("span");
    e.setAttribute("id", "defaultSnippet2");
    e.appendChild(document.createTextNode("&abouthome.defaultSnippet2.v1;"));
    parent.appendChild(e);
    parent = parent.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "snippets");
    parent.appendChild(e);
    parent = parent.parentNode.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "sessionRestoreContainer");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("button");
    e.setAttribute("id", "restorePreviousSession");
    e.appendChild(document.createTextNode("&historyRestoreLastSession.label;"));
    parent.appendChild(e);
    parent = parent.parentNode;

    e = document.createElement("div");
    e.setAttribute("id", "bottomSection");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("div");
    e.setAttribute("id", "aboutMozilla");
    parent.appendChild(e);
    parent = e;

    e = document.createElement("a");
    e.setAttribute("href", "http://www.mozilla.com/about/");
    e.appendChild(document.createTextNode("&abouthome.aboutMozilla;"));
    parent.appendChild(e);
}

// Given a document, add an event hander at the root, and then 
// traverse the tree and dispatch an event on every element, letting it
// bubble up to the root, then remove the event handler
function testevents() {

    var events_sent = 0, events_received = 0;
    document.addEventListener("test", function(e) {
        events_received++;
        console.log("received ", events_received);
        e.stopPropagation();
    }, false);

    dispatch(document);

    function dispatch(node) {
        var event = document.createEvent("Event");
        event.initEvent("test", true, true);
        
        console.log("sending ", events_sent+1);
        node.dispatchEvent(event);
        console.log("sent ", events_sent+1);
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

window.onload = function() {
    buildtree();
    
    // Warm up
//    for(var i = 0; i < 10; i++) testevents(document);

    var start = Date.now();
    for(var i = 0; i < 500; i++) testevents(document);
    var end = Date.now();
    console.log("500 runs in: ", (end-start)/1000, " seconds.");
}