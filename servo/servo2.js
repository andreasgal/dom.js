"use strict";

var worker = new Worker('servo-worker.js');

worker.onmessage = function (msg) {
    var message = msg.data;
    if (message.type !== undefined) {
        document.getElementById('render-iframe').contentWindow.postMessage(
            message, "*"
        );
    }
    setTimeout(function() { parse_event(message) }, 0);
}

function iframe_event(evt) {
    var message = evt.data;
    if (message.event !== undefined) {
        worker.postMessage(message);
        return;
    }
}

window.addEventListener("message", iframe_event, false);

function assign_nid(node, nid) {
    node.nid = nid++;

    if (node.children === undefined) {
        return nid;
    }

    for(var i = 0; i < node.children.length; i++) {
        nid = assign_nid(node.children[i], nid++);
    }

    return nid;
}

function parse_event(mutation) {
    if (mutation.type === undefined) {
        if (mutation.finished) {
            return;
        }
        console.log(mutation);
        return;
    }

    switch(mutation.type) {
    case MUTATE_VALUE:
        var target = document.getElementById(mutation.target);
        var text = mutation.data.trim();

        var textnode = document.createElement('span');
        textnode.setAttribute("class", "textnode");
        textnode.setAttribute("title", JSON.stringify(mutation.data));
        textnode.appendChild(
            document.createTextNode(text));
        target.replaceChild(textnode, target.lastChild);
        break;
        
    case MUTATE_ATTR:
        // NOT IMPLEMENTED YET
        if (mutation.ns) {
            /*target.setAttributeNS(mutation.ns,
                                  mutation.prefix + ":" + mutation.name,
                                  mutation.value);*/
            //console.log(mutation.ns, mutation.prefix, mutation.name, mutation.value);
        }
        else {
            //console.log(mutation.name, mutation.value);
            //target.setAttribute(mutation.name, mutation.value);
        }
        break;

    case MUTATE_REMOVE_ATTR:
        // NOT IMPLEMENTED YET
        if (mutation.ns) {
            //console.log(mutation.ns, mutation.name);
            //target.removeAttributeNS(mutation.ns, mutation.name);
        }
        else {
            //console.log(mutation.name);
            //target.removeAttribute(mutation.name);
        }
        break;

    case MUTATE_REMOVE:
        var target = document.getElementById(mutation.target);
        var oldclass = target.getAttribute('class') || '';
        target.setAttribute('class', oldclass + ' removed');
        break;
        
    case MUTATE_MOVE:
        var target = document.getElementById(mutation.target);
        var parent = document.getElementById(mutation.parent);
        var child = parent.childNodes[mutation.index];
        parent.insertBefore(target, child);
        break;
        
    case MUTATE_INSERT:
        var parsed = DOMSTR.parse(mutation.child, fakedocument);
        assign_nid(parsed, mutation.nid);
        var nodes = create_dom(parsed);
        document.getElementById(
            mutation.parent
        ).appendChild(
            nodes
        );
        break;
    }
}

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

function create_dom(tree) {
    var wrapper = document.createElement('span');
    wrapper.setAttribute('id', tree.nid);
    if (tree.children !== undefined) {
        wrapper.setAttribute('class', 'element');
    }

    var nodeid = document.createElement('span');
    wrapper.appendChild(nodeid);
    nodeid.setAttribute('class', 'node-id');
    nodeid.appendChild(
        document.createTextNode(tree.nid));

    var output;
    if (tree.children !== undefined) {
        // Element node
        var color = colors[tree.type];
        if (color !== undefined) {
            wrapper.setAttribute('style', 'color: ' + color);
        }
        var attributes = "";
        for (var attr in tree.attributes) {
            attributes += attr + '="' + tree.attributes[attr] + '" ';
        }
        output = "< " + tree.type + " " + attributes + ">";
        for (var i = 0; i < tree.children.length; i++) {
            var child = create_dom(tree.children[i]);
            wrapper.appendChild(child);
        }
    } else if (tree.doctype !== undefined) {
        // Doctype node
        output = "<!DOCTYPE " + tree.doctype[0] + " >";
    } else if (tree.value !== undefined) {
        // Text node
        var textnode = document.createElement('span');
        textnode.setAttribute("class", "textnode");
        textnode.appendChild(
            document.createTextNode(tree.value.trim()));
        wrapper.setAttribute("title", JSON.stringify(tree.value));
        wrapper.appendChild(textnode);
        output = null;
    } else {
        output = JSON.stringify(tree);
    }
    if (output != null) {
        wrapper.insertBefore(
            document.createTextNode(output),
            wrapper.firstChild.nextSibling
        );
    }
    return wrapper;
}

function GET(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        var self = this;
        if (this.readyState === 4) {
            var message = {url: url, finished: true};
            message.chunk = self.responseText;
            worker.postMessage(message);
        }
    }
    xhr.open('GET', url);
    xhr.send();
}

$(document).ready(function () {
    $('#url').on('submit', function() {
        document.getElementById('1').innerHTML = '';
        var iframe = document.getElementById('render-iframe');
        iframe.src = iframe.src;
        GET(this.url.value);
        return false;
    });
    $('#url').submit();
});

function STextNode(value) {
    this.value = value;
}

function SComment(value) {
    this.comment = value;
}

function SProcessingInstruction(x, y) {
    this.procinstruction = [x, y];
}

function SDocumentType(x, y, z) {
    this.doctype = [x, y, z];
}

function SElement(type) {
    this.type = type;
    this.attributes = {};
    this.children = [];
}

SElement.prototype = {
    setAttribute: function(name, value) {
        this.attributes[name] = value;
    },
    setAttributeNS: function(ns, name, value) {
        this.attributes[ns + ":" + name] = value;
    },
    appendChild: function(child) {
        this.children.push(child);
    }
}

function SDocumentFragment() {
    this.fragment = true;
    this.prototype = new Element('');
}

function SDocument() {

}

SDocument.prototype = {
    createTextNode: function(txt) {
        return new STextNode(txt);
    },
    createComment: function(cmt) {
        return new SComment(cmt);
    },
    createProcessingInstruction: function(x, y) {
        return new SProcessingInstruction(x, y);
    },
    implementation: {
        createDocumentType: function(x, y, z) {
            return new SDocumentType(x, y, z);
        }
    },
    createDocumentFragment: function() {
        return new SDocumentFragment();
    },
    createElement: function(typ) {
        return new SElement(typ);
    },
    createElementNS: function(ns, typ) {
        return new SElement( ns + ":" + typ);
    }
}

var fakedocument = new SDocument();

// *******************************************************
// DOMSTR 
// *******************************************************


// The value of a Text, Comment or PI node changed
const MUTATE_VALUE = 1;

// A new attribute was added or an attribute value and/or prefix changed
const MUTATE_ATTR = 2;

// An attribute was removed
const MUTATE_REMOVE_ATTR = 3;

// A node was removed
const MUTATE_REMOVE = 4;

// A node was moved
const MUTATE_MOVE = 5;

// A node (or a subtree of nodes) was inserted
const MUTATE_INSERT = 6;


// A string representation of DOM trees
var DOMSTR = (function() {
    const NUL = "\0";

    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    const substring = String.substring;
    const indexOf = String.indexOf;
    const charCodeAt = String.charCodeAt;
    const fromCharCode = String.fromCharCode;

    function stringify(n) {
        function stringifyNode(n) {
            switch (n.nodeType) {
            case Node.TEXT_NODE:
                return "T" + n.data + NUL;
            case Node.COMMENT_NODE:
                return "C" + n.data + NUL;
            case Node.PROCESSING_INSTRUCTION_NODE:
                return "P" + n.target + NUL + n.data + NUL;
            case Node.DOCUMENT_TYPE_NODE:
                // HTML ignores the publicID and systemID when
                // serializing nodes, so ignore them here, too
                return "D" + n.name + NUL;
            case Node.ELEMENT_NODE:
                return stringifyElement(n);
            case NODE.DOCUMENT_FRAGMENT_NODE:
                return stringifyFragment(n);
            }
        }

        function stringifyElement(n) {
            var s = "";
            if (n.namespaceURI === HTML_NAMESPACE && !n.prefix) {
                s = "H" + n.localName + NUL;
            }
            else {
                s = "E" + stringifyNamespace(n.namespaceURI) + n.tagName + NUL;
            }

            // Number of attributes
            s += stringifyLength(n.attributes.length);
            for(var i = 0, l = n.attributes.length; i < l; i++) {
                s += stringifyAttr(n.attributes.item(i));
            }

            // Now the children
            s += stringifyLength(n.childNodes.length);
            for(var i = 0, l = n.childNodes.length; i < l; i++) {
                s += stringifyNode(n.childNodes[i]);
            }

            return s;
        }

        var lastCustomNS = null;

        function stringifyNamespace(ns) {
            switch(ns) {
            case HTML_NAMESPACE: return "h";
            case null: return "u";
            case XML_NAMESPACE: return "x";
            case XMLNS_NAMESPACE: return "n";
            case MATHML_NAMESPACE: return "m";
            case SVG_NAMESPACE: return "s";
            default: 
                if (ns === lastCustomNS) return "l"
                else {
                    lastCustomNS = ns;
                    return "c" + ns + NUL;
                }
            }
        }

        function stringifyAttr(a) {
            if (a.namespaceURI === null && a.prefix === null) {
                // set with setAttribute()
                return "a" + a.name + NUL + a.value + NUL;
            }
            else {
                // set with setAttributeNS()
                return "A" + stringifyNamespace(a.namespaceURI) +
                    a.name + NUL + a.value + NUL;
            }
        }

        function stringifyLength(n) {
            if (n < 0) throw new Error("negative length");
            if (n <= 0xD7FF) return fromCharCode(n);
            else return fromCharCode("0xFFFF") + String(n) + NUL;
        }

        function stringifyFragment(n) {
            var s = "F" + stringifyLength(n.childNodes.length);
            for(var i = 0, l = n.childNodes.length; i < l; i++) {
                s += stringifyNode(n.childNodes[i]);
            }
            return s;
        }

        return stringifyNode(n);
    }


    function parse(s, d) {
        var n = 0,            // current character in s.
            eos = s.length;   // end-of-string

        if (!d) d = document;

        function parseNode() {
            switch(s[n++]) {
            case "T":
                return d.createTextNode(next());
            case "C":
                return d.createComment(next());
            case "P":
                return d.createProcessingInstruction(next(), next());
            case "D":
                return d.implementation.createDocumentType(next(),"","");
            case "H":  // create with createElement
                return parseElement("H");
            case "E":  // create with createElementNS
                return parseElement("E");
            case "F":
                return parseFragment();
            }
        }


        // Return the characters of s from n up to (but not
        // including) the next NUL character (or the end of the
        // string).  Update n to point to the first character
        // after NUL.  Throw an error if we reach the end of string
        function next() {
            if (n >= eos) throw new Error("Unexpected end of string");
            var end = indexOf(s, NUL, n);
            if (end === -1) end = eos;
            var token = substring(s, n, end);
            n = end+1;
            return token;
        }


        function parseElement(type) {
            var e;
            if (type === "H") 
                e = d.createElement(next());
            else
                e = d.createElementNS(parseNamespace(), next());

            var numattrs = parseLength();
            for(var i = 0; i < numattrs; i++) {
                var code = s[n++];
                if (code === "a") 
                    e.setAttribute(next(), next());
                else
                    e.setAttributeNS(parseNamespace(), next(), next());
            }

            // XXX 
            // Quick hack to prevent scripts from being run in the iframe
            if (e.tagName === "SCRIPT")
                e.setAttribute("type", "dont-run-me");

            var numkids = parseLength();
            for(var i = 0; i < numkids; i++) {
                e.appendChild(parseNode());
            }

            return e;
        }


        var lastCustomNS = null;

        function parseNamespace() {
            switch(s[n++]) {
            case 'h': return HTML_NAMESPACE;
            case 'u': return null;
            case 'x': return XML_NAMESPACE;
            case 'n': return XMLNS_NAMESPACE;
            case 'm': return MATHML_NAMESPACE;
            case 's': return SVG_NAMESPACE;
            case 'l': return lastCustomNS;
            case 'c':
                lastCustomNS = next();
                return lastCustomNS;
            }
        }

        function parseLength() {
            var l = charCodeAt(s, n++);
            if (l === 0xFFFF) l = parseInt(next());
            return l;
        }

        function parseFragment() {
            var f = d.createDocumentFragment();
            var len = parseLength();
            for(var i = 0; i < len; i++) 
                f.appendChild(parseNode());
            return f;
        }

        return parseNode();
    }

    return { stringify: stringify, parse: parse };
}());



