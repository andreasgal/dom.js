
importScripts('../dom.js');

function mutation(evt) {
    postMessage(JSON.stringify(evt));
}

onmessage = function(message) {
    var body = message.data.body.toString();
    var newdoc = document.implementation.mozHTMLParser(mutation).end(body);
}
