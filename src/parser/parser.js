"use strict";

// XXX: will have to add arguments for fragment parsing, I think.
// To use the returned HTMLParser object, append text to it with append()
// Insert text (from document.write()) with insert(). Call end() when
// all text has been appended, and it will return a Document (?) or
// DocumentFragment (?)
//
// Everything goes inside this one function, with help from cpp
// and its #include directives
// 
function HTMLParser(domimpl) {
    const BOF = 0xFEFF;
    const CR = 0x000D;
    const LF = 0x000A;

    // Token types for the tree builder.
    const EOF = -1;  // XXX: use \uFFFF?
    const TEXT = 1;
    const TAG = 2;
    const ENDTAG = 3;
    const COMMENT = 4;
    const DOCTYPE = 5;

    var doc = domimpl.createHTMLDocument("", "", "");
    while(doc.hasChildNodes()) doc.removeChild(doc.lastChild);

    // Scanner state
    var chars = null;       
    var numchars = 0;     // Length of chars
    var nextchar = 0;     // Index of next char 
    var currentchar = -1; // Codepoint most recently pushed to tokenizer
    var input_complete = false; // Becomes true when end() called.

    // Tokenizer state
    var tokenizerState = data_state;
    var savedTokenizerStates = [];
    var tagnamebuf = [];
    var tempbuf = [];
    var attrnamebuf = [];
    var attrvaluebuf = [];
    var commentbuf = [];
    var doctypebuf = []
    var doctypepublicbuf = [];
    var doctypesystembuf = [];
    var attributes = [];
    var is_end_tag = false;

    // Tree builder state
    var fragment = false; // Are we parsing a fragment?
    var script_nesting_level = 0;
    var parser_pause_flag = false;
    var insertionMode = initial_mode;
    var originalInsertionMode = null;
    var stack = new ElementStack();
    var afe = new ActiveFormattingElements();
    var head_element_pointer = null;
    var form_element_pointer = null;
    var scripting_enabled = true;  // Constructor argument to set this false?
    var frameset_ok = true;
    var force_quirks = false;

    // A single run of characters, buffered up to be sent to
    // the parser as a single string.
    // XXX: would this be faster with a typed Uint16Array?
    var textrun = [];

// XXX
// these are in ../snapshot.js
//    var push = Array.push;
//    var pop = Array.pop;
//    var foreach = Array.forEach;

    function buf2str(buf) { return String.fromCharCode.apply(String,buf); }

    function addAttribute(namebuf,valuebuf) {
        var name = buf2str(namebuf);
        var value;

        // Make sure there isn't already an attribute with this name
        // If there is, ignore this one.
        for(var i = 0; i < attributes.length; i++) {
            if (attributes[i][0] === name) return;
        }
        
        if (valuebuf) {
            push(attributes, [name, buf2str(valuebuf)]);
        }
        else {
            push(attributes, [name]);
        }
    }


#define switchTo(state) tokenizerState = state
#define pushState() push(savedTokenizerStates, tokenizerState)
#define popState() tokenizerState = pop(savedTokenizerStates)
#define beginTagName() {\
    is_end_tag = false; \
    tagnamebuf.length = 0; \
    attributes.length = 0;
#define beginEndTagName() {\
    is_end_tag = true; \
    tagnamebuf.length = 0; \
    attributes.length = 0;}

#define beginTempBuf() tempbuf.length = 0
#define beginAttrName() attrnamebuf.length = 0
#define beginAttrValue() attrvaluebuf.length = 0
#define beginComment() commentbuf.length = 0
#define beginDoctype() {\
    doctypebuf.length = 0; \
    doctypepublicbuf = null;\
    doctypesystembuf = null;}
#define beginDoctypePublicId() doctypepublicbuf = []
#define beginDoctypeSystemId() doctypesystembuf = []
#define appendChar(buf, char) push(buf, char)
#define forcequirks() force_quirks = true
#define cdataAllowed() stack.top.namespaceURI !== "http://www.w3.org/1999/xhtml"

// Back up one character so the codepoint just passed to the tokenizer
// gets passed to the tokenizer again. If the scanner was at CRLF
// it emits a LF.  After pushback it points to a LF alone and also
// emits a LF. This should never be called twice from a tokenizer
// state.  And its shouldn't be called from a state that uses
// lookahead, either.
#define pushback() nextchar--

/*
#define emitChar(c) insertionMode(c);
#define emitChars(buf) foreach(buf, insertionMode);
*/
#define emitChar(c) push(textrun, c);
#define emitChars(buf) pushAll(textrun, buf);

    function flushText() {
        if (textrun.length > 0) {
            var s = buf2str(textrun);
            textrun.length = 0;
            // XXX: does this always consume all of s?
            // Or do we sometimes have to take some of it back?
            // Do we need to check the return value?
            insertionMode(TEXT, s);
        }
    }

    // This is used by CDATA sections 
    function emitCharString(s) {
        flushText();
        // XXX see comment in flushText() above
        insertionMode(TEXT, s);
    }

#define emitTag() {\
    flushText(); \
    if (is_end_tag) insertionMode(ENDTAG, buf2str(tagnamebuf)); \
    else insertionMode(TAG, buf2str(tagnamebuf), attributes);}
#define emitSelfClosingTag() {\
    flushText(); \
    if (is_end_tag) insertionMode(ENDTAG, buf2str(tagnamebuf), null, true); \
    else insertionMode(TAG, buf2str(tagnamebuf), attributes, true);}
#define emitComment() {\
    flushText(); \
    insertionMode(COMMENT, buf2str(commentbuf));}
#define emitCommentString(s) {\
    flushText(); \
    insertionMode(COMMENT, s);}
#define emitDoctype() {\
    flushText(); \
    insertionMode(DOCTYPE, \
                  buf2str(doctypebuf), \
                  doctypepublicbuf ? buf2str(doctypepublicbuf) : undefined, \
                  doctypesystembuf ? buf2str(doctypesystembuf) : undefined);}


// Tree building macros and functions
#define reprocess(t,a1,a2,a3) insertionMode(t,a1,a2,a3)
#define insertComment(data) stack.top.appendChild(doc.createComment(data))

    function insertText(s) {
        if (stack.top.lastChild.nodeType === Node.TEXT_NODE) {
            stack.top.lastChild.appendData(s);
        }
        else {
            stack.top.appendChild(doc.createTextNode(s));
        }
    }

    function createHTMLElt(name, attrs) {
        var elt = doc.createElement(name);
        if (attrs) {
            for(var i = 0, n = attrs.length; i < n; i++) {
                elt.setAttribute(attrs[i][0], attrs[i][1]);
            }
        }
        // XXX
        // If the element is a resettable form element,
        // run its reset algorithm now
        return elt;
    }
    
    // The in_table insertion mode turns on this flag, and that makes
    // insertHTMLElement use the foster parenting algorithm for elements
    // tags inside a table
    var foster_parent_mode = false;

    function insertHTMLElement(name, attrs) {
        var elt = createHTMLElt(name, attrs);

        if (foster_parent_mode) 
            stack.getFosterParent().appendChild(elt);
        else
            stack.top.appendChild(elt);

        pushElement(elt);

        // XXX
        // If this is a form element, set its form attribute property

        return elt;
    }


    function insertForeignElement(name, attrs, ns) {
        var elt = doc.createElementNS(name, ns);
        
        if (attrs) {
            for(var i = 0, n = attrs.length; i < n; i++) {
                var attr = attrs[i];
                if (attr.length == 2) 
                    elt.setAttribute(attr[0], attr[1]);
                else
                    elt.setAttributeNS(attr[2], attr[0], attr[1]);
            }
        }

        stack.top.appendChild(elt);
        pushElement(elt);
    }


#include "parseCharacterReference.js"
#include "tokenizerStates.js"
#include "insertionModes.js"
#include "activeFormattingElements.js"
#include "elementStack.js"

    // Add the string s to the scanner.
    // Pass true as the second argument if this is the end of the data.
    function append(s, eof) {
        if (eof) {
            if (s == null) s = "";
            // Add a special marker character to the end of the buffer.
            // If the scanner is at the end of the buffer and input_complete
            // is set, then this character will transform into an EOF token.
            // Having an actual character that represents EOF in the 
            // character buffer makes lookahead regexp matching work 
            // more easily, and this is important for character references.
            s += "\uFFFF";
            input_complete = true;  // Makes processChars() send EOF
        }

        if (chars === null) { // If this is the first text appended
            chars = s;
            numchars = chars.length;
            // Skip BOF on first appended string
            if (chars.charCodeAt(0) === BOF) nextchar = 1;
            else nextchar = 0;
        }
        else {
            chars = chars.substring(nextchar) + s;
            numchars = chars.length;
            nextchar = 0;
        }

    }

    // Insert characters into the input stream.
    // document.write() does this.
    function insert(s) {
        chars = s + chars.substring(nextchar);
        numchars = chars.length;
        nextchar = 0;
    }


    // Loop through the characters in chars, and pass them one at a time
    // to the tokenizer FSM. Return when no more characters can be processed
    // (This may leave 1 or more characters in the buffer: like a CR
    // waiting to see if the next char is LF, or for states that require
    // lookahead...)
    function processChars() {
        while(nextchar < numchars) {
            switch(typeof tokenizerState.lookahead) {
            case 'undefined':
                var codepoint = chars.charCodeAt(nextchar++);
                switch(codepoint) {
                case CR:
                    // Need to peek and see if next char is LF.
                    // If we don't know the next char, we're done for now
                    if (nextchar === numchars) {
                        nextchar--;
                        return;
                    }
                    var next = chars.charCodeAt(nextchar);
                    // If CR/LF pair, just skip the CR
                    if (next === LF) nextchar++
                    // In either case, tokenize just one LF
                    tokenizerState(LF);
                    break;
                case 0xFFFF:
                    if (input_complete && nextchar === numchars-1) {
                        tokenizerState(EOF);  // codepoint will be 0xFFFF here
                        break;
                    }
                    /* Fallthrough */
                default:
                    tokenizerState(codepoint);
                    break;
                }
                break;

            case 'number':
                // tokenizer wants n chars of lookahead
                var n = tokenizerState.lookahead;
                var s;
                
                if (n < numchars - nextchar) {  // If we can look ahead that far
                    s = chars.substring(nextchar, nextchar+n);
                }
                else { // if we don't have that many characters
                    if (input_complete) { // If no more are coming
                        // Just return what we have
                        // XXX
                        // This includes the synthetic \uFFFF char, right?
                        s = chars.substring(nextchar, numchars);
                    }
                    else {
                        // Return now and wait for more chars later
                        return;
                    }
                }
                var codepoint = chars.charCodeAt(nextchar);
                tokenizerState(codepoint, s, input_complete);
                break;
            case 'string':
                // tokenizer wants characters up to a matching string
                var pattern = tokenizerState.lookahead;
                var pos = chars.indexOf(pattern, nextchar);
                var codepoint = chars.charCodeAt(nextchar);
                var s;
                if (pos !== -1) {
                    s = chars.substring(nextchar, pos + pattern.length);
                }
                else {  // No match
                    // If more characters coming, wait for them
                    if (!input_complete) return;

                    // Otherwise, we've got to return what we've got
                    s = chars.substring(nextchar, numchars);
                }

                tokenizerState(codepoint, s, input_complete);
                break;
            case 'object':
                // tokenizer wants characters that match a regexp
                var pattern = tokenizerState.lookahead;
                var codepoint = chars.charCodeAt(nextchar);
                var s;
                pattern.lastIndex = nextchar;
                if (pattern.test(chars)) {
                    // Found a match.
                    // lastIndex now points to the first char after it
                    s = chars.substring(nextchar, pattern.lastIndex);
                }
                else {
                    // No match.  If we're not at the end of input, then
                    // wait for more chars
                    if (!input_complete) return;

                    // Otherwise, pass an empty string.
                    // This is different than the string-based lookahead
                    // above. Regexp-based lookahead is only used for
                    // character references, and a partial one will not parse.
                    // Also, a char ref terminated with EOF will parse
                    // in the if branch above, so here we're dealing with
                    // things that really aren't char refs
                    s = "";
                }
                
                tokenizerState(codepoint, s, input_complete);
                break;
            }
        }
    }

    // Return a parser object
    return {
        append: function(s) {
            append(s);
            processChars();
        },

        end: function(s) {
            s = s || "";
            append(s, true);
            processChars();
            return doc;
        }
    };

}