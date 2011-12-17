"use strict";

var console = {
    log: function() {
        var out = '';
        for (var i = 0; i < arguments.length; i++) {
            out += arguments[i] + ' ';
        }
        postMessage(["log", out]);
    },
    warn: function() {
        var out = '';
        for (var i = 0; i < arguments.length; i++) {
            out += arguments[i] + ' ';
        }
        postMessage(["warn", out]);
    },
    error: function() {
        var out = '';
        for (var i = 0; i < arguments.length; i++) {
            out += arguments[i] + ' ';
        }
        postMessage(["error", out]);
    }
};

var print = console.log;

importScripts('../dom.js');

document._setMutationHandler(function(e) { postMessage(["mutation", e]); });

onmessage = function(event) {
    var cmd = event.data[0];
    var data = event.data[1];

    try {
        switch(cmd) {
        case "event":
            document._dispatchRendererEvent(data.target, data.type, {
                // XXX: add more event detail fields
                bubbles: data.bubbles,
                cancelable: data.cancelable
            });
            return;

        case "load":
            window.location = data;
            return;

        case "create":
            var elt = document.createElement(data);
            elt.appendChild(document.createTextNode(''));
            document.body.appendChild(elt);
            return;
        }
    } catch (e) {
        console.log("ERR " + e);
    }
}

