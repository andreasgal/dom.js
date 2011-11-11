
importScripts('../dom.js');

var window = {
	addEventListener: function() {
		Function.apply(document.addEventListener, this, arguments);
	},
	navigator: {
		userAgent: 'servo 0.1 webworker'
	},
	document: document
}

importScripts('jquery.js', 'qunit.js');
var jQuery = window.jQuery;
var $ = jQuery;

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
			var event = doc.createEvent('customevent');
			event.initEvent('DOMContentLoaded', false, true);
			doc.dispatchEvent(event);
		}
		postMessage(reply);
	} catch (e) {
		postMessage(e);
	}
}
