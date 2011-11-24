#!/usr/bin/env node --harmony_proxies --harmony_weakmaps

// This adds stuff to the global object
require('../domnode.js');

var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(request, response) {
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
            console.log("Received Message: " + message.utf8Data);
            var cmd = message.utf8Data;
            if (cmd.substring(0,5) === "load ") {
                load(connection, cmd.substring(5));
            }
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
});

// Map connection objects to document objects
var connections = new WeakMap();

function load(connection, url) {
    console.log("loading ", url);

    var parser = document.implementation.mozHTMLParser(url);
    
    var doc = parser.document();
    connections.set(connection, document);
    doc.implementation.mozSetOutputMutationHandler(doc, function(msg) {
        connection.sendUTF(JSON.stringify(msg));
    });

    // for now the url is a filename
    // XXX: make this fetch any url.
    // Also, change the HTML parser to use 
    // something other than xhr for scxripts when running in node.
    parser.parse(fs.readFileSync(url, "utf-8"));
}