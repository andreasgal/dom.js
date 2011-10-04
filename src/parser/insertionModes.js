const quirkyPublicIds = /^HTML$|^-\/\/W3O\/\/DTD W3 HTML Strict 3\.0\/\/EN\/\/$|^-\/W3C\/DTD HTML 4\.0 Transitional\/EN$|^\+\/\/Silmaril\/\/dtd html Pro v0r11 19970101\/\/|^-\/\/AdvaSoft Ltd\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/AS\/\/DTD HTML 3\.0 asWedit \+ extensions\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML 2\.0 Strict\/\/|^-\/\/IETF\/\/DTD HTML 2\.0\/\/|^-\/\/IETF\/\/DTD HTML 2\.1E\/\/|^-\/\/IETF\/\/DTD HTML 3\.0\/\/|^-\/\/IETF\/\/DTD HTML 3\.2 Final\/\/|^-\/\/IETF\/\/DTD HTML 3\.2\/\/|^-\/\/IETF\/\/DTD HTML 3\/\/|^-\/\/IETF\/\/DTD HTML Level 0\/\/|^-\/\/IETF\/\/DTD HTML Level 1\/\/|^-\/\/IETF\/\/DTD HTML Level 2\/\/|^-\/\/IETF\/\/DTD HTML Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 0\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 1\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 2\/\/|^-\/\/IETF\/\/DTD HTML Strict Level 3\/\/|^-\/\/IETF\/\/DTD HTML Strict\/\/|^-\/\/IETF\/\/DTD HTML\/\/|^-\/\/Metrius\/\/DTD Metrius Presentational\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 2\.0 Tables\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML Strict\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 HTML\/\/|^-\/\/Microsoft\/\/DTD Internet Explorer 3\.0 Tables\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD HTML\/\/|^-\/\/Netscape Comm\. Corp\.\/\/DTD Strict HTML\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML 2\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended 1\.0\/\/|^-\/\/O'Reilly and Associates\/\/DTD HTML Extended Relaxed 1\.0\/\/|^-\/\/SoftQuad Software\/\/DTD HoTMetaL PRO 6\.0::19990601::extensions to HTML 4\.0\/\/|^-\/\/SoftQuad\/\/DTD HoTMetaL PRO 4\.0::19971010::extensions to HTML 4\.0\/\/|^-\/\/Spyglass\/\/DTD HTML 2\.0 Extended\/\/|^-\/\/SQ\/\/DTD HTML 2\.0 HoTMetaL \+ extensions\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava HTML\/\/|^-\/\/Sun Microsystems Corp\.\/\/DTD HotJava Strict HTML\/\/|^-\/\/W3C\/\/DTD HTML 3 1995-03-24\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Draft\/\/|^-\/\/W3C\/\/DTD HTML 3\.2 Final\/\/|^-\/\/W3C\/\/DTD HTML 3\.2\/\/|^-\/\/W3C\/\/DTD HTML 3\.2S Draft\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.0 Transitional\/\/|^-\/\/W3C\/\/DTD HTML Experimental 19960712\/\/|^-\/\/W3C\/\/DTD HTML Experimental 970421\/\/|^-\/\/W3C\/\/DTD W3 HTML\/\/|^-\/\/W3O\/\/DTD W3 HTML 3\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML 2\.0\/\/|^-\/\/WebTechs\/\/DTD Mozilla HTML\/\//i;

const quirkySystemId = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";

const conditionallyQuirkyPublicIds = /^-\/\/W3C\/\/DTD HTML 4\.01 Frameset\/\/|^-\/\/W3C\/\/DTD HTML 4\.01 Transitional\/\//i;

const limitedQuirkyPublicIds = /^-\/\/W3C\/\/DTD XHTML 1\.0 Frameset\/\/|^-\/\/W3C\/\/DTD XHTML 1\.0 Transitional\/\//i;


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
        break;
    case COMMENT:
        doc.appendChild(doc.createComment(a1));
        break;
    case TAG:
        var name = a1;
        if (name === "html") {
            var elt = doc.createElement(name);
            pushElement(elt);
            doc.appendChild(elt);
            // XXX: handle application cache here
            insertionMode = before_head;
            break;
        }
        else if (name[0] === "/" &&
                 name !== "/head" && 
                 name !== "/body" && 
                 name !== "/html" && 
                 name !== "/br") {
            // ignore most end tags
            break;
        }

        // For any other start tag, or the 4 end tags above,
        // fall through to the default case below
    default:
        var elt = doc.createElement("html");
        pushElement(elt);
        doc.appendChild(elt);
        // XXX: handle application cache here
        insertionMode = before_head;
        reprocess(t,a1,a2,a3);
        break;
    }
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
        break;
    case COMMENT:
        currentnode.appendChild(doc.createComment(a1));
        break;
    case TAG:
        var name = a1;
        if (name === "html") {
            in_body(t,a1,a2,a3);
            break;
        }
        else if (name === "head") {
            var elt = insertHTMLElement(name, a2);
            head_element_pointer = elt;
            insertionMode = in_head;
            break;
        }
        else if (name[0] === '/' &&
                 !/^(\/head|\/body|\/html|\/br)|$/.test(name)) {
            // ignore most end tags
            break;
        }
        // fallthrough on any other tags

    default:
        before_head(TAG, "head", null);  // create a head tag
        reprocess(t, a1, a2);          // then try again with this token
        break;
    }
}

function in_head(t, a1, a2, a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        insertText(t);
        break;
    case COMMENT:
        insertComment(a1);
        break;
    case DOCTYPE:
        break;
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
        case "/head":
            popElement();
            insertionMode = after_head;
            return;
        case "/body":
        case "/html":
        case "/br":
            // Break out of inner switch and fallthrough to the 
            // default case of the outer switch
            break; 
        default: 
            if (a1 == "head" || a1[0] === "/") {
                // Ignore it
                return;
            }
            // otherwise fallthrough
        }
        /* fallthrough */
    default:
        in_head(TAG, "/head", null);   // synthetic </head>
        reprocess(t, a1, a2, a3);      // Then redo this one
        break;
    }
}

// 13.2.5.4.5 The "in head noscript" insertion mode
function in_head_noscript(t, a1, a2, a3) {
    switch(t) {
    case DOCTYPE:
        break;
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
    case COMMENT:
        in_head(t, a1);
        break;
    case TAG:
        switch(a1) {
        case "html":
            in_body(t, a1, a2);
            return;
        case "/noscript":
            popElement();
            insertionMode = in_head;
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
        case "/br":
            break;  // fallthrough to the outer default
        default:
            if (a1[0] === "/") return; // ignore other end tags
            break; // otherwise fallthrough to the outer default
        }
    default: 
        in_head_noscript(TAG, "/noscript", null);
        reprocess(t, a1, a2, a3);
        break;
    }
}

function after_head(t, a1, a2, a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        insertText(t);
        break;
    case COMMENT:
        insertComment(a1);
        break;
    case DOCTYPE:
        break;
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
        case "/body":
        case "/html":
        case "/br":
            break; // and fallthrough
        default:
            if (a1[0] === '/') return;  // ignore any other end tag
            break;  // Otherwise fallthrough
            
        }
        // fallthrough
    default:
        after_head(TAG, "body", null);
        frameset_ok = true;
        reprocess(t, a1, a2, a3);
        break;
    }
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
        break;
    case COMMENT:
        insertComment(a1);
        break;
    case EOF:
        stopParsing();
        break;
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
            if (!body || body.tagName !== "BODY") return;
            frameset_ok = false;
            transferAttributes(a2, body);
            return;
        case "frameset":
            if (!framset_ok) return;
            var body = openelts[1];
            if (!body || body.tagName !== "BODY") return;
            if (body.parentNode) body.parentNode.removeChild(body);
            while(currentnode.tagName !== "HTML") popElement();
            insertHTMLElt(a1, a2);
            insertionMode = in_frameset;
            return;

        case "/body":
            if (!inscope("body")) return;
            insertionMode = after_body;
            return;
        case "/html":
            if (!inscope("body")) return;
            insertionMode = after_body;
            reprocess(t, a1, a2);

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
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            insertHTMLElt(a1, a2);
            return;

        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            var s = currentnode.tagName;
            if (s[0] === "H" && s.length === 2) {
                var d = s.charCodeAt(1) - 48;
                if (d >= 1 && d <= 6) 
                    popElement();
            }
            insertHTMLElt(a1, a2);
            return;
            
        case "pre":
        case "listing":
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            insertHTMLElt(a1, a2);
            // XXX need to ignore the next token if it is a linefeed.
            // How can I do this?  Can't check the array of input chars
            // since it could be empty right now.
            ignoreLinefeed();
            frameset_ok = false;
            return;

        case "form":
            if (form_element_pointer) return;
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            form_element_pointer = insertHTMLElt(a1, a2);

        case "li":
            frameset_ok = false;
            for(var i = openelts.length-1; i >= 0; i--) {
                var node = openelts[i];
                var tagname = node.tagName;
                if (tagname === "LI") {
                    in_body(TAG, "/li", null);
                    break;
                }
                if (isSpecial(node) && tagname !== "ADDRESS" &&
                    tagname !== "DIV" && tagname !== "P") 
                    break;
            }
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            insertHTMLElt(a1, a2);
            return;

        case "dd":
        case "dt":
            frameset_ok = false;
            for(var i = openelts.length-1; i >= 0; i--) {
                var node = openelts[i];
                var tagname = node.tagName;
                if (tagname === "DD" || tagname === "DT") {
                    in_body(TAG, "/" + tagname.toLowerCase(), null);
                    break;
                }
                if (isSpecial(node) && tagname !== "ADDRESS" &&
                    tagname !== "DIV" && tagname !== "P") 
                    break;
            }
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            insertHTMLElt(a1, a2);
            return;
            
        case "plaintext":
            if (inButtonScope("p")) in_body(TAG, "/p", null);
            insertHTMLElt(a1, a2);
            tokenizerState = plaintext_state;
            return;
            
            
            

        }


        /* fallthrough */
    default:
        break;
    }
}


function (t,a1,a2,a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        break;
    case DOCTYPE:
        break;
    case COMMENT:
        break;
    case TAG:
        switch(a1) {
        }
        /* fallthrough */
    default:
        break;
    }
}

function (t,a1,a2,a3) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        break;
    case DOCTYPE:
        break;
    case COMMENT:
        break;
    case TAG:
        switch(a1) {
        }
        /* fallthrough */
    default:
        break;
    }
}
