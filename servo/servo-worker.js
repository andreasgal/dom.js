"use strict";

importScripts('../dom.js');

window.addEventListener("load", function() { console.log("load event"); }, false);

while(document.hasChildNodes()) document.removeChild(document.firstChild);

// XXX: make all postMessage calls pass a [cmd,data] array
// where cmd can be "mutation", "log", "warn", "error", etc.
document._setMutationHandler(function(e) { postMessage(e); });

function print() {
    var out = '';
    for (var i = 0; i < arguments.length; i++) {
        out += arguments[i] + ' ';
    }
    postMessage(out);
}


var console = {
    log: print,
    warn: print,  // XXX make these better
    error: print
};

// XXX what is this for?
// Does it improve error reporting somehow?
onerror = function(err) {
    return false;
}


onmessage = function(message) {
    try {
        var data = message.data;
        if (data.event !== undefined) {
            document._dispatchEvent(data.target, data.type, {
                // XXX: add more event detail fields
                bubbles: data.bubbles,
                cancelable: data.cancelable
            });
            return;
        }

        if (data.url !== undefined) {
            setTimeout(function() { window.location = data.url; }, 0);
        }
    } catch (e) {
        console.log("ERR " + e);
    }
}

