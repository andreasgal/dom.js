
importScripts('../dom.js');

function mutation(evt) {
    postMessage(JSON.stringify(evt));
}

function GET(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false); // in a thread, so blocking ok
    req.send('');
    var newdoc = document.implementation.mozHTMLParser(mutation).end(this.responseText);
}

onmessage = function(message) {
    var url = message.data.url.toString();
    GET(url);
}
