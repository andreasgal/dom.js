defineLazyProperty(impl, "HTMLScriptElement", function() {
    function HTMLScriptElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);

        // Internal script flags, used by the parser and elsewhere
        this._already_started = false;
        this._parser_inserted = false;
        this._ready_to_execute = false;
        this._force_async = true;
        this._had_async_content_attribute = false;
    }

    // Script elements must call prepare() when:
    // 1) a script is inserted into the document.  (see _roothook below)
    // 2) the script's children change 
    //   XXX: need to make this one happen
    //   I could use a proxy array for childNodes and handle that here
    //   That might be more efficient than adding hooks in Node.
    //   Also, I sent email to whatwg mailing list about this.
    // 
    // 3) when the a src attribute is defined
    //   (See _newattrhook below);
    // 


    HTMLScriptElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLScriptElement"),

        // Script elements need to know when they're inserted into the
        // document, so they define this hook method
        _roothook: constant(function() {
            this.prepare();
        }),

        // The Script element needs to know when its src and async attrs are set
        _newattrhook: constant(function(name, value) {
            switch(name) {
            case 'async':
                this._force_async = false;
                break;
            case 'src':
                if (this.rooted) this.prepare();
                break;
            }
        }),

        // The async idl attr doesn't quite reflect the async content attr
        async: attribute(
            function() {
                if (this._force_async) return true;
                return this.getAttribute("async");
            },
            function(value) {
                this._force_async = false;
                if (value) {
                    this._setattr("async", "");
                }
                else {
                    this.removeAttribute("async");
                }
            }
        ),

        text: attribute(
            function() {
                var s = "";
                for(var i = 0, n = this.childNodes.length; i < n; i++) {
                    var child = this.childNodes[i];
                    if (child.nodeType === TEXT_NODE)
                        s += child._data;
                }
                return s;
            },
            function(value) {
                this.removeChildren();
                if (value !== null && value !== "") {
                    this.appendChild(this.ownerDocument.createTextNode(value));
                }
            }
        ),

        // The HTML "Prepare a Script" algorithm
        prepare: constant(function() {
        }),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLScriptElement, "src");
    impl.Element.reflectStringAttribute(HTMLScriptElement, "type");
    impl.Element.reflectStringAttribute(HTMLScriptElement, "charset");
    impl.Element.reflectBooleanAttribute(HTMLScriptElement, "defer");


    return HTMLScriptElement;
});
