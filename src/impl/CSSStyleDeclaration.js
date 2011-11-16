defineLazyProperty(impl, "CSSStyleDeclaration", function() {
    function CSSStyleDeclaration(elt) {
        this._element = elt;
    }

    CSSStyleDeclaration.prototype = O.create(Object.prototype, {
        _idlName: constant("CSSStyleDeclaration"),

        // Return the parsed form of the element's style attribute.
        // If the element's style attribute has never been parsed
        // or if it has changed since the last parse, then reparse it
        // Note that the styles don't get parsed until they're actually needed
        _parsed: attribute(function() {
            if (!this._parsedStyles || this.cssText !== this._parsedStyles.text)
            {
                var parser = new parserlib.css.Parser();
                var result = {
                    byname: {},
                    bynumber: [],
                    important: {},
                    text: this.cssText
                };
                parser.addListener("property", function(e) {
                    if (e.invalid) return;  // Skip errors
                    var name = e.property.text;
                    var value = e.value.text; // XXX: will need to break this down
                    result.byname[name] = value;
                    push(result.bynumber, name);
                    if (e.important) result.important[name] = e.important;
                });
                parser.parseStyleAttribute(result.text);
                this._parsedStyles = result;
            }
            return this._parsedStyles;
        }),

        cssText: attribute(
            function() {
                // XXX: this is a CSSStyleDeclaration for an element.
                // A different impl might be necessary for a set of styles
                // associated returned by getComputedStyle(), e.g.
                return this._element.getAttribute("style");
            },
            function(value) {
                // XXX: I should parse and serialize the value to 
                // normalize it and remove errors. FF and chrome do that.
                this._element.setAttribute("style", value);
            }
        ),

        length: attribute(function() {
            return this._parsed.bynumber.length;
        }),

        item: constant(function(n) {
            return this._parsed.bynumber[n];
        }),

        getPropertyValue: constant(function(property) {
            return this._parsed.byname[toLowerCase(property)];
        }),

        getPropertyPriority: constant(function(property) {
            return this._parsed.important[toLowerCase(property)]
                ? "important"
                :"";
        }),

        setProperty: constant(function(property, value, priority) {
        }),

        removeProperty: constant(function(property) {
        }),
    });

    var cssProperties = {
        background: "background",
        backgroundAttachment: "background-attachment",
        backgroundColor: "background-color",
        backgroundImage: "background-image",
        backgroundPosition: "background-position",
        backgroundRepeat: "background-repeat",
        border: "border",
        borderCollapse: "border-collapse",
        borderColor: "border-color",
        borderSpacing: "border-spacing",
        borderStyle: "border-style",
        borderTop: "border-top",
        borderRight: "border-right",
        borderBottom: "border-bottom",
        borderLeft: "border-left",
        borderTopColor: "border-top-color",
        borderRightColor: "border-right-color",
        borderBottomColor: "border-bottom-color",
        borderLeftColor: "border-left-color",
        borderTopStyle:	"border-top-style",
        borderRightStyle: "border-right-style",
        borderBottomStyle: "border-bottom-style",
        borderLeftStyle: "border-left-style",
        borderTopWidth: "border-top-width",
        borderRightWidth: "border-right-width",
        borderBottomWidth: "border-bottom-width",
        borderLeftWidth: "border-left-width",
        borderWidth: "border-width",
        bottom: "bottom",
        captionSide: "caption-side",
        clear: "clear",
        clip: "clip",
        color: "color",
        content: "content",
        counterIncrement: "counter-increment",
        counterReset: "counter-reset",
        cursor: "cursor",
        direction: "direction",
        display: "display",
        emptyCells: "empty-cells",
        cssFloat: "float",
        font: "font",
        fontFamily: "font-family",
        fontSize: "font-size",
        fontSizeAdjust: "font-size-adjust",
        fontStretch: "font-stretch",
        fontStyle: "font-style",
        fontVariant: "font-variant",
        fontWeight: "font-weight",
        height: "height",
        left: "left",
        letterSpacing: "letter-spacing",
        lineHeight: "line-height",
        listStyle: "list-style",
        listStyleImage: "list-style-image",
        listStylePosition: "list-style-position",
        listStyleType: "list-style-type",
        margin: "margin",
        marginTop: "margin-top",
        marginRight: "margin-right",
        marginBottom: "margin-bottom",
        marginLeft: "margin-left",
        markerOffset: "marker-offset",
        marks: "marks",
        maxHeight: "max-height",
        maxWidth: "max-width",
        minHeight: "min-height",
        minWidth: "min-width",
        orphans: "orphans",
        outline: "outline",
        outlineColor: "outline-color",
        outlineStyle: "outline-style",
        outlineWidth: "outline-width",
        overflow: "overflow",
        padding: "padding",
        paddingTop: "padding-top",
        paddingRight: "padding-right",
        paddingBottom: "padding-bottom",
        paddingLeft: "padding-left",
        page: "page",
        pageBreakAfter: "page-break-after",
        pageBreakBefore: "page-break-before",
        pageBreakInside: "page-break-inside",
        position: "position",
        quotes: "quotes",
        right: "right",
        size: "size",
        tableLayout: "table-layout",
        textAlign: "text-align",
        textDecoration: "text-decoration",
        textIndent: "text-indent",
        textShadow: "text-shadow",
        textTransform: "text-transform",
        top: "top",
        unicodeBidi: "unicode-bidi",
        verticalAlign: "vertical-align",
        visibility: "visibility",
        whiteSpace: "white-space",
        widows: "widows",
        width: "width",
        wordSpacing: "word-spacing",
        zIndex: "z-index",
    };

    for(var prop in cssProperties) defineStyleProperty(prop);

    function defineStyleProperty(name) {
        var propname = cssProperties[name];
        Object.defineProperty(CSSStyleDeclaration.prototype, name, {
            get: function() { return this.getPropertyValue(propname); },
            set: nyi,
        });
    }

    return CSSStyleDeclaration;
});