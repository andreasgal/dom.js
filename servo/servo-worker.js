
importScripts('../dom.js');

function mutation(evt) {
    postMessage(JSON.stringify(evt));
}

function print() {
	var out = '';
	for (var i = 0; i < arguments.length; i++) {
		out += arguments[i];
	}
	postMessage(JSON.stringify(out));
}

onmessage = function(message) {
	try {
    var body = message.data.body.toString();
    var url = message.data.url.toString();
    var parser = document.implementation.mozHTMLParser(url)
	var doc = parser.document();
	doc.implementation.mozSetOutputMutationHandler(doc, mutation);
	parser.parse(body, true);
    postMessage(JSON.stringify("complete"));
	} catch (e) {
		postMessage(JSON.stringify(e.toString()));
	}
}
