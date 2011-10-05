const quirkyPublicIds = /^HTML$|^-\/\/W3O\/\/DTD W3 HTML Strict 3\.0\/\/EN\/\/$|^-\/W3C\/DTD HTML 4\.0 Transitional\/EN$|^\+\/\/Silmaril\/\/dtd html Pro v0r11 19970101\/\/|^-\/\/AdvaSoft Ltd\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/AS\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict\/\/|^-\/\/IETF\/\/DTD HTML 2\.0\/\/|^-\/\/IETF\/\/DTD HTML 2\.1E\/\/|^-\/\/IETF\/\/DTD HTML 3\.0\/\/|^-\/\/IETF\/\/DTD HTML 3\.2 Final\/\/|^-\/\/IETF\/\/DTD HTML 3\.2\/\/|^-\/\/IETF\/\/DTD HTML 3\/\/|^-\/\/IETF\/\/DTD HTML Level 0\/\/|^-\/\/IETF\/\/DTD HTML Level 1\/\/|^-\/\/IETF\/\/DTD HTML Level 2\/\/|^-\/\/IETF\/\/DTD HTML Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 0\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict\/\/|^-\/\/IETF\/\/DTD HTML\/\/|^-\/\/Metrius\/\/DTD Metrius Presentational\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 Tables\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 Tables\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD HTML\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD Strict HTML\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML 2\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended 1\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended Relaxed 1\.0\/\/|^-\/\/SoftQuad Software\/\/DTD HoTMetaL PRO 6\.0::19990601::extensions to HTML 4\.0\/\/|^-\/\/SoftQuad\/\/DTD HoTMetaL PRO 4\.0::19971010::extensions to HTML 4\.0\/\/|^-\/\/Spyglass\/\/DTD HTML 2\.0 Extended\/\/|^-\/\/SQ\/\/DTD HTML 2\.0 HoTMetaL \+ extensions\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava HTML\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava Strict HTML\/\/|^-\/\/W3C\/\/DTD HTML 3 1995-03-24\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Draft\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Final\/\/|^-\/\/W3C\/\/DTD HTML 3\.2\/\/|^-\/\/W3C\/\/DTD HTML 3\.2S Draft\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Transitional\/\/|^-\/\/W3C\/\/DTD HTML Experimental 19960712\/\/|^-\/\/W3C\/\/DTD HTML Experimental 970421\/\/|^-\/\/W3C\/\/DTD W3 HTML\/\/|^-\/\/W3O\/\/DTD W3 HTML 3\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML 2\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML\/\//i;

const quirkySystemId = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";

const conditionallyQuirkyPublicIds = /^-\/\/W3C\/\/DTD HTML 4\.01 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.01 Transitional\/\//i;

const limitedQuirkyPublicIds = /^-\/\/W3C\/\/DTD XHTML 1\.0 Frameset\/\/|^-\/\/W3C\/\/DTD XHTML 1\.0 Transitional\/\//i;


// The set of special elements
var specialSet = {
    HTML_NAMESPACE: {
        "address":true,
        "applet":true,
        "area":true,
        "article":true,
        "aside":true,
        "base":true,
        "basefont":true,
        "bgsound":true,
        "blockquote":true,
        "body":true,
        "br":true,
        "button":true,
        "caption":true,
        "center":true,
        "col":true,
        "colgroup":true,
        "command":true,
        "dd":true,
        "details":true,
        "dir":true,
        "div":true,
        "dl":true,
        "dt":true,
        "embed":true,
        "fieldset":true,
        "figcaption":true,
        "figure":true,
        "footer":true,
        "form":true,
        "frame":true,
        "frameset":true,
        "h1":true,
        "h2":true,
        "h3":true,
        "h4":true,
        "h5":true,
        "h6":true,
        "head":true,
        "header":true,
        "hgroup":true,
        "hr":true,
        "html":true,
        "iframe":true,
        "img":true,
        "input":true,
        "isindex":true,
        "li":true,
        "link":true,
        "listing":true,
        "marquee":true,
        "menu":true,
        "meta":true,
        "nav":true,
        "noembed":true,
        "noframes":true,
        "noscript":true,
        "object":true,
        "ol":true,
        "p":true,
        "param":true,
        "plaintext":true,
        "pre":true,
        "script":true,
        "section":true,
        "select":true,
        "style":true,
        "summary":true,
        "table":true,
        "tbody":true,
        "td":true,
        "textarea":true,
        "tfoot":true,
        "th":true,
        "thead":true,
        "title":true,
        "tr":true,
        "ul":true,
        "wbr":true,
        "xmp":true
    },
    SVG_NAMESPACE: {
        "foreignObject": true,
        "desc": true,
        "title": true
    },
    MATHML_NAMESPACE: {
        "mi":true,
        "mo":true,
        "mn":true,
        "ms":true,
        "mtext":true,
        "annotation-xml":true
    }
}

// The set of address, div, and p HTML tags
var addressdivpSet = {
    HTML_NAMESPACE: {
        "address":true, 
        "div":true,
        "p":true
    }
};

var dddtSet = {
    HTML_NAMESPACE: {
        "dd":true, 
        "dt":true
    }
};

var inScopeSet = {
    HTML_NAMESPACE: {
        "applet":true,
        "caption":true,
        "html":true,
        "table":true,
        "td":true,
        "th":true,
        "marquee":true,
        "object":true,
    },
    MATHML_NAMESPACE: {
        "mi":true,
        "mo":true,
        "mn":true,
        "ms":true,
        "mtext":true,
        "annotation-xml":true,
    },
    SVG_NAMESPACE: {
        "foreignObject":true,
        "desc":true,
        "title":true,
    }
};

var inListItemScopeSet = Object.create(inScopeSet);
inListItemScopeSet.HTML_NAMESPACE = Object.create(inScopeSet.HTML_NAMESPACE);
inListItemScopeSet.HTML_NAMESPACE.ol = true;
inListItemScopeSet.HTML_NAMESPACE.ul = true;

var inButtonScopeSet = Object.create(inScopeSet);
inButtonScopeSet.HTML_NAMESPACE = Object.create(inScopeSet.HTML_NAMESPACE);
inButtonScopeSet.HTML_NAMESPACE.button = true;

var inTableScopeSet = {
    HTML_NAMESPACE: {
        "html":true,
        "table":true
    }
};

// The set of elements for select scope is the everything *except* these
var invertedSelectScopeSet = {
    HTML_NAMESPACE: {
        "optgroup":true,
        "option":true
    }
}

// Determine whether the element is a member of the set.
// The set is an object that maps namespaces to objects. The objects
// then map local tagnames to the value true if that tag is part of the set
function isA(elt, set) {
    var o = set[elt.namespaceURI];
    if (o)
        return elt.localName in o;
    else
        return false;
}

function inSpecificScope(target, set) {
    for(var i = openelts.length-1; i >= 0; i--) {
        var elt = openelts[i];
        var ns = elt.namespaceURI;
        var localname = elt.localName;
        if (ns === HTML_NAMESPACE && localname === target) return true;
        var tags = set[ns];
        if (tags && localname in tags) return false;
    }
    return false;
}

function inScope(tag) {
    return inSpecificScope(tag, inScopeSet);
}

function inButtonScope(tag) {
    return inSpecificScope(tag, inButtonScopeSet);
}

function inListItemScope(tag) {
    return inSpecificScope(tag, inListItemScopeSet);
}

function inTableScope(tag) {
    return inSpecificScope(tag, inTableScopeSet);
}

function inSelectScope(tag) {
    // Can't implement this one with inSpecificScope, since it involves
    // a set defined by inverting another set. So implement manually.
    for(var i = openelts.length-1; i >= 0; i--) {
        var elt = openelts[i];
        if (elt.namespaceURI !== HTML_NAMESPACE) return false;
        var localname = elt.localName;
        if (localname === target) return true;
        if (localname !== "optgroup" && localname !== "option") return false;
    }
    return false;
}

function parseRawText(name, attrs) {
    insertHTMLElt(name, attrs);
    tokenizerState = rawtext_state;
    originalInsertMode = insertionMode;
    insertionMode = text;
}

function parseRCDATA(name, attributes) {
    insertHTMLElt(name, attrs);
    tokenizerState = rcdata_state;
    originalInsertMode = insertionMode;
    insertionMode = text;
}



// 11.2.5.4.1 The "initial" insertion mode
function initial_mode(t, a1, a2, a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        /* ignore the token */
        break;  
    case COMMENT:
        doc.appendChild(doc.createComment(a1));
        break;
    case DOCTYPE:
        var name = a1;
        var publicid = a2;
        var systemid = a3;
        doc.appendChild(doc.implementation.createDocumentType(name,
                                                              publicid || "",
                                                              systemid || ""));

        // XXX: define the values of document.quirks as constants
        // in impl/Document.js?
        // Note that there is no public API for setting quirks mode
        // We can do this here because we have access to implementation details
        if (force_quirks || 
            name.toLowerCase() !== "html" ||
            quirkyPublicIds.test(publicid) ||
            systemid.toLowerCase() === quirkySystemId ||
            (systemid === undefined &&
             conditionallyQuirkyPublicIds.test(publicId)))
            doc.quirks = "quirks mode";
        else if (limitedQuirkyPublicIds.test(publicId) ||
                 (systemid !== undefined &&
                  conditionallyQuirkyPublicIds.test(publicId)))
            doc.quirks = "limited-qurks mode";
        insertionMode = before_html;
        break;
    default:  // tags or non-whitespace text
        doc.quirks = "quirks mode";
        insertionMode = before_html;
        reprocess(t,a1,a2,a3);
        break;
    }
}

// 11.2.5.4.2 The "before html" insertion mode
function before_html(t,a1,a2,a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
    case DOCTYPE:
        /* ignore the token */
        return;
    case COMMENT:
        doc.appendChild(doc.createComment(a1));
        return;
    case TAG:
        if (a1 === "html") {
            var elt = doc.createElement(a1);
            pushElement(elt);
            doc.appendChild(elt);
            // XXX: handle application cache here
            insertionMode = before_head;
            return;
        }
    case ENDTAG:
        switch(a1) {
        case "head":
        case "body":
        case "br":
            break;   // fall through on these
        default:
            return;  // ignore most end tags
        }
    }

    // Anything that didn't get handled above is handled like this:
    var elt = doc.createElement("html");
    pushElement(elt);
    doc.appendChild(elt);
    // XXX: handle application cache here
    insertionMode = before_head;
    reprocess(t,a1,a2,a3);
}

// 11.2.5.4.3 The "before head" insertion mode
function before_head(t,a1,a2,a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
    case DOCTYPE:
        /* ignore the token */
        return;
    case COMMENT:
        currentnode.appendChild(doc.createComment(a1));
        return;
    case TAG:
        switch(a1) {
        case "html":
            in_body(t,a1,a2,a3);
            return;
        case "head":
            var elt = insertHTMLElement(name, a2);
            head_element_pointer = elt;
            insertionMode = in_head;
            return;
        default:
            break;
        }
    case ENDTAG:
        switch(a1) {
        case "html":
        case "head":
        case "body":
        case "br":
            break;
        default: 
            return; // ignore most end tags
        }
    }

    // If not handled explicitly above
    before_head(TAG, "head", null);  // create a head tag
    reprocess(t, a1, a2);            // then try again with this token
}

function in_head(t, a1, a2, a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        insertText(t);
        return;
    case COMMENT:
        insertComment(a1);
        return;
    case DOCTYPE:
        return;
    case TAG:
        switch(a1) {
        case "html":
            in_body(t, a1, a2, a3);
            return;
        case "meta":
            // XXX: 
            // May need to change the encoding based on this tag
            /* fallthrough */
        case "base":
        case "basefont":
        case "bgsound":
        case "command":
        case "link":
            insertHTMLElt(a1, a2);
            popElement();
            return;
        case "title":
            parseRCDATA(a1, a2);
            return;
        case "noscript":
            if (!scripting_enabled) {
                insertHTMLElement(a1, a2);
                insertionMode = in_head_noscript;
                return;
            }
            // Otherwise, if scripting is enabled...
            /* fallthrough */
        case "noframes":
        case "style":
            parseRawText(a1,a2);
            return;
        case "script":
            var elt = createHTMLElt(a1, a2);
            elt.parser_inserted = true;
            elt.force_async = false;
            if (fragment) elt.already_started = true;
            flushText();
            currentnode.appendChild(elt);
            pushElement(elt);

            tokenizerState = script_data_state;
            originalInsertionMode = insertionMode;
            insertionMode = text;
            return;
        case "head":
            return; // ignore it
        }
        break;
    case ENDTAG:
        switch(a1) {
        case "head":
            popElement();
            insertionMode = after_head;
            return;
        case "body":
        case "html":
        case "br":
            break; // handle these at the bottom of the function
        default: 
            // ignore any other end tag
            return;
        }
        break;
    }

    // If not handled above
    in_head(ENDTAG, "head", null); // synthetic </head>
    reprocess(t, a1, a2, a3);      // Then redo this one
}

// 13.2.5.4.5 The "in head noscript" insertion mode
function in_head_noscript(t, a1, a2, a3) {
    switch(t) {
    case DOCTYPE:
        return;
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
    case COMMENT:
        in_head(t, a1);
        return;
    case TAG:
        switch(a1) {
        case "html":
            in_body(t, a1, a2);
            return;
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
        case "noframes":
        case "style":
            in_head(t, a1, a2);
            return;
        case "head":
        case "noscript":
            return;
        }
        break;
    case ENDTAG:
        switch(a1) {
        case "noscript":
            popElement();
            insertionMode = in_head;
            return;
        case "br":
            break;  // fallthrough to the outer default
        default:
            return; // ignore other end tags
        }
        break;
    }

    // If not handled above
    in_head_noscript(ENDTAG, "noscript", null);
    reprocess(t, a1, a2, a3);
}

function after_head(t, a1, a2, a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        insertText(t);
        return;
    case COMMENT:
        insertComment(a1);
        return;
    case DOCTYPE:
        return;
    case TAG:
        switch(a1) {
        case "html":
            in_body(t, a1, a2);
            return;
        case "body":
            insertHTMLElt(a1, a2);
            frameset_ok = false;
            insertionMode = in_body;
            return;
        case "frameset":
            insertHTMLElt(a1, a2);
            insertionMode = in_frameset;
            return;
        case "base":
        case "basefont":
        case "bgsound":
        case "link":
        case "meta":
        case "noframes":
        case "script":
        case "style":
        case "title":
            pushElement(head_element_pointer);
            in_head(TAG, a1, a2);
            popElement();
            return;
        case "head":
            return;
        }
        break;
    case ENDTAG:
        switch(a1) {
        case "body":
        case "html":
        case "br":
            break; // and fallthrough
        default:
            return;  // ignore any other end tag
        }
        break;
    }

    after_head(TAG, "body", null);
    frameset_ok = true;
    reprocess(t, a1, a2, a3);
}

// 13.2.5.4.7 The "in body" insertion mode
function in_body(t,a1,a2,a3) {
    if (t === 0) return;
    if (t > 0) { // A character token
        switch(t) {
        default: 
            frameset_ok = false;
            /* fallthrough */
        case 0x0009: 
        case 0x000A:
        case 0x000C:
        case 0x000D:
        case 0x0020:
            reconstructActiveFormattingElements();
            insertText(t);
            break;
        }
        return;
    }

    switch(t) {
    case DOCTYPE:
        return;
    case COMMENT:
        insertComment(a1);
        return;
    case EOF:
        stopParsing();
        return;
    case TAG:
        switch(a1) {
        case "html":
            transferAttributes(a2, openelts[0]);
            return;
        case "base":
        case "basefont":
        case "bgsound":
        case "command":
        case "link":
        case "meta":
        case "noframes":
        case "script":
        case "style":
        case "title":
            in_head(TAG, a1, a2);
            return;
        case "body":
            var body = openelts[1];
            if (!body || !(body instanceof impl.HTMLBodyElement)) return;
            frameset_ok = false;
            transferAttributes(a2, body);
            return;
        case "frameset":
            if (!framset_ok) return;
            var body = openelts[1];
            if (!body || !(body instanceof impl.HTMLBodyElement)) return;
            if (body.parentNode) body.parentNode.removeChild(body);
            while(!(currentnode instanceof impl.HTMLHtmlElement)) popElement();
            insertHTMLElt(a1, a2);
            insertionMode = in_frameset;
            return;

        case "address":
        case "article":
        case "aside":
        case "blockquote":
        case "center":
        case "details":
        case "dir":
        case "div":
        case "dl":
        case "fieldset":
        case "figcaption":
        case "figure":
        case "footer":
        case "header":
        case "hgroup":
        case "menu":
        case "nav":
        case "ol":
        case "p":
        case "section":
        case "summary":
        case "ul":
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElt(a1, a2);
            return;

        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            if (currentnode instanceof impl.HTMLHeadingElement) popElement();
            insertHTMLElt(a1, a2);
            return;
            
        case "pre":
        case "listing":
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElt(a1, a2);
            // XXX need to ignore the next token if it is a linefeed.
            // How can I do this?  Can't check the array of input chars
            // since it could be empty right now.
            ignoreLinefeed();
            frameset_ok = false;
            return;

        case "form":
            if (form_element_pointer) return;
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            form_element_pointer = insertHTMLElt(a1, a2);

        case "li":
            frameset_ok = false;
            for(var i = openelts.length-1; i >= 0; i--) {
                var node = openelts[i];
                if (node instanceof impl.HTMLLIElement) {
                    in_body(ENDTAG, "li", null);
                    break;
                }
                if (isA(node, specialSet) && !isA(node, addressdivpSet)) 
                    break;
            }
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElt(a1, a2);
            return;

        case "dd":
        case "dt":
            frameset_ok = false;
            for(var i = openelts.length-1; i >= 0; i--) {
                var node = openelts[i];
                if (isA(node, dddtSet)) {
                    in_body(ENDTAG, node.localName(), null);
                    break;
                }
                if (isA(node, specialSet) && !isA(node, addressdivpSet)) 
                    break;
            }
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElt(a1, a2);
            return;
            
        case "plaintext":
            if (inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElt(a1, a2);
            tokenizerState = plaintext_state;
            return;
            
        case "button":
            if (inScope("button")) {
                in_body(ENDTAG, "button", null);
                reprocess(t, a1, a2)
            }
            else {
                reconstructActiveFormattingElements();
                insertHTMLElt(a1, a2);
                frameset_ok = false;
            }
            return;
        }
        break;


    case ENDTAG:
        switch(a1) {
        case "body":
            if (!inScope("body")) return;
            insertionMode = after_body;
            return;
        case "html":
            if (!inScope("body")) return;
            insertionMode = after_body;
            reprocess(t, a1, a2);
            return;

        }
        break;
    }
}


