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

    function serialize(n) {
        function serializeNode(n) {
            switch (n.nodeType) {
            case Node.TEXT_NODE:
                return n.data;
            case Node.COMMENT_NODE:
                return {comment: n.data};
            case Node.PROCESSING_INSTRUCTION_NODE:
                return {pi: n.target, data: n.data};
            case Node.DOCUMENT_TYPE_NODE:
                // HTML ignores the publicID and systemID when
                // serializing nodes, so ignore them here, too
                return {doctype: n.name};
            case Node.ELEMENT_NODE:
                return serializeElement(n);
            case NODE.DOCUMENT_FRAGMENT_NODE:
                return serializeFragment(n);
            }
        }

        function serializeElement(n) {
            var elt = {};
            if (n.namespaceURI === HTML_NAMESPACE && !n.prefix) {
                elt.html = n.localName;
            }
            else {
                elt.ns = serializeNamespace(n.namespaceURI);
                elt.tag = n.tagName;
            }

            // Handle the attributes
            if (n.attributes.length) {
                elt.attr = new Array(n.attributes.length);
            }
            for(var i = 0, l = n.attributes.length; i < l; i++) {
                elt.attr[i] = serializeAttr(n.attributes.item(i));
            }

            // Now the children
            if (n.childNodes.length) {
                elt.child = new Array(n.childNodes.length);
            }
            for(var i = 0, l = n.childNodes.length; i < l; i++) {
                elt.child[i] = serializeNode(n.childNodes[i]);
            }

            return elt;
        }

        var lastCustomNS = null;

        function serializeNamespace(ns) {
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
                    return "c" + ns;
                }
            }
        }

        function serializeAttr(a) {
            if (a.namespaceURI === null && a.prefix === null) {
                // set with setAttribute()
                return {a: a.name, v: a.value};
            }
            else {
                // set with setAttributeNS()
                return {ns: serializeNamespace(a.namespaceURI),
                    a: a.name, v: a.value};
            }
        }

        function serializeLength(n) {
            if (n < 0) throw new Error("negative length");
            if (n <= 0xD7FF) return fromCharCode(n);
            else return fromCharCode("0xFFFF") + String(n) + NUL;
        }

        function serializeFragment(n) {
            var frag = {frag: new Array(n.childNodes.length)};
            for(var i = 0, l = n.childNodes.length; i < l; i++) {
                frag[i] = serializeNode(n.childNodes[i]);
            }
            return frag;
        }

        return serializeNode(n);
    }


    function parse(node, d) {
        if (!d) d = document;

        function parseNode(n) {
            if (typeof n === "string") {
                return d.createTextNode(n);
            }
            if (n.comment !== undefined) {
                return d.createComment(n.comment);
            }
            if (n.pi !== undefined) {
                return d.createProcessingInstruction(n.pi, n.data);
            }
            if (n.doctype !== undefined) {
                return d.implementation.createDocumentType(n.doctype, "", "");
            }
            if (n.html !== undefined) {
                return parseElement("H", n);
            }
            if (n.ns !== undefined) {
                return parseElement("E", n);
            }
            if (n.frag !== undefined) {
                return parseFragment(n);
            }
        }

        function parseElement(type, n) {
            var e;
            if (type === "H")
                e = d.createElement(n.html);
            else
                e = d.createElementNS(parseNamespace(n.ns), n.tag);

            var numattrs = 0;
            if (n.attr !== undefined) {
                numattrs = n.attr.length;
            }
            for(var i = 0; i < numattrs; i++) {
                var attr = n.attr[i];
                if (attr.a !== undefined)
                    e.setAttribute(attr.a, attr.v);
                else
                    e.setAttributeNS(attr.ns, attr.a, attr.v);
            }

            var numkids = 0;
            if (n.child !== undefined) {
                numkids = n.child.length;
            }
            for(var i = 0; i < numkids; i++) {
                e.appendChild(parseNode(n.child[i]));
            }

            return e;
        }


        var lastCustomNS = null;

        function parseNamespace(n) {
            switch(n[0]) {
            case 'h': return HTML_NAMESPACE;
            case 'u': return null;
            case 'x': return XML_NAMESPACE;
            case 'n': return XMLNS_NAMESPACE;
            case 'm': return MATHML_NAMESPACE;
            case 's': return SVG_NAMESPACE;
            case 'l': return lastCustomNS;
            case 'c':
                return n.slice(1);
            }
        }

        function parseFragment(n) {
            var f = d.createDocumentFragment();
            var len = n.frag.length;
            for(var i = 0; i < len; i++)
                f.appendChild(parseNode(n.frag[i]));
            return f;
        }

        return parseNode(node);
    }

    return { serialize: serialize, parse: parse };
}());
