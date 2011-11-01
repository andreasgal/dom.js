
importScripts('../dom.js');

function mutation(evt) {
    postMessage(JSON.stringify(evt));
}

onmessage = function(message) {
    var body = message.data.body.toString();
    var url = message.data.url.toString();
    var newdoc = document.implementation.mozHTMLParser(url, mutation).end(body);
    postMessage(JSON.stringify("complete"));
}
