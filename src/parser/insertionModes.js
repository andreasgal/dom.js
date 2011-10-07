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

var tablesectionrowSet = {
    HTML_NAMESPACE: {
        "table":true,
        "thead":true,
        "tbody":true,
        "tfoot":true,
        "tr":true
    }
};

// Determine whether the element is a member of the set.
// The set is an object that maps namespaces to objects. The objects
// then map local tagnames to the value true if that tag is part of the set
function isA(elt, set) {
    var tagnames = set[elt.namespaceURI];
    return tagnames ? elt.localName in tagnames : false;
}


var impliedEndTagsSet = {
    HTML_NAMESPACE: {
        "dd": true,
        "dt": true,
        "li": true,
        "option": true,
        "optgroup": true,
        "p": true,
        "rp": true,
        "rt": true
    }
};


function parseRawText(name, attrs) {
    insertHTMLElement(name, attrs);
    tokenizerState = rawtext_state;
    originalInsertionMode = insertionMode;
    insertionMode = text;
}

function parseRCDATA(name, attributes) {
    insertHTMLElement(name, attrs);
    tokenizerState = rcdata_state;
    originalInsertionMode = insertionMode;
    insertionMode = text;
}

var svgAttrAdjustments = {
    attributename: "attributeName",
    attributetype: "attributeType",
    basefrequency: "baseFrequency",
    baseprofile: "baseProfile",
    calcmode: "calcMode",
    clippathunits: "clipPathUnits",
    contentscripttype: "contentScriptType",
    contentstyletype: "contentStyleType",
    diffuseconstant: "diffuseConstant",
    edgemode: "edgeMode",
    externalresourcesrequired: "externalResourcesRequired",
    filterres: "filterRes",
    filterunits: "filterUnits",
    glyphref: "glyphRef",
    gradienttransform: "gradientTransform",
    gradientunits: "gradientUnits",
    kernelmatrix: "kernelMatrix",
    kernelunitlength: "kernelUnitLength",
    keypoints: "keyPoints",
    keysplines: "keySplines",
    keytimes: "keyTimes",
    lengthadjust: "lengthAdjust",
    limitingconeangle: "limitingConeAngle",
    markerheight: "markerHeight",
    markerunits: "markerUnits",
    markerwidth: "markerWidth",
    maskcontentunits: "maskContentUnits",
    maskunits: "maskUnits",
    numoctaves: "numOctaves",
    pathlength: "pathLength",
    patterncontentunits: "patternContentUnits",
    patterntransform: "patternTransform",
    patternunits: "patternUnits",
    pointsatx: "pointsAtX",
    pointsaty: "pointsAtY",
    pointsatz: "pointsAtZ",
    preservealpha: "preserveAlpha",
    preserveaspectratio: "preserveAspectRatio",
    primitiveunits: "primitiveUnits",
    refx: "refX",
    refy: "refY",
    repeatcount: "repeatCount",
    repeatdur: "repeatDur",
    requiredextensions: "requiredExtensions",
    requiredfeatures: "requiredFeatures",
    specularconstant: "specularConstant",
    specularexponent: "specularExponent",
    spreadmethod: "spreadMethod",
    startoffset: "startOffset",
    stddeviation: "stdDeviation",
    stitchtiles: "stitchTiles",
    surfacescale: "surfaceScale",
    systemlanguage: "systemLanguage",
    tablevalues: "tableValues",
    targetx: "targetX",
    targety: "targetY",
    textlength: "textLength",
    viewbox: "viewBox",
    viewtarget: "viewTarget",
    xchannelselector: "xChannelSelector",
    ychannelselector: "yChannelSelector",
    zoomandpan: "zoomAndPan"
};


function adjustSVGAttributes(attrs) {
    for(var i = 0, n = attrs.length; i < n; i++) {
        if (attrs[i][0] in svgAttrAdjustments) {
            attrs[i][0] = svgAttrAdjustments[attrs[i][0]];
        }
    }
}

function adjustMathMLAttributes(attrs) {
    for(var i = 0, n = attrs.length; i < n; i++) {
        if (attrs[i][0] === "definitionurl") {
            attrs[i][0] = "definitionURL";
            break;
        }
    }
}

var foreignAttributes = {
    "xlink:actuate": XLINK_NAMESPACE,
    "xlink:arcrole": XLINK_NAMESPACE,
    "xlink:href":    XLINK_NAMESPACE,
    "xlink:role":    XLINK_NAMESPACE,
    "xlink:show":    XLINK_NAMESPACE,
    "xlink:title":   XLINK_NAMESPACE,
    "xlink:type":    XLINK_NAMESPACE,
    "xml:base":      XML_NAMESPACE,
    "xml:lang":      XML_NAMESPACE,
    "xml:space":     XML_NAMESPACE,
    "xmlns":         XMLNS_NAMESPACE,
    "xmlns:xlink":   XMLNS_NAMESPACE,
};

function adjustForeignAttributes(attrs) {
    for(var i = 0, n = attrs.length; i < n; i++) {
        if (attrs[i][0] in foreignAttributes) {
            // Attributes with namespaces get a 3rd element:
            // [Qname, value, namespace]
            push(attrs[i], foreignAttributes[attrs[i][0]]);
        }
    }
}

var BOOKMARK = {};  // Used by the adoptionAgency() function

function adoptionAgency(tag) {
    // Let outer loop counter be zero.
    var outer = 0;

    // Outer loop: If outer loop counter is greater than or equal to eight,
    // then abort these steps.
    while(outer < 8) {
        // Increment outer loop counter by one.
        outer++;

        // Let the formatting element be the last element in the list of active
        // formatting elements that: is between the end of the list and the
        // last scope marker in the list, if any, or the start of the list
        // otherwise, and has the same tag name as the token.
        var fmtelt = afe.findElementByTag(tag);


        // If there is no such node, then abort these steps and instead act as
        // described in the "any other end tag" entry below.
        if (!fmtelt)
            return false;  // false means handle by the default case

        // Otherwise, if there is such a node, but that node is not in the
        // stack of open elements, then this is a parse error; remove the
        // element from the list, and abort these steps.
        var index = A.lastIndexOf(stack.elements, fmtelt);
        if (index === -1) {
            afe.remove(fmtelt);
            return true;   // true means no more handling required
        }

        // Otherwise, if there is such a node, and that node is also in the
        // stack of open elements, but the element is not in scope, then this
        // is a parse error; ignore the token, and abort these steps.
        if (!stack.elementInScope(fmtelt)) {
            return true;
        }

        // Let the furthest block be the topmost node in the stack of open
        // elements that is lower in the stack than the formatting element, and
        // is an element in the special category. There might not be one.
        var furthestblock = null, furthestblockindex;
        for(var i = index+1; i < stack.elements.length; i++) {
            if (isA(stack.elements[i], specialSet)) {
                furthestblock = stack.elements[i];
                furthestblockindex = i;
                break;
            }
        }

        // If there is no furthest block, then the UA must skip the subsequent
        // steps and instead just pop all the nodes from the bottom of the
        // stack of open elements, from the current node up to and including
        // the formatting element, and remove the formatting element from the
        // list of active formatting elements.
        if (!furthestblock) {
            stack.popElement(fmtelt);
            afe.remove(fmtelt);
        }
        else {
            // Let the common ancestor be the element immediately above the
            // formatting element in the stack of open elements.
            var ancestor = stack.elements[index-1];

            // Let a bookmark note the position of the formatting element in
            // the list of active formatting elements relative to the elements
            // on either side of it in the list.
            afe.insertAfter(fmtelt, BOOKMARK);
            
            // Let node and last node be the furthest block. 
            var node = furthestblock;
            var lastnode = furthestblock;
            var nodeindex = furthestblockindex;

            // Let inner loop counter be zero.
            var inner = 0; 

            // Inner loop: If inner loop counter is greater than or equal to
            // three, then abort these steps.
            while(inner < 3) {
                // Increment inner loop counter by one.
                inner++;
                // Let node be the element immediately above node in the stack
                // of open elements, or if node is no longer in the stack of
                // open elements (e.g. because it got removed by the next
                // step), the element that was immediately above node in the
                // stack of open elements before node was removed.
                node = stack.elements[--nodeindex];

                // If node is not in the list of active formatting elements,
                // then remove node from the stack of open elements and then go
                // back to the step labeled inner loop.
                if (!afe.contains(node)) {
                    stack.removeElement(node);
                    continue;
                }

                // Otherwise, if node is the formatting element, then go to the
                // next step in the overall algorithm.
                if (node === fmtelt) break;

                // Create an element for the token for which the element node
                // was created, replace the entry for node in the list of
                // active formatting elements with an entry for the new
                // element, replace the entry for node in the stack of open
                // elements with an entry for the new element, and let node be
                // the new element.
                var newelt = node.cloneNode(false);
                afe.replace(node, newelt);
                stack.elements[nodeindex] = newelt;
                node = newelt;

                // If last node is the furthest block, then move the
                // aforementioned bookmark to be immediately after the new node
                // in the list of active formatting elements.
                if (lastnode === furthestblock) {
                    afe.remove(BOOKMARK);
                    afe.insertAfter(newelt, BOOKMARK);
                }
                
                // Insert last node into node, first removing it from its
                // previous parent node if any.
                node.appendChild(lastnode);

                // Let last node be node.
                lastnode = node;
            }

            // If the common ancestor node is a table, tbody, tfoot, thead, or
            // tr element, then, foster parent whatever last node ended up
            // being in the previous step, first removing it from its previous
            // parent node if any.
            if (isA(ancestor, tablesectionrowSet)) {
                var fosterparent = stack.getFosterParent();
                fosterparent.appendChild(lastnode);
            }
            // Otherwise, append whatever last node ended up being in the
            // previous step to the common ancestor node, first removing it
            // from its previous parent node if any.
            else {
                ancestor.appendChild(lastnode);
            }

            // Create an element for the token for which the formatting element
            // was created.
            var newelt = fmtelt.cloneNode(false);

            // Take all of the child nodes of the furthest block and append
            // them to the element created in the last step.
            while(furthestblock.hasChildNodes()) {
                newelt.appendChild(furthestblock.firstChild);
            }

            // Append that new element to the furthest block.
            furthestblock.appendChild(newelt);

            // Remove the formatting element from the list of active formatting
            // elements, and insert the new element into the list of active
            // formatting elements at the position of the aforementioned
            // bookmark.
            afe.remove(fmtelt);
            afe.replace(BOOKMARK, newelt);

            // Remove the formatting element from the stack of open elements,
            // and insert the new element into the stack of open elements
            // immediately below the position of the furthest block in that
            // stack.
            stack.removeElement(fmtelt);
            var pos = A.lastIndexOf(stack.elements, furthestblock);
            splice(stack.elements, pos, 0, newelt);
        }
    }

    return true;
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

        // Note that there is no public API for setting quirks mode
        // We can do this here because we have access to implementation details
        if (force_quirks || 
            name.toLowerCase() !== "html" ||
            quirkyPublicIds.test(publicid) ||
            systemid.toLowerCase() === quirkySystemId ||
            (systemid === undefined &&
             conditionallyQuirkyPublicIds.test(publicId)))
            doc._quirks = true;
        else if (limitedQuirkyPublicIds.test(publicId) ||
                 (systemid !== undefined &&
                  conditionallyQuirkyPublicIds.test(publicId)))
            doc._limitedQuirks = true;
        insertionMode = before_html;
        break;
    default:  // tags or non-whitespace text
        doc._quirks = true;
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
            stack.push(elt);
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
    stack.push(elt);
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
        stack.top.appendChild(doc.createComment(a1));
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
            insertHTMLElement(a1, a2);
            stack.pop();
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
            stack.top.appendChild(elt);
            stack.push(elt);

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
            stack.pop();
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
            stack.pop();
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
            insertHTMLElement(a1, a2);
            frameset_ok = false;
            insertionMode = in_body;
            return;
        case "frameset":
            insertHTMLElement(a1, a2);
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
            stack.push(head_element_pointer);
            in_head(TAG, a1, a2);
            stack.removeElement(head_element_pointer);
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
            afe.reconstruct();
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
            transferAttributes(a2, stack.elements[0]);
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
            var body = stack.elements[1];
            if (!body || !(body instanceof impl.HTMLBodyElement)) return;
            frameset_ok = false;
            transferAttributes(a2, body);
            return;
        case "frameset":
            if (!framset_ok) return;
            var body = stack.elements[1];
            if (!body || !(body instanceof impl.HTMLBodyElement)) return;
            if (body.parentNode) body.parentNode.removeChild(body);
            while(!(stack.top instanceof impl.HTMLHtmlElement)) stack.pop();
            insertHTMLElement(a1, a2);
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
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1, a2);
            return;

        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            if (stack.top instanceof impl.HTMLHeadingElement) stack.pop();
            insertHTMLElement(a1, a2);
            return;
            
        case "pre":
        case "listing":
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1, a2);
            // XXX need to ignore the next token if it is a linefeed.
            // How can I do this?  Can't check the array of input chars
            // since it could be empty right now.
            ignoreLinefeed();
            frameset_ok = false;
            return;

        case "form":
            if (form_element_pointer) return;
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            form_element_pointer = insertHTMLElement(a1, a2);
            return;

        case "li":
            frameset_ok = false;
            for(var i = stack.elements.length-1; i >= 0; i--) {
                var node = stack.elements[i];
                if (node instanceof impl.HTMLLIElement) {
                    in_body(ENDTAG, "li", null);
                    break;
                }
                if (isA(node, specialSet) && !isA(node, addressdivpSet)) 
                    break;
            }
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1, a2);
            return;

        case "dd":
        case "dt":
            frameset_ok = false;
            for(var i = stack.elements.length-1; i >= 0; i--) {
                var node = stack.elements[i];
                if (isA(node, dddtSet)) {
                    in_body(ENDTAG, node.localName, null);
                    break;
                }
                if (isA(node, specialSet) && !isA(node, addressdivpSet)) 
                    break;
            }
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1, a2);
            return;
            
        case "plaintext":
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1, a2);
            tokenizerState = plaintext_state;
            return;
            
        case "button":
            if (stack.inScope("button")) {
                in_body(ENDTAG, "button", null);
                reprocess(t, a1, a2)
            }
            else {
                afe.reconstruct();
                insertHTMLElement(a1, a2);
                frameset_ok = false;
            }
            return;

        case "a":
            var activeElement = afe.findElementByTag("a");
            if (activeElement) {
                in_body(ENDTAG, a1);
                afe.remove(activeElement);
                stack.removeElement(activeElement);
            }
            /* fallthrough */

        case "b":
        case "big":
        case "code":
        case "em":
        case "font":
        case "i":
        case "s":
        case "small":
        case "strike":
        case "strong":
        case "tt":
        case "u":
            afe.reconstruct();
            afe.push(insertHTMLElement(a1,a2));
            return;

        case "nobr":
            afe.reconstruct();

            if (stack.inScope(a1)) {
                in_body(ENDTAG, a1);
                afe.reconstruct();
            }
            afe.push(insertHTMLElement(a1,a2));
            return;

        case "applet":
        case "marquee":
        case "object":
            afe.reconstruct();
            insertHTMLElement(a1,a2);
            afe.insertMarker();
            return;

        case "table":
            if (!doc._quirks && stack.inButtonScope("p")) {
                in_body(ENDTAG, "p");
            }
            insertHTMLElement(a1,a2);
            frameset_ok = false;
            insertionMode = in_table;
            return;

        case "area":
        case "br":
        case "embed":
        case "img":
        case "keygen":
        case "wbr":
            afe.reconstruct();
            insertHTMLElement(a1,a2);
            stack.pop();
            frameset_ok = false;
            return;
            
        case "input":
            afe.reconstruct();
            var elt = insertHTMLElement(a1,a2);
            stack.pop();
            var type = elt.getAttribute("type");
            if (type.toLowerCase() !== "hidden")
                frameset_ok = false;
            return;

        case "param":
        case "source":
        case "track":
            insertHTMLElement(a1,a2);
            stack.pop();
            return;

        case "hr":
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            insertHTMLElement(a1,a2);
            stack.pop();
            frameset_ok = false;
            return;

        case "image":
            in_body(TAG, "img", a2);
            return;

        case "isindex":
            if (form_element_pointer) return;
            (function handleIsIndexTag(attrs) {
                var actionAttribute = null, prompt, hasnameattr;
                for(var i = 0; i < attrs.length; i++) {
                    var a = attrs[i];
                    if (a[0] === "action") {
                        actionAttribute = splice(attrs, i, 1);
                        i--;
                    }
                    else if (a[0] === "prompt") {
                        prompt = splice(attrs, i, 1)[1];
                        i--;
                    }
                    else if (a[0] === "name") {
                        hasnameattr = true;
                        a[1] = "isindex";
                    }
                }
                if (!hasnameattr) attrs.push(["name", "isindex"]);
                
                reprocess(TAG, "form", actionAttribute);
                reprocess(TAG, "hr", null);
                reprocess(TAG, "label", null);

                // Now inefficiently output the label one char at a time
                // The default prompt presumably needs localization.
                if (!prompt)
                    prompt="This is a searchable index. Enter search keywords:";
                for(var i = 0, n = prompt.length; i < n; i++)
                    emitChar(prompt.charCodeAt(i));

                reprocess(TAG, "input", attrs);
                reprocess(ENDTAG, "label");
                reprocess(TAG, "hr", null);
                reprocess(ENDTAG, "form");
            }(a2));
            return;
            
        case "textarea":
            insertHTMLElement(a1,a2);
            ignoreLinefeed();
            frameset_ok = false;
            tokenizerMode = rc_data_state;
            originalInsertionMode = insertionMode;
            insertionMode = "text";
            return;

        case "xmp":
            if (stack.inButtonScope("p")) in_body(ENDTAG, "p");
            afe.reconstruct();
            frameset_ok = false;
            parseRawText(a1, a2);
            return;

        case "iframe":
            frameset_ok = false;
            parseRawText(a1, a2);
            return;

        case "noembed":
            parseRawText(a1,a2);
            return;

        case "noscript":
            if (scripting_enabled) {
                parseRawText(a1,a2);
                return;
            }
            break;  // XXX Otherwise treat it as any other open tag?
            
        case "select":
            afe.reconstruct();
            insertHTMLElement(a1,a2);
            frameset_ok = false;
            if (insertionMode === in_table ||
                insertionMode === in_caption ||
                insertionMode === in_table_body ||
                insertionMode === in_row ||
                insertionMode === in_cell)
                insertionMode = in_select_in_table;
            else
                insertionMode = in_select;
            return;

        case "optgroup":
        case "option":
            if (stack.top instanceof impl.HTMLOptionElement) {
                in_body(ENDTAG, "option");
            }
            afe.reconstruct();
            insertHTMLElement(a1,a2);
            return;

        case "rp":
        case "rt":
            if (stack.inScope("ruby")) {
                stack.generateImpliedEndTags();
            }
            insertHTMLElement(a1,a2);
            return;

        case "math":
            afe.reconstruct();
            adjustMathMLAttributes(a2);
            adjustForeignAttributes(a2);
            insertForeignElement(a1, a2, MATHML_NAMESPACE);
            if (a3) // self-closing flag
                stack.pop();
            return;

        case "svg":
            afe.reconstruct();
            adjustSVGAttributes(a2);
            adjustForeignAttributes(a2);
            insertForeignElement(a1, a2, SVG_NAMESPACE);
            if (a3) // self-closing flag
                stack.pop();
            return;
            
        case "caption":
        case "col":
        case "colgroup":
        case "frame":
        case "head":
        case "tbody":
        case "td":
        case "tfoot":
        case "th":
        case "thead":
        case "tr":
            // Ignore table tags if we're not in_table mode
            return;
        }

        // Handle any other start tag here
        // (and also <noscript> tags when scripting is disabled)
        afe.reconstruct();
        insertHTMLElement(a1,a2);
        return;

    case ENDTAG:
        switch(a1) {
        case "body":
            if (!stack.inScope("body")) return;
            insertionMode = after_body;
            return;
        case "html":
            if (!stack.inScope("body")) return;
            insertionMode = after_body;
            reprocess(t, a1, a2);
            return;

        case "address":
        case "article":
        case "aside":
        case "blockquote":
        case "button":
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
        case "listing":
        case "menu":
        case "nav":
        case "ol":
        case "pre":
        case "section":
        case "summary":
        case "ul":
            // Ignore if there is not a matching open tag
            if (!stack.inScope(a1)) return;
            stack.generateImpliedEndTags();
            stack.popTag(a1);
            return;

        case "form":
            var openform = form_element_pointer;
            form_element_pointer = null;
            if (openform == null || !stack.elementInScope(openform)) return;
            stack.generateImpliedEndTags();
            stack.removeElement(openform);
            return;

        case "p":
            if (!stack.inButtonScope(a1)) {
                in_body(TAG, a1, null);
                reprocess(t, a1, a2, a3);
            }
            else {
                stack.generateImpliedEndTags(a1);
                stack.popTag(a1);
            }
            return;

        case "li":
            if (!stack.inListItemScope(a1)) return;
            stack.generateImpliedEndTags(a1);
            stack.popTag(a1);
            return;

        case "dd":
        case "dt":
            if (!stack.inScope(a1)) return;
            stack.generateImpliedEndTags(a1);
            stack.popTag(a1);
            return;

        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            if (!stack.elementTypeInScope(impl.HTMLHeadingElement)) return;
            stack.generateImpliedEndTags();
            stack.popElementType(impl.HTMLHeadingElement);
            return;
            
        case "a":
        case "b":
        case "big":
        case "code":
        case "em":
        case "font":
        case "i":
        case "nobr":
        case "s":
        case "small":
        case "strike":
        case "strong":
        case "tt":
        case "u":
            var result = adoptionAgency(a1);
            if (result) return;  // If we did something we're done
            else break;          // Go to the "any other end tag" case

        case "applet":
        case "marquee":
        case "object":
            if (!stack.inScope(a1)) return;
            stack.generateImpliedEndTags();
            stack.popTag(a1);
            afe.clearToMarker();
            return;

        case "br":
            in_body(TAG, a1, null);  // Turn </br> into <br>
            return;
        }

        // Any other end tag goes here
        for(var i = stack.elements.length-1; i >= 0; i--) {
            var node = stack.elements[i];
            if (node.localName === a1) {
                stack.generateImpliedEndTags(a1);
                stack.popElement(node);
                break;
            }
            else if (isA(node, specialSet)) {
                return;
            }
        }

        return;
    }
}

function text() {
    // XXX: come back to this
    // it has complicated processing for </script>
}

function in_table(t, a1, a2, a3) {
    if (t >= 0) {  // text
        pending_table_text = [];
        originalInsertionMode = insertionMode;
        insertionMode = in_table_text;
        reprocess(t, a1, a2, a3);
        return;
    }

    switch(t) {
    case COMMENT: 
        insertComment(a1);
        return;
    case DOCTYPE:
        return;
    case TAG:
        switch(a1) {
        case "caption":
            stack.clearToTableContext();
            afe.insertMarker();
            insertHTMLElement(a1,a2);
            insertionMode = in_caption;
            return;
        case "colgroup":
            stack.clearToTableContext();
            insertHTMLElement(a1,a2);
            insertionMode = in_column_group;
            return;
        case "col":
            in_table(TAG, "colgroup", null);
            reprocess(t, a1, a2, a3);
            return;
        case "tbody":
        case "tfoot":
        case "thead":
            stack.clearToTableContext();
            insertHTMLElement(a1,a2);
            insertionMode = in_table_body;
            return;
        case "td":
        case "th":
        case "tr":
            in_table(TAG, "tbody", null);
            reprocess(t, a1, a2, a3);
            return;

        case "table":
            var repro = stack.inTableScope(a1);
            in_table(ENDTAG, a1);
            if (repro) reprocess(t, a1, a2, a3);
            return;

        case "style":
        case "script":
            in_head(t, a1, a2, a3);
            return;

        case "input":
            var type = getTypeAttr(a2);
            if (type !== "hidden") break;  // to the anything else case
            insertHTMLElement(a1,a2);
            stack.pop();
            return;

        case "form":
            if (form_element_pointer) return;
            form_element_pointer = insertHTMLElement(a1, a2);
            stack.pop();
            return;
        }
        break;
    case ENDTAG:
        switch(a1) {
        case "table":
            if (!stack.inTableScope(a1)) return;
            stack.popTag(a1);
            resetInsertionMode();
            return;
        case "body":
        case "caption":
        case "col":
        case "colgroup":
        case "html":
        case "tbody":
        case "td":
        case "tfoot":
        case "th":
        case "thead":
        case "tr":
            return;
            
        }

        break;
    case EOF:
        stopParsing();
        return;
    default:
        break;
    }

    // This is the anything else case
    foster_parent_mode = true;
    in_body(t, a1, a2, a3);
    foster_parent_mode = false;
}

function in_table_text(t, a1, a2, a3) {
    if (t > 0) {
        pending_table_text.push(t);
        return;
    }
    if (t === 0) return;

    /*
      If any of the tokens in the pending table character tokens list
      are character tokens that are not space characters, then
      reprocess those character tokens using the rules given in the
      "anything else" entry in the "in table" insertion mode.

      Otherwise, insert the characters given by the pending table
      character tokens list into the current node.

      Switch the insertion mode to the original insertion mode and
      reprocess the token.
    */
    // XXX: need to figure out how I'm going to efficiently handle
    // strings of text.
}