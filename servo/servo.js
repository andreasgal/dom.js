

const CHUNK_SIZE = 32767;
const NULL = '\0';

var canvas = null;
var ctx = null;

var glcanvas = null;
var glctx = null;

var worker = new Worker('servo-worker.js');
var depths = {1: 0};
var colors = {
    html: 'green',
    head: 'maroon',
    title: 'red',
    style: 'purple',
    script: 'blueviolet',
    body: 'orange',
    div: 'blue',
    span: 'darkgreen',
    h1: '#333333',
    h2: '#999999',
    a: 'navy',
    label: 'lightblue',
    ol: 'lime',
    ul: 'green',
    li: 'navy',
    strong: 'aqua',
    p: 'teal',
    br: 'olive'
};

// for building the dom explorer view
var previous = null;

// for building the canvas view
var tree_offset = 0;

// for sending large bodies in chunks to the worker
var send_chunk = null;

function maybe_insert_node(evt, child) {
    if (evt.type === 6) {
        if (evt['parent'] !== undefined) {
            var parent = document.getElementById(evt.parent);
            if (parent) {
                parent.appendChild(child);
            } else {
                document.getElementById('output').appendChild(child);
            }
        } else {
            document.getElementById('output').appendChild(child);
        }
    }
}

function parse_event(event) {
    var evt = event.data;

    if (evt === undefined) {
        console.log("undefined event?");
        return;
    }
    if (typeof evt === "string") {
        console.info(evt);
        return;
    }

    if (evt.finished) {
        console.log("Finished.");
        return;
    } else if (evt.parser) {
        send_chunk(evt.parser);
        return;
    }
    //console.log(JSON.stringify(evt));

    if (evt.nid === undefined) {
        evt.nid = -1;
    }
    if (evt.parent !== undefined) {
        depths[evt.nid] = depths[evt.parent] + 1;
    } else {
        if (evt.type === 4) {
            // remove event
            var node = document.getElementById(
                evt.target);
            if (node === null) {
                console.log(JSON.stringify(evt));
            } else {
                node.parentNode.removeChild(node);
            }
        } else if (evt.type === 1) {
            // mutate value event
            var node = document.getElementById(
                evt.target);
            // firstChild is the node id, nextSibling is the node value
            // the node may have other element children, so can't use
            // lastChild
            node.firstChild.nextSibling.innerHTML = '';
            node.firstChild.nextSibling.appendChild(document.createTextNode(evt.data.trim()));
            node.firstChild.title = '"' + evt.data + '"';
        }
        return;
    }

    var child = document.createElement('span');
    child.setAttribute('id', evt.nid);
    var node = document.createElement('span');
    var nodeId = document.createElement('span');
    nodeId.setAttribute('class', 'node-id');
    nodeId.appendChild(document.createTextNode(evt.nid));
    child.appendChild(nodeId);
    child.appendChild(node);

    maybe_insert_node(evt, child);

    function out() {
        var output = '';
        for (var i = 0; i < arguments.length; i++) {
            output += arguments[i].toString() + ' ';
        }
        node.appendChild(document.createTextNode(output));
    }

    var domjsNodeStr = evt.child;
    if (domjsNodeStr === undefined) {
        return;
    }

    console.info(domjsNodeStr);
    switch (domjsNodeStr.charAt(0)) {
      case 'T':
        var val = domjsNodeStr.substr(1).split(NULL)[0];
        nodeId.setAttribute('title', JSON.stringify(val));
        // don't show whitespace-only text nodes.
        node.setAttribute('style',
            'white-space: pre; font-family: monospace; margin: 0.5em; ');

        out(val.trim());

        break;
      case 'C':
        out("Comment node", JSON.stringify(
            domjsNodeStr.substr(1).split(NULL)[0])
        );
        break;
      case 'H':
          // html node
      case 'E':
        var spl = domjsNodeStr.substr(1).split(NULL);
        var attrstr = spl[1];
        var l = attrstr.charCodeAt(0);
        if (l === 0xFFFF) l = parseInt(attrstr.charCodeAt(1 + 1));

		var children = null;
        if (l === l) { // if l is not NaN
            var attrstr = domjsNodeStr.substr(domjsNodeStr.indexOf(NULL) + 2);
            var attrsplit = attrstr.split(NULL);
            var attributes = "";
            for (var i = 0; i < l; i++) {
                var attrname = attrsplit[i * 2].substr(1);
				attributes += attrname + '="' + attrsplit[i * 2 + 1] + '" ';
            }
            children = attrsplit.slice(i * 2);

            out("<", spl[0], attributes, ">");
        } else {
            out("<", spl[0], ">");
        }
        child.setAttribute('class', 'element');

        ctx.fillStyle = "rgb(150,0,0)";  

        if (colors[spl[0]] !== undefined) {
            child.setAttribute('style', 'color: ' + colors[spl[0]]);
			ctx.fillStyle = colors[spl[0]];  
        }

        tree_offset += 1;
        ctx.fillRect(5 * (depths[evt.nid] - 1), 5 * (tree_offset - 1), 5, 5); 
        //canvas.height = 5 * tree_offset;
        if (children !== null && children != ["", ""]) {
            var numchildren = parseInt(children[0].charCodeAt(0));
            if (numchildren === numchildren) {
                console.log('numchildren', numchildren);
                children[0] = children[0].slice(1);
                for (var i = 0; i < numchildren; i++) {
                    parse_event({data: {recursive: true,
                        type: 6, parent: evt.nid, nid: evt.nid + 1 + i, child: children[i]
                    }});
                }
            }
        }
        break;
    case 'D':
        var spl = domjsNodeStr.substr(1).split(NULL);
        out("< !DOCTYPE", spl[0], ">");
        break;
      default:
        throw new Error('Unhandled case of stringified node: ' + domjsNodeStr.charAt(0));
    }
    if (evt.type === 6) {
        previous = child;
    }
}

worker.onmessage = parse_event;

function GET(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        var self = this;
        var byte_offset = 0;
        if (this.readyState === 4) {
            send_chunk = function(parser) {
                var message = {};
                if (byte_offset === 0) {
                    message.url = url;
                } else {
                    message.parser = parser;
                }
                message.chunk = self.responseText.slice(
                    byte_offset, byte_offset + CHUNK_SIZE);
                byte_offset += CHUNK_SIZE;
                if (byte_offset >= self.responseText.length) {
                    message.finished = true;
                }
                worker.postMessage(message);
            }

            send_chunk();
        }
    }
    xhr.open('GET', url);
    xhr.send();
}

$(document).ready(function () {
    $(document).on('click', '.node-id',
        function() {
            var self = $(this);
            if (self.hasClass('collapsed')) {
                self.removeClass('collapsed');
                self.nextAll().removeClass('hidden');
            } else {
                self.addClass('collapsed');
                self.nextAll().addClass('hidden');
            }
            console.log('click');
        }
    );

    canvas = document.getElementById('tree-view');
    ctx = canvas.getContext('2d');

    $('#url').on('submit', function() {
        tree_offset = 0;
        ctx.clearRect(0 , 0 , canvas.width, canvas.height);
        document.getElementById('output').innerHTML = '';
        GET(this.url.value);
        return false;
    });
    $('#url').submit();
});

