
var window = {}

importScripts('../dom.js');

window.addEventListener = function() {
	Function.apply(document.addEventListener, this, arguments);
}

function mutation(evt) {
    postMessage(evt);
}

function print() {
	var out = '';
	for (var i = 0; i < arguments.length; i++) {
		out += arguments[i] + ' ';
	}
	postMessage(out);
}

var parser_num = 1;
var parsing = {}

onmessage = function(message) {
	try {
		var data = message.data;
		var reply = {}
		var parser = null;

		if (data.url) {
			parser = document.implementation.mozHTMLParser(data.url);
			var doc = parser.document();
			doc.implementation.mozSetOutputMutationHandler(doc, mutation);
			parsing[parser_num] = parser;
			reply.parser = parser_num;
			parser_num++;
		} else {
			parser = parsing[data.parser];
			reply.parser = data.parser;
		}
		if (data.chunk) {
			parser.parse(data.chunk);
		}
		if (data.finished) {
			parser.parse('', true);
			reply.finished = true;
			parsing[reply.parser] = undefined;
		}
		postMessage(reply);
	} catch (e) {
		postMessage(e.toString());
	}
}
