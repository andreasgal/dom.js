// Parse a string of HTML and invoke the specified function with serialized
// tree mutation events. This uses John Resig's simple HTML parser 
// in htmlparser.js.  A full-blown HTML parser has to do more complicated
// stuff, including rearranging nodes, and will need something more 
// complicated than what is here.

// This code runs in a worker
importScripts("Constants.js", "htmlparser.js");

onmessage = function(e) { parse(e.data, this); }

// Parse s, post tree mutation event messages to port
function parse(s, port) { 

    function serializeAttrs(attrs) {
        var a = []
        for(var i = 0; i < attrs.length; i++) {
            a.push(attrs[i].name, attrs[i].value);
        }
        return a.join(FS3);
    }

    var nextid = 2;
    var stack = [];  
    var parent = 1;  // The document node, hardcoded here

    HTMLParser(s, {
        start: function(tag, attrs, unary) {
            var nid = nextid++;
            var event = APPEND + FS2 + parent + FS2 + nid + FS2 +
                ELEMENT + FS2 + tag + FS2 + serializeAttrs(attrs);
            if (!unary) {
                stack.push(parent);
                parent = nid;
            }
            port.postMessage(event);
        },
        end: function(tag) {
            parent = stack.pop();
        },
        chars: function(text) {
            var nid = nextid++;
            var event = APPEND + FS2 + parent + FS2 + nid + FS2 +
                TEXT + FS2 + text;
            port.postMessage(event);
        },
        comment: function(text) {
            var nid = nextid++;
            var event = APPEND + FS2 + parent + FS2 + nid + FS2 +
                COMMENT + FS2 + text;
            port.postMessage(event);
        },
    });
}
