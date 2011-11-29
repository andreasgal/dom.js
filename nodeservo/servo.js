#!/usr/bin/env node --harmony_proxies --harmony_weakmaps

// This adds stuff to the global object
require('../domnode.js');

var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var path = require('path');

global.XMLHttpRequest = require("XMLHttpRequest").XMLHttpRequest;

// Define a simple window object
global.window = global;
window.navigator = Object.freeze({
    userAgent: "dom.js",
    appName: "dom.js",
    appVersion: "0.1",
    platform: "unknown"
});

// Map connection objects to document objects
var documents = new WeakMap();

var server = http.createServer(function(request, response) {
    if (request.url === "/") {
        response.writeHead(200, {'Content-type': 'text/html'});

        var filename = path.join(
            path.dirname(process.argv[1]), 'client.html');

        fs.readFile(filename, function (err, data) {
            if (err) throw err;
            console.log("file!", filename);
            response.write(data, "binary");
            response.end();
        });
        return;
    }
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + " Connection accepted.");
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var cmd = message.utf8Data;
            if (cmd.substring(0,5) === "load ") {
                load(connection, cmd.substring(5));
            }
            else if (cmd.substring(0,6) === "event ") {
                var e = JSON.parse(cmd.substring(6));
                console.log("Event", e);

                var doc = documents.get(connection);
                if (doc) {
                    // XXX: kind of a hack
                    // Set the document of the global window before
                    // dispatching the event.
                    window.document = doc;
                    doc._dispatchEvent(e.target, e.type, {
                        // XXX: add more event detail fields
                        bubbles: e.bubbles,
                        cancelable: e.cancelable
                    });
                }
            }
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
});

function load(connection, url) {
    console.log("loading ", url);

    var parser = document.implementation.mozHTMLParser(url);
    
    var doc = parser.document();
    window.document = doc;
    window.location = url;
    documents.set(connection, doc);
    doc._setMutationHandler(function(msg) {
        connection.sendUTF(JSON.stringify(msg));
    });

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || xhr.status === 0) {
            parser.parse(xhr.responseText);
        }
    };
}