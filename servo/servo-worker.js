
"use strict";

importScripts('../dom.js');

var addEventListener = function(type, cb, bubble) {
    document.addEventListener(type, cb, bubble);
};

var navigator = { userAgent: 'servo 0.1 webworker' }
var location = {
    href: "http://example.com/foo",
    search: "",
    protocol: "http",
    pathname: "/foo"}
var window = this;

function print() {
    var out = '';
    for (var i = 0; i < arguments.length; i++) {
        out += arguments[i] + ' ';
    }
    postMessage(out);
}

var console = {log: print}

var parser_num = 1;
var parsing = {}

onerror = function(err) {
    return false;
}

function handle_message(data) {
    try {
        var reply = {}
        var parser = null;

        if (data.load) {
            postMessage("about to load");
            var event = document.createEvent('event');
            event.initEvent('load', false, true);
            document.dispatchEvent(event);
            postMessage("Document loaded.");
            return;
        }

        if (data.url) {
            parser = document.implementation.mozHTMLParser(data.url);
            var doc = parser.document();
            // work around for a proxy bug in ff
            Object.defineProperty(this, "document", { value: doc});

            doc.implementation.mozSetOutputMutationHandler(
                doc, function(msg) { postMessage(msg) }
            );
            parsing[parser_num] = parser;
            reply.parser = parser_num;
            parser_num++;
        } else {
            parser = parsing[data.parser];
            reply.parser = data.parser;
        }
        if (data.chunk) {
            parser.parse(data.chunk, data.finished);
        }
        if (data.finished) {
            reply.finished = true;
            parsing[reply.parser] = undefined;
        }
        postMessage(reply);
    } catch (e) {
        postMessage("ERR " + e);
    }
}

onmessage = function(message) {
    var global = this;
    var data = message.data;
    setTimeout(function() { handle_message.call(global, data) }, 0);
}
