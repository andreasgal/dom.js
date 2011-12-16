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
