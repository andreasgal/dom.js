
/**
 * This file was partially mechanically generated from 
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
 * using the script in convert.js
 *
 * After mechanical conversion, it was further converted from prose to JS
 * by hand, but the intent is that it is a very faithful rendering of the
 * HTML tokenization spec in JavaScript.
 * 
 * All the FSM actions in this file are expressed as function calls.
 * For speed, it may be useful to expand these function calls with the 
 * C pre-processor.
 * 
 * It is not a goal of this tokenizer to detect or report parse errors.
 *
 * XXX The tokenizer is supposed to work with straight UTF32
 * codepoints. But I don't think it has any dependencies on any
 * character outside of the BMP so I think it is safe to pass it UTF16
 * characters. I don't think it will ever change state in the middle
 * of a surrogate pair.
 */

/*
 * Each state is represented by a function.  For most states, the scanner
 * simply passes the next character (as an integer codepoint) to the
 * current state function and automatically consumes the character.
 * If the state function can't process the character it can call pushback()
 * to push it back to the scanner.
 * 
 * Some states require lookahead, though.  If a state function has a
 * lookahead property, then it is invoked differently.  In this case,
 * the scanner invokes the function with 3 arguments: 1) the next
 * codepoint 2) a string of lookahead text 3) a boolean that is true if
 * the lookahead goes all the way to the EOF. (XXX actually maybe this third
 * is not necessary... the lookahead could just include \uFFFF?)
 *
 * If the lookahead property of a state function is an integer, it specifies
 * the number of characters required. If it is a string, then the scanner
 * will scan for that string and return all characters up to and including that
 * sequence, or up to EOF.  If the lookahead property is a regexp, then the
 * scanner will match the regexp at the current point and return the
 * matching string.
 * 
 * States that require lookahead are responsible for explicitly consuming
 * the characters they process. They do this by calling consume(n), passing
 * the number of processed characters.
 *
 */


// XXX: need to make sure this matches at EOF.
// I need to append \uFFFF to the string for EOF or something
// (and make sure that char doesn't appear anywhere else).
// (right now I'm using -1, but that doesn't translate to UTF-16)

// This regular expression matches the portion of a character reference
// (decimal, hex, or named) that comes after the ampersand. Note that it
// uses the non-standard "y" modifier to anchor the match start position
// to lastIndex.  
const CHARREF = /#[0-9]+[^0-9]|#[xX][0-9a-fA-F]+[^0-9a-fA-F]|[a-zA-Z][a-zA-Z0-9]*[^a-zA-Z0-9]/y;


function data_state(c) {
    switch(c) {
    case 0x0026: //  AMPERSAND (&) 
        switchTo(character_reference_in_data_state);
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(tag_open_state);
        break; 
    case 0x0000: //  NULL 
        emitChar(c);
        break; 
    case EOF: 
        emitEOF();
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function character_reference_in_data_state(c, lookahead, eof) {
    var char = parseCharRef(lookahead, eof);
    if (char != null) {
        if (typeof char === "number") emitChar(char);
        else emitChars(char);  // An array of characters
    }
    else
        emitChar(0x0026); // AMPERSAND;

    switchTo(data_state);
}
character_reference_in_data_state.lookahead = CHARREF;

function rcdata_state(c) {
    switch(c) {
    case 0x0026: //  AMPERSAND (&) 
        switchTo(character_reference_in_rcdata_state);
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(rcdata_less_than_sign_state);
        break; 
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        emitEOF();
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function character_reference_in_rcdata_state(c, lookahead, eof) {
    var char = parseCharRef(lookahead, eof);
    if (char != null) {
        if (typeof char === "number") emitChar(char);
        else emitChars(char);  // An array of characters
    }
    else
        emitChar(0x0026); // AMPERSAND;

    switchTo(rcdata_state);
}
character_reference_in_rcdata_state.lookahead = CHARREF;

function rawtext_state(c) {
    switch(c) {
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(rawtext_less_than_sign_state);
        break; 
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        emitEOF();
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function script_data_state(c) {
    switch(c) {
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_less_than_sign_state);
        break; 
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        emitEOF();
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function plaintext_state(c) {
    switch(c) {
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        emitEOF();
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function tag_open_state(c) {
    switch(c) {
    case 0x0021: //  EXCLAMATION MARK (!) 
        switchTo(markup_declaration_open_state);
        break; 
    case 0x002F: //  SOLIDUS (/) 
        switchTo(end_tag_open_state);
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        c += 0x20;  // to lowercase
        // fallthrough

    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        
        beginTagName();
        appendChar(tagnamebuf, c);
        opentag = true;
        switchTo(tag_name_state); 
        break; 
    case 0x003F: //  QUESTION MARK (?) 
        switchTo(bogus_comment_state);
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        pushback();
        switchTo(data_state);
        break; 
    }
}

function end_tag_open_state(c) {
    switch(c) {
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        c += 0x20; // to lowercase
        // fallthrough

    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTagName();
        appendChar(tagnamebuf, c);
        opentag = false;
        switchTo(tag_name_state); 
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state);
        break; 
    case EOF: 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x002F); // SOLIDUS
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(bogus_comment_state);
        break; 
    }
}

function tag_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF)
    case 0x0020: //  SPACE 
        switchTo(before_attribute_name_state);
        break; 
    case 0x002F: //  SOLIDUS (/) 
        switchTo(self_closing_start_tag_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitTag();
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
 
        appendChar(tagnamebuf, c + 0x0020);
        break; 
    case 0x0000: //  NULL 
        appendChar(tagnamebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(tagnamebuf, c);
        break; 
    }
}

function rcdata_less_than_sign_state(c) {
/* identical to the RAWTEXT less-than sign state, except s/RAWTEXT/RCDATA/g */
    switch(c) {
    case 0x002F: //  SOLIDUS (/)
        beginTempBuf();
        switchTo(rcdata_end_tag_open_state);
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        pushback();
        switchTo(rcdata_state);
        break; 
    }
}

function rcdata_end_tag_open_state(c) {
 /* identical to the RAWTEXT (and Script data) end tag open state, except s/RAWTEXT/RCDATA/g */    
    switch(c) {
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginTagName();
        appendChar(tagnamebuf, c + 0x0020);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(rcdata_end_tag_name_state); 
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTagName();
        appendChar(tagnamebuf, c);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(rcdata_end_tag_name_state); 
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x002F); // SOLIDUS 
        pushback();
        switchTo(rcdata_state);
        break; 
    }
}

function rcdata_end_tag_name_state(c) {
 /* identical to the RAWTEXT (and Script data) end tag name state, except s/RAWTEXT/RCDATA/g */
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE
        if (appropriate(tagnamebuf)) {
            switchTo(before_attribute_name_state);
            return;
        }
        break;
    case 0x002F: //  SOLIDUS (/)
        if (appropriate(tagnamebuf)) {
            switchTo(self_closing_start_tag_state);
            return;
        }
        break;
    case 0x003E: //  GREATER-THAN SIGN (>)
        if (appropriate(tagnamebuf)) {
            emitTag();
            switchTo(data_state);
            return;
        }
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
 
        appendChar(tagnamebuf, c + 0x0020); 
        appendChar(tempbuf, c);
        return;
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
 
        appendChar(tagnamebuf, c); 
        appendChar(tempbuf, c);
        return;
    default: 
        break;
    }

    // If we don't return in one of the cases above, then this was not 
    // an appropriately matching close tag, so back out by emitting all
    // the characters as text
    emitChar(0x003C); // LESS-THAN SIGN
    emitChar(0x002F); // SOLIDUS
    emitChars(tempbuf);
    pushback();
    switchTo(rcdata_state);
}

function rawtext_less_than_sign_state(c) {
 /* identical to the RCDATA less-than sign state, except s/RCDATA/RAWTEXT/g */    switch(c) {
    case 0x002F: //  SOLIDUS (/)
        beginTempBuf();
        switchTo(rawtext_end_tag_open_state);
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        pushback();
        switchTo(rawtext_state);
        break; 
    }
}

function rawtext_end_tag_open_state(c) {
 /* identical to the RCDATA (and Script data) end tag open state, except s/RCDATA/RAWTEXT/g */
    switch(c) {
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginTagName();
        appendChar(tagnamebuf, c + 0x0020);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(rawtext_end_tag_name_state); 
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTagName();
        appendChar(tagnamebuf, c);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(rawtext_end_tag_name_state); 
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x002F); // SOLIDUS 
        pushback();
        switchTo(rawtext_state);
        break; 
    }
}

function rawtext_end_tag_name_state(c) {
 /* identical to the RCDATA (and Script data) end tag name state, except s/RCDATA/RAWTEXT/g */    
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF)
    case 0x0020: //  SPACE
        if (appropriate(tagnamebuf)) {
            switchTo(before_attribute_name_state);
            return;
        }
        break;
    case 0x002F: //  SOLIDUS (/)
        if (appropriate(tagnamebuf)) {
            switchTo(self_closing_start_tag_state);
            return;
        }
        break;
    case 0x003E: //  GREATER-THAN SIGN (>)
        if (appropriate(tagnamebuf)) {
            emitTag();
            switchTo(data_state);
            return;
        }
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(tagnamebuf, c + 0x0020); 
        appendChar(tempbuf, c);
        return;
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        appendChar(tagnamebuf, c); 
        appendChar(tempbuf, c);
        return;
    default: 
        break;
    }

    // If we don't return in one of the cases above, then this was not 
    // an appropriately matching close tag, so back out by emitting all
    // the characters as text
    emitChar(0x003C); // LESS-THAN SIGN
    emitChar(0x002F); // SOLIDUS
    emitChars(tempbuf);
    pushback();
    switchTo(rawtext_state);
}

function script_data_less_than_sign_state(c) {
    switch(c) {
    case 0x002F: //  SOLIDUS (/) 
        beginTempBuf();
        switchTo(script_data_end_tag_open_state);
        break; 
    case 0x0021: //  EXCLAMATION MARK (!) 
        switchTo(script_data_escape_start_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x0021); // EXCLAMATION MARK
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        pushback();
        switchTo(script_data_state);
        break; 
    }
}

function script_data_end_tag_open_state(c) {
 /* identical to the RCDATA (and RAWTEXT) end tag open state, except s/RCDATA/Script data/g */    
    switch(c) {
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginTagName();
        appendChar(tagnamebuf, c + 0x0020);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(script_data_end_tag_name_state); 
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTagName();
        appendChar(tagnamebuf, c);
        opentag = false;
        appendChar(tempbuf, c); 
        switchTo(script_data_end_tag_name_state); 
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x002F); // SOLIDUS 
        pushback();
        switchTo(script_data_state);
        break; 
    }
}

function script_data_end_tag_name_state(c) {
 /* identical to the RCDATA (and RAWTEXT) end tag name state, except s/RCDATA/Script data/g */    
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE
        if (appropriate(tagnamebuf)) {
            switchTo(before_attribute_name_state);
            return;
        }
        break;
    case 0x002F: //  SOLIDUS (/)
        if (appropriate(tagnamebuf)) {
            switchTo(self_closing_start_tag_state);
            return;
        }
        break;
    case 0x003E: //  GREATER-THAN SIGN (>)
        if (appropriate(tagnamebuf)) {
            emitTag();
            switchTo(data_state);
            return;
        }
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
 
        appendChar(tagnamebuf, c + 0x0020); 
        appendChar(tempbuf, c);
        return;
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
 
        appendChar(tagnamebuf, c); 
        appendChar(tempbuf, c);
        return;
    default: 
        break;
    }

    // If we don't return in one of the cases above, then this was not 
    // an appropriately matching close tag, so back out by emitting all
    // the characters as text
    emitChar(0x003C); // LESS-THAN SIGN
    emitChar(0x002F); // SOLIDUS
    emitChars(tempbuf);
    pushback();
    switchTo(script_data_state);
}

function script_data_escape_start_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_escape_start_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    default: 
        pushback();
        switchTo(script_data_state);
        break; 
    }
}

function script_data_escape_start_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_escaped_dash_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    default: 
        pushback();
        switchTo(script_data_state);
        break; 
    }
}

function script_data_escaped_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_escaped_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_escaped_less_than_sign_state);
        break; 
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function script_data_escaped_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_escaped_dash_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_escaped_less_than_sign_state);
        break; 
    case 0x0000: //  NULL 
        switchTo(script_data_escaped_state); 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(script_data_escaped_state); 
        emitChar(c);
        break; 
    }
}

function script_data_escaped_dash_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_escaped_less_than_sign_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(script_data_state); 
        emitChar(0x003E); // GREATER-THAN SIGN
        break; 
    case 0x0000: //  NULL 
        switchTo(script_data_escaped_state); 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(script_data_escaped_state); 
        emitChar(c);
        break; 
    }
}

function script_data_escaped_less_than_sign_state(c) {
    switch(c) {
    case 0x002F: //  SOLIDUS (/) 
        beginTempBuf();
        switchTo(script_data_escaped_end_tag_open_state);
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginTempBuf();
        appendChar(tempbuf, c + 0x0020); 
        switchTo(script_data_double_escape_start_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(c);
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTempBuf();
        appendChar(tempbuf, c); 
        switchTo(script_data_double_escape_start_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(c);
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        pushback();
        switchTo(script_data_escaped_state);
        break; 
    }
}

function script_data_escaped_end_tag_open_state(c) {
    switch(c) {
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginTagName();
        appendChar(tagnamebuf, c + 0x0020);
        appendChar(tempbuf, c); 
        switchTo(script_data_escaped_end_tag_name_state); 
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        beginTagName();
        appendChar(tagnamebuf, c);
        appendChar(tempbuf, c); 
        switchTo(script_data_escaped_end_tag_name_state); 
        break; 
    default: 
        emitChar(0x003C); // LESS-THAN SIGN
        emitChar(0x002F); // SOLIDUS 
        pushback();
        switchTo(script_data_escaped_state);
        break; 
    }
}

function script_data_escaped_end_tag_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF)
    case 0x0020: //  SPACE 
        if (appropriate(tagnamebuf)) {
            switchTo(before_attribute_name_state); 
            return;
        }
        break; 
    case 0x002F: //  SOLIDUS (/) 
        if (appropriate(tagnamebuf)) {
            switchTo(self_closing_start_tag_state); 
            return;
        }
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        if (appropriate(tagnamebuf)) {
            emitTag();
            switchTo(data_state); 
            return;
        }
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(tagnamebuf, c + 0x0020); 
        appendChar(tempbuf, c);
        return;
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        appendChar(tagnamebuf, c); 
        appendChar(tempbuf, c);
        return;
    default: 
        break;
    }

    // We get here in the default case, and if the closing tagname
    // is not an appropriate tagname.
    emitChar(0x003C); // LESS-THAN SIGN
    emitChar(0x002F); // SOLIDUS 
    emitChars(tempbuf);
    pushback();
    switchTo(script_data_escaped_state);
    break; 
}

function script_data_double_escape_start_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
    case 0x002F: //  SOLIDUS (/) 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        if (contains(tempbuf, "script")) {
            switchTo(script_data_double_escaped_state);
        }
        else {
            switchTo(script_data_escaped_state); 
        }
        emitChar(c);
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(tempbuf, c + 0x0020); 
        emitChar(c);
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        appendChar(tempbuf, c); 
        emitChar(c);
        break; 
    default: 
        pushback();
        switchTo(script_data_escaped_state);
        break; 
    }
}

function script_data_double_escaped_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_double_escaped_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_double_escaped_less_than_sign_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        break; 
    case 0x0000: //  NULL 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        emitChar(c);
        break; 
    }
}

function script_data_double_escaped_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(script_data_double_escaped_dash_dash_state); 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_double_escaped_less_than_sign_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        break; 
    case 0x0000: //  NULL 
        switchTo(script_data_double_escaped_state); 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(script_data_double_escaped_state); 
        emitChar(c);
        break; 
    }
}

function script_data_double_escaped_dash_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        emitChar(0x002D); // HYPHEN-MINUS
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
        switchTo(script_data_double_escaped_less_than_sign_state); 
        emitChar(0x003C); // LESS-THAN SIGN
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(script_data_state); 
        emitChar(0x003E); // GREATER-THAN SIGN
        break; 
    case 0x0000: //  NULL 
        switchTo(script_data_double_escaped_state); 
        emitChar(0xFFFD); // REPLACEMENT CHARACTER
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(script_data_double_escaped_state); 
        emitChar(c);
        break; 
    }
}

function script_data_double_escaped_less_than_sign_state(c) {
    switch(c) {
    case 0x002F: //  SOLIDUS (/) 
        beginTempBuf();
        switchTo(script_data_double_escape_end_state); 
        emitChar(0x002F); // SOLIDUS
        break; 
    default: 
        pushback();
        switchTo(script_data_double_escaped_state);
        break; 
    }
}

function script_data_double_escape_end_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
    case 0x002F: //  SOLIDUS (/) 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        if (contains(tempbuf, "script")) {
            switchTo(script_data_escaped_state);
        }
        else {
            switchTo(script_data_double_escaped_state); 
        }
        emitChar(c);
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(tempbuf, c + 0x0020); 
        emitChar(c);
        break; 
    case 0x0061:  // [a-z]
    case 0x0062:case 0x0063:case 0x0064:case 0x0065:case 0x0066:
    case 0x0067:case 0x0068:case 0x0069:case 0x006A:case 0x006B:
    case 0x006C:case 0x006D:case 0x006E:case 0x006F:case 0x0070:
    case 0x0071:case 0x0072:case 0x0073:case 0x0074:case 0x0075:
    case 0x0076:case 0x0077:case 0x0078:case 0x0079:case 0x007A:
        appendChar(tempbuf, c); 
        emitChar(c);
        break; 
    default: 
        pushback();
        switchTo(script_data_double_escaped_state);
        break; 
    }
}

function before_attribute_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x002F: //  SOLIDUS (/) 
        switchTo(self_closing_start_tag_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitTag();
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginAttrName();
        appendChar(attrnamebuf, c + 0x0020);
        switchTo(attribute_name_state);
        break; 
    case 0x0000: //  NULL 
        beginAttrName();
        appendChar(attrnamebuf, 0xFFFD);
        switchTo(attribute_name_state);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
    case 0x0027: //  APOSTROPHE (') 
    case 0x003C: //  LESS-THAN SIGN (<) 
    case 0x003D: //  EQUALS SIGN (=) 
        // fallthrough
    default: 
        beginAttrName();
        appendChar(attrnamebuf, c);
        switchTo(attribute_name_state);
        break; 
    }
}

function attribute_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(after_attribute_name_state);
        break; 
    case 0x002F: //  SOLIDUS (/) 
        addAttribute(attrnamebuf);
        switchTo(self_closing_start_tag_state);
        break; 
    case 0x003D: //  EQUALS SIGN (=) 
        beginAttributeValue();
        switchTo(before_attribute_value_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        addAttribute(attrnamebuf);
        switchTo(data_state); 
        emitTag();
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(attrnamebuf, c + 0x0020);
        break; 
    case 0x0000: //  NULL 
        appendChar(attrnamebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
    case 0x0027: //  APOSTROPHE (') 
    case 0x003C: //  LESS-THAN SIGN (<) 
        // fallthrough
    default: 
        appendChar(attrnamebuf, c);
        break; 
    }

}

function after_attribute_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x002F: //  SOLIDUS (/) 
        addAttribute(attrnamebuf);
        switchTo(self_closing_start_tag_state);
        break; 
    case 0x003D: //  EQUALS SIGN (=) 
        beginAttributeValue();
        switchTo(before_attribute_value_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        addAttribute(attrnamebuf);
        emitTag();
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        addAttribute(attrnamebuf);
        beginAttrName();
        appendChar(attrnamebuf, c + 0x0020);
        switchTo(attribute_name_state);
        break; 
    case 0x0000: //  NULL 
        addAttribute(attrnamebuf);
        beginAttrName();
        appendChar(attrnamebuf, 0xFFFD);
        switchTo(attribute_name_state);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
    case 0x0027: //  APOSTROPHE (') 
    case 0x003C: //  LESS-THAN SIGN (<) 
        // fallthrough
    default: 
        addAttribute(attrnamebuf);
        beginAttrName();
        appendChar(attrnamebuf, c);
        switchTo(attribute_name_state);
        break; 
    }
}

function before_attribute_value_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        switchTo(attribute_value_double_quoted_state);
        break; 
    case 0x0026: //  AMPERSAND (&)
        pushback();
        switchTo(attribute_value_unquoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        switchTo(attribute_value_single_quoted_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(attrvaluebuf, 0xFFFD /* REPLACEMENT CHARACTER */); 
        switchTo(attribute_value_unquoted_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        addAttribute(attrnamebuf);
        emitTag();
        switchTo(data_state); 
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    case 0x003C: //  LESS-THAN SIGN (<) 
    case 0x003D: //  EQUALS SIGN (=) 
    case 0x0060: //  GRAVE ACCENT (`) 
        // fallthrough
    default: 
        appendChar(attrvaluebuf, c); 
        switchTo(attribute_value_unquoted_state);
        break; 
    }
}

function attribute_value_double_quoted_state(c) {
    switch(c) {
    case 0x0022: //  QUOTATION MARK (") 
        addAttribute(attrnamebuf, attrvaluebuf);
        switchTo(after_attribute_value_quoted_state);
        break; 
    case 0x0026: //  AMPERSAND (&) 
        pushState();
        switchTo(character_reference_in_attribute_value_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(attrvaluebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(attrvaluebuf, c);
        break; 
    }
}

function attribute_value_single_quoted_state(c) {
    switch(c) {
    case 0x0027: //  APOSTROPHE (') 
        addAttribute(attrnamebuf, attrvaluebuf);
        switchTo(after_attribute_value_quoted_state);
        break; 
    case 0x0026: //  AMPERSAND (&) 
        pushState();
        switchTo(character_reference_in_attribute_value_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(attrvaluebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(attrvaluebuf, c);
        break; 
    }
}

function attribute_value_unquoted_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        addAttribute(attrnamebuf, attrvaluebuf);
        switchTo(before_attribute_name_state);
        break; 
    case 0x0026: //  AMPERSAND (&) 
        pushState();
        switchTo(character_reference_in_attribute_value_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        addAttribute(attrnamebuf, attrvaluebuf);
        switchTo(data_state); 
        emitTag();
        break; 
    case 0x0000: //  NULL 
        appendChar(attrvaluebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
    case 0x0027: //  APOSTROPHE (') 
    case 0x003C: //  LESS-THAN SIGN (<) 
    case 0x003D: //  EQUALS SIGN (=) 
    case 0x0060: //  GRAVE ACCENT (`) 
        // fallthrough
    default: 
        appendChar(attrvaluebuf, c);
        break; 
    }
}

function character_reference_in_attribute_value_state(c) {
    var char = parseCharRef(lookahead, eof);
    if (char != null) {
        if (typeof char === "number")
            appendChar(attrvaluebuf, char);
        else {
            // An array of numbers
            for(var i = 0; i < char.length; i++) {
                appendChar(attrvaluebuf, char[i]);
            }
        }
    }
    else {
        appendChar(attrvaluebuf, 0x0026); // AMPERSAND;
    }

    popState();
}
character_reference_in_attribute_value_state.lookahead = CHARREF;

function after_attribute_value_quoted_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(before_attribute_name_state);
        break; 
    case 0x002F: //  SOLIDUS (/) 
        switchTo(self_closing_start_tag_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitTag();
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        pushback();
        switchTo(before_attribute_name_state);
        break; 
    }
}

function self_closing_start_tag_state(c) {
    switch(c) {
    case 0x003E: //  GREATER-THAN SIGN (>) 
        // Set the <i>self-closing flag</i> of the current tag token. 
        switchTo(data_state); 
        emibtSelfClosingTag(true); 
        break; 
    case EOF: 
        pushback();
        switchTo(data_state);
        break; 
    default: 
        pushback();
        switchTo(before_attribute_name_state);
        break; 
    }
}

function bogus_comment_state(c, lookahead, eof) {
    var len = lookahead.length;

    if (eof) {
        consume(len-1);  // don't consume the eof
    }
    else {
        consume(len);
    }

    emitCommentString(lookahead
                      .substring(len-1)
                      .replace(/\u0000/g,"\uFFFD"));

    switchTo(data_state);
}
bogus_comment_state.lookahead = ">";

function markup_declaration_open_state(c, lookahead, eof) {
    if (lookahead[0] === "-" && lookahead[1] === "-") {
        consume(2);
        beginComment();
        switchTo(comment_start_state);
        return;
    }
    
    if (lookahead.toUpperCase() === "DOCTYPE") {
        consume(7);
        switchTo(doctype_state);
    }
    else if (lookahead === "[CDATA[" && cdataAllowed()) {
        consume(7);
        switchTo(cdata_section_state);
    }
    else {
        switchTo(bogus_comment_state);        
    }
}
markup_declaration_open_state.lookahead = 7;

function comment_start_state(c) {
    beginComment();
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(comment_start_dash_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0xFFFD /* REPLACEMENT CHARACTER */); 
        switchTo(comment_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitComment();
        break; /* see comment in comment end state */ 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(commentbuf, c); 
        switchTo(comment_state);
        break; 
    }
}

function comment_start_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) Switch to the #comment-end-state
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0x002D /* HYPHEN-MINUS  (-)*/);
        appendChar(commentbuf, 0xFFFD);
        switchTo(comment_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitComment();
        break; 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; /* see comment in comment end state */ 
    default: 
        appendChar(commentbuf, 0x002D /* HYPHEN-MINUS  (-)*/);
        appendChar(commentbuf, c);
        switchTo(comment_state);
        break; 
    }
}

function comment_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(comment_end_dash_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; /* see comment in comment end state */ 
    default: 
        appendChar(commentbuf, c);
        break; 
    }
}

function comment_end_dash_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        switchTo(comment_end_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0x002D /* HYPHEN-MINUS */);
        appendChar(commentbuf, 0xFFFD);
        switchTo(comment_state);
        break; 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; /* see comment in comment end state */ 
    default: 
        appendChar(commentbuf, 0x002D /* HYPHEN-MINUS */);
        appendChar(commentbuf, c);
        switchTo(comment_state);
        break; 
    }
}

function comment_end_state(c) {
    switch(c) {
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitComment();
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0xFFFD);
        switchTo(comment_state);
        break; 
    case 0x0021: //  EXCLAMATION MARK (!) 
        switchTo(comment_end_bang_state);
        break; 
    case 0x002D: //  HYPHEN-MINUS (-) 
        appendChar(commentbuf, 0x002D);
        break; 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; /* For security reasons: otherwise, hostile user could put a <script> in a comment e.g. in a blog comment and then DOS the server so that the end tag isn't read, and then the commented <script> tag would be treated as live code */ 
    default: 
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, c);
        switchTo(comment_state);
        break; 
    }
}

function comment_end_bang_state(c) {
    switch(c) {
    case 0x002D: //  HYPHEN-MINUS (-) 
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x0021);
        switchTo(comment_end_dash_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state);
        emitComment();
        break; 
    case 0x0000: //  NULL 
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x0021);
        appendChar(commentbuf, 0xFFFD);
        switchTo(comment_state);
        break; 
    case EOF: 
        emitComment();
        pushback();
        switchTo(data_state);
        break; /* see comment in comment end state */ 
    default: 
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x002D);
        appendChar(commentbuf, 0x0021);
        appendChar(commentbuf, c);
        switchTo(comment_state);
        break; 
    }
}

function doctype_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(before_doctype_name_state);
        break; 
    case EOF: 
        beginDoctype();
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        pushback();
        switchTo(before_doctype_name_state);
        break; 
    }
}

function before_doctype_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        beginDoctype();
        appendChar(doctypenamebuf, c + 0x0020);
        switchTo(doctype_name_state);
        break; 
    case 0x0000: //  NULL 
        beginDoctype();
        appendChar(doctypenamebuf, 0xFFFD);
        switchTo(doctype_name_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        beginDoctype();
        switchTo(data_state);
        forcequirks();
        emitDoctype();
        break; 
    case EOF: 
        beginDoctype();
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        beginDoctype();
        appendChar(doctypenamebuf, c);
        switchTo(doctype_name_state);
        break; 
    }
}

function doctype_name_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(after_doctype_name_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitDoctype();
        break; 
    case 0x0041:  // [A-Z]
    case 0x0042:case 0x0043:case 0x0044:case 0x0045:case 0x0046:
    case 0x0047:case 0x0048:case 0x0049:case 0x004A:case 0x004B:
    case 0x004C:case 0x004D:case 0x004E:case 0x004F:case 0x0050:
    case 0x0051:case 0x0052:case 0x0053:case 0x0054:case 0x0055:
    case 0x0056:case 0x0057:case 0x0058:case 0x0059:case 0x005A:
        appendChar(doctypenamebuf, c + 0x0020);
        break; 
    case 0x0000: //  NULL 
        appendChar(doctypenamebuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(doctypenamebuf, c);
        break; 
    }
}

function after_doctype_name_state(c, lookahead, eof) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default:  
        lookahead = lookahead.toUpperCase();
        if (lookahead === "PUBLIC") {
            consume(6);
            switchTo(after_doctype_public_keyword_state);
        }
        else if (lookahead === "SYSTEM") {
            consume(6);
            switchTo(after_doctype_system_keyword_state);
        }
        else {
            forcequirks();
            switchTo(bogus_doctype_state);
        }
        break; 
    }
}
after_doctype_name_state.lookahead = 6;

function after_doctype_public_keyword_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(before_doctype_public_identifier_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypePublicId();
        switchTo(doctype_public_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        beginDoctypePublicId();
        switchTo(doctype_public_identifier_single_quoted_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state); 
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function before_doctype_public_identifier_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypePublicId();
        switchTo(doctype_public_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        beginDoctypePublicId();
        switchTo(doctype_public_identifier_single_quoted_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state); 
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function doctype_public_identifier_double_quoted_state(c) {
    switch(c) {
    case 0x0022: //  QUOTATION MARK (") 
        switchTo(after_doctype_public_identifier_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(doctypepublicbuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state); 
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(doctypepublicbuf, c);
        break; 
    }
}

function doctype_public_identifier_single_quoted_state(c) {
    switch(c) {
    case 0x0027: //  APOSTROPHE (') 
        switchTo(after_doctype_public_identifier_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(doctypepublicbuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(doctypepublicbuf, c);
        break; 
    }
}

function after_doctype_public_identifier_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(between_doctype_public_and_system_identifiers_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitDoctype();
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_single_quoted_state);
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function between_doctype_public_and_system_identifiers_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF)
    case 0x0020: //  SPACE Ignore the character.
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitDoctype();
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_single_quoted_state);
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function after_doctype_system_keyword_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE 
        switchTo(before_doctype_system_identifier_state);
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (') 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_single_quoted_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state); 
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function before_doctype_system_identifier_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF) 
    case 0x0020: //  SPACE Ignore the character.
        break; 
    case 0x0022: //  QUOTATION MARK (") 
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_double_quoted_state);
        break; 
    case 0x0027: //  APOSTROPHE (')
        beginDoctypeSystemId();
        switchTo(doctype_system_identifier_single_quoted_state);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        forcequirks();
        switchTo(bogus_doctype_state);
        break; 
    }
}

function doctype_system_identifier_double_quoted_state(c) {
    switch(c) {
    case 0x0022: //  QUOTATION MARK (") 
        switchTo(after_doctype_system_identifier_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(doctypesystembuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(doctypesystembuf, c);
        break; 
    }
}

function doctype_system_identifier_single_quoted_state(c) {
    switch(c) {
    case 0x0027: //  APOSTROPHE (') 
        switchTo(after_doctype_system_identifier_state);
        break; 
    case 0x0000: //  NULL 
        appendChar(doctypesystembuf, 0xFFFD /* REPLACEMENT CHARACTER */);
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        forcequirks();
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        appendChar(doctypesystembuf, c);
        break; 
    }
}

function after_doctype_system_identifier_state(c) {
    switch(c) {
    case 0x0009: //  CHARACTER TABULATION (tab) 
    case 0x000A: //  LINE FEED (LF) 
    case 0x000C: //  FORM FEED (FF)
    case 0x0020: //  SPACE 
        /* Ignore the character. */
        break; 
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state);
        emitDoctype();
        break; 
    case EOF: 
        forcequirks();
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        switchTo(bogus_doctype_state);
        /* This does *not* set the DOCTYPE token's force-quirks flag. */
        break; 
    }
}

function bogus_doctype_state(c) {
    switch(c) {
    case 0x003E: //  GREATER-THAN SIGN (>) 
        switchTo(data_state); 
        emitDoctype();
        break; 
    case EOF: 
        emitDoctype();
        pushback();
        switchTo(data_state);
        break; 
    default: 
        /* Ignore the character. */
        break; 
    }
}

function cdata_section_state(c, lookahead, eof) {
    var len = lookahead.length;
    if (eof) {
        consume(len-1); // leave the EOF in the scanner
        emitCharString(lookahead.substring(0, len-1)); // don't emit the EOF
    }
    else {
        consume(len);
        emitCharString(lookahead.substring(0,len-3)); // don't emit the ]]>
    }

    switchTo(data_state);
}
cdata_section_state.lookahead = "]]>";
