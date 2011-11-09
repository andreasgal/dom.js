var tagNameToInterfaceName = {
    "a": "HTMLAnchorElement",
    "abbr": "HTMLElement",
    "address": "HTMLElement",
    "area": "HTMLAreaElement",
    "article": "HTMLElement",
    "aside": "HTMLElement",
    "audio": "HTMLAudioElement",
    "b": "HTMLElement",
    "base": "HTMLBaseElement",
    "bdi": "HTMLElement",
    "bdo": "HTMLElement",
    "blockquote": "HTMLQuoteElement",
    "body": "HTMLBodyElement",
    "br": "HTMLBRElement",
    "button": "HTMLButtonElement",
    "canvas": "HTMLCanvasElement",
    "caption": "HTMLTableCaptionElement",
    "cite": "HTMLElement",
    "code": "HTMLElement",
    "col": "HTMLTableColElement",
    "colgroup": "HTMLTableColElement",
    "command": "HTMLCommandElement",
    "datalist": "HTMLDataListElement",
    "dd": "HTMLElement",
    "del": "HTMLModElement",
    "details": "HTMLDetailsElement",
    "dfn": "HTMLElement",
    "div": "HTMLDivElement",
    "dl": "HTMLDListElement",
    "dt": "HTMLElement",
    "em": "HTMLElement",
    "embed": "HTMLEmbedElement",
    "fieldset": "HTMLFieldSetElement",
    "figcaption": "HTMLElement",
    "figure": "HTMLElement",
    "footer": "HTMLElement",
    "form": "HTMLFormElement",
    "frame": "HTMLFrameElement",
    "frameset": "HTMLFrameSetElement",
    "h1": "HTMLHeadingElement",
    "h2": "HTMLHeadingElement",
    "h3": "HTMLHeadingElement",
    "h4": "HTMLHeadingElement",
    "h5": "HTMLHeadingElement",
    "h6": "HTMLHeadingElement",
    "head": "HTMLHeadElement",
    "header": "HTMLElement",
    "hgroup": "HTMLElement",
    "hr": "HTMLHRElement",
    "html": "HTMLHtmlElement",
    "i": "HTMLElement",
    "iframe": "HTMLIFrameElement",
    "img": "HTMLImageElement",
    "input": "HTMLInputElement",
    "ins": "HTMLModElement",
    "kbd": "HTMLElement",
    "keygen": "HTMLKeygenElement",
    "label": "HTMLLabelElement",
    "legend": "HTMLLegendElement",
    "li": "HTMLLIElement",
    "link": "HTMLLinkElement",
    "map": "HTMLMapElement",
    "mark": "HTMLElement",
    "menu": "HTMLMenuElement",
    "meta": "HTMLMetaElement",
    "meter": "HTMLMeterElement",
    "nav": "HTMLElement",
    "noscript": "HTMLElement",
    "object": "HTMLObjectElement",
    "ol": "HTMLOListElement",
    "optgroup": "HTMLOptGroupElement",
    "option": "HTMLOptionElement",
    "output": "HTMLOutputElement",
    "p": "HTMLParagraphElement",
    "param": "HTMLParamElement",
    "pre": "HTMLPreElement",
    "progress": "HTMLProgressElement",
    "q": "HTMLQuoteElement",
    "rp": "HTMLElement",
    "rt": "HTMLElement",
    "ruby": "HTMLElement",
    "s": "HTMLElement",
    "samp": "HTMLElement",
    "script": "HTMLScriptElement",
    "section": "HTMLElement",
    "select": "HTMLSelectElement",
    "small": "HTMLElement",
    "source": "HTMLSourceElement",
    "span": "HTMLSpanElement",
    "strong": "HTMLElement",
    "style": "HTMLStyleElement",
    "sub": "HTMLElement",
    "summary": "HTMLElement",
    "sup": "HTMLElement",
    "table": "HTMLTableElement",
    "tbody": "HTMLTableSectionElement",
    "td": "HTMLTableDataCellElement",
    "textarea": "HTMLTextAreaElement",
    "tfoot": "HTMLTableSectionElement",
    "th": "HTMLTableHeaderCellElement",
    "thead": "HTMLTableSectionElement",
    "time": "HTMLTimeElement",
    "title": "HTMLTitleElement",
    "tr": "HTMLTableRowElement",
    "track": "HTMLTrackElement",
    "u": "HTMLElement",
    "ul": "HTMLUListElement",
    "var": "HTMLElement",
    "video": "HTMLVideoElement",
    "wbr": "HTMLElement",
};

defineLazyProperty(impl, "HTMLElement", function() {
    function HTMLElement(doc, localName, prefix) {
        impl.Element.call(this, doc, localName, HTML_NAMESPACE, prefix);
    }

    HTMLElement.prototype = O.create(impl.Element.prototype, {
        _idlName: constant("HTMLElement"),
        innerHTML: attribute(function() {
            return this.serialize();
        },
        function(v) {
            var parser = this.ownerDocument.implementation.mozHTMLParser(
                this.ownerDocument._address,
                this);
            parser.parse(v, true);
            var tmpdoc = parser.document();
            var root = tmpdoc.firstChild;

            // Remove any existing children of this node
            while(this.hasChildNodes())
                this.removeChild(this.firstChild);

            // Now copy newly parsed children from the root to this node
            while(root.hasChildNodes()) {
                this.appendChild(root.firstChild);
            }
        }),
    });

    impl.Element.reflectStringAttribute(HTMLElement, "title");
    impl.Element.reflectStringAttribute(HTMLElement, "lang");
    impl.Element.reflectEnumeratedAttribute(HTMLElement, "dir", null, {
        ltr: "ltr",
        rtl: "rtl",
        auto:"auto"
    });

    impl.Element.reflectStringAttribute(HTMLElement, "accesskey", "accessKey");
    impl.Element.reflectBooleanAttribute(HTMLElement, "hidden");

    // XXX: the default value for tabIndex should be 0 if the element is
    // focusable and -1 if it is not.  But the full definition of focusable
    // is actually hard to compute, so for now, I'll follow Firefox and
    // just base the default value on the type of the element. 
    var focusableElements = {
        "A":true, "LINK":true, "BUTTON":true, "INPUT":true,
        "SELECT":true, "TEXTAREA":true, "COMMAND":true
    };
    impl.Element.reflectIntegerAttribute(HTMLElement, "tabindex", 
                         // compute a default tabIndex value
                         function() {
                             if (this.tagName in focusableElements ||
                                 this.contentEditable)
                                 return 0;
                             else
                                 return -1;
                         }, 
                                         "tabIndex");
                                         
    // XXX: reflect contextmenu as contextMenu, with element type


    // style: the spec doesn't call this a reflected attribute.
    //   may want to handle it manually.

    // contentEditable: enumerated, not clear if it is actually
    // reflected or requires custom getter/setter. Not listed as
    // "limited to known values".  Raises syntax_err on bad setting,
    // so I think this is custom.

    // contextmenu: content is element id, idl type is an element
    // draggable: boolean, but not a reflected attribute
    // dropzone: reflected SettableTokenList, experimental, so don't
    //   implement it right away.

    // data-* attributes: need special handling in setAttribute?
    // Or maybe that isn't necessary. Can I just scan the attribute list
    // when building the dataset?  Liveness and caching issues?

    // microdata attributes: many are simple reflected attributes, but
    // I'm not going to implement this now.

    
    var eventHandlerTypes = [
        "abort", "canplay", "canplaythrough", "change", "click", "contextmenu",
        "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave",
        "dragover", "dragstart", "drop", "durationchange", "emptied", "ended",
        "input", "invalid", "keydown", "keypress", "keyup", "loadeddata",
        "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel", "pause", "play", "playing",
        "progress", "ratechange", "readystatechange", "reset", "seeked",
        "seeking", "select", "show", "stalled", "submit", "suspend",
        "timeupdate", "volumechange", "waiting",

        // These last 5 event types will be overriden by HTMLBodyElement
        "blur", "error", "focus", "load", "scroll"
    ];

    eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(HTMLElement.prototype, "on" + type, {
            get: function() {
                return this._getEventHandler(type);
            },
            set: function(v) {
                this._setEventHandler(type, v);
            },
        });

        function EventHandlerChangeHandler(elt, name, oldval, newval) {
            var doc = elt.ownerDocument ? wrap(elt.ownerDocument) : {};
            var form = elt.form ? wrap(elt.form) : {};
            var element = wrap(elt);

            // EventHandlerBuilder uses with, so it is in src/loose.js
            elt[name] = new EventHandlerBuilder(newval,
                                                doc, form, element).build();
        }

        // Define special behavior for the content attribute as well
        impl.Element.registerAttributeChangeHandler(HTMLElement, "on" + type,
                                                    EventHandlerChangeHandler);
    });

    return HTMLElement;
});

defineLazyProperty(impl, "HTMLAnchorElement", function() {
    function HTMLAnchorElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLAnchorElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLAnchorElement"),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLAnchorElement, "href");
    // XXX impl.Element.reflectURLAttribute(HTMLAnchorElement, "ping");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "download");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "target");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "rel");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "media");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "hreflang");
    impl.Element.reflectStringAttribute(HTMLAnchorElement, "type");
    // XXX: also reflect relList

    return HTMLAnchorElement;
});

defineLazyProperty(impl, "HTMLAreaElement", function() {
    function HTMLAreaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLAreaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLAreaElement"),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLAreaElement, "href");
    // XXX impl.Element.reflectURLAttribute(HTMLAreaElement, "ping");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "alt");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "target");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "download");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "rel");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "media");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "hreflang");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "type");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "shape");
    impl.Element.reflectStringAttribute(HTMLAreaElement, "coords");
    // XXX: also reflect relList

    return HTMLAreaElement;
});

defineLazyProperty(impl, "HTMLBRElement", function() {
    function HTMLBRElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLBRElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBRElement"),
    });

    return HTMLBRElement;
});

defineLazyProperty(impl, "HTMLBaseElement", function() {
    function HTMLBaseElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLBaseElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBaseElement"),
    });

    impl.Element.reflectStringAttribute(HTMLBaseElement, "target");

    return HTMLBaseElement;
});

defineLazyProperty(impl, "HTMLBodyElement", function() {
    function HTMLBodyElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLBodyElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBodyElement"),
    });


    // Certain event handler attributes on a <body> tag actually set 
    // handlers for the window rather than just that element.  Define 
    // getters and setters for those here.  Note that some of these override
    // properties on HTMLElement.prototype.  
    // XXX: If I add support for <frameset>, these have to go there, too
    // XXX
    // When the Window object is implemented, these attribute will have
    // to work with the same-named attributes on the Window.

    var eventHandlerTypes = [
        "afterprint", "beforeprint", "beforeunload", "blur", "error",
        "focus","hashchange", "load", "message", "offline", "online",
        "pagehide", "pageshow","popstate","resize","scroll","storage","unload",
    ];

    eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(HTMLBodyElement.prototype, "on" + type, {
            get: function() {
                // XXX: read these from the Window object instead?
                return this._getEventHandler(type);
            },
            set: function(v) {
                // XXX: write to the Window object instead?
                this._setEventHandler(type, v);
            },
        });

        function EventHandlerChangeHandler(elt, name, oldval, newval) {
            var doc = elt.ownerDocument ? wrap(elt.ownerDocument) : {};
            var form = elt.form ? wrap(elt.form) : {};
            var element = wrap(elt);

            // EventHandlerBuilder uses with, so it is in src/loose.js
            elt[name] = new EventHandlerBuilder(newval,
                                                doc, form, element).build();
        }

        // Define special behavior for the content attribute as well
        impl.Element.registerAttributeChangeHandler(HTMLBodyElement,"on" + type,
                                                    EventHandlerChangeHandler);
    });


    return HTMLBodyElement;
});

defineLazyProperty(impl, "HTMLButtonElement", function() {
    function HTMLButtonElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLButtonElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLButtonElement"),
    });

    impl.Element.reflectStringAttribute(HTMLButtonElement, "name");
    impl.Element.reflectBooleanAttribute(HTMLButtonElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLButtonElement, "autofocus");

    impl.Element.reflectStringAttribute(HTMLButtonElement, "value");
    impl.Element.reflectEnumeratedAttribute(HTMLButtonElement, "type", null, {
        submit: "submit", 
        reset: "reset",
        button: "button",
    }, "submit");

    impl.Element.reflectStringAttribute(HTMLButtonElement,
                                        "formtarget", "formTarget");
    impl.Element.reflectBooleanAttribute(HTMLButtonElement,
                                         "formnovalidate", "formNoValidate");
    impl.Element.reflectEnumeratedAttribute(HTMLButtonElement,
                                            "formmethod", "formMethod", {
                                                get: "get",
                                                post: "post"
                                            }, "get");
    impl.Element.reflectEnumeratedAttribute(HTMLButtonElement,
                                            "formenctype", "formEnctype", {
        "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
        "multipart/form-data":"multipart/form-data",
        "text/plain": "text/plain"
    }, "application/x-www-form-urlencoded");


    return HTMLButtonElement;
});

defineLazyProperty(impl, "HTMLCommandElement", function() {
    function HTMLCommandElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLCommandElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLCommandElement"),
    });

    impl.Element.reflectEnumeratedAttribute(HTMLCommandElement, "type", null,
                                            {
                                                command: "command",
                                                checkbox: "checkbox",
                                                radio: "radio"
                                            }, "command");
    impl.Element.reflectStringAttribute(HTMLCommandElement, "label");
    impl.Element.reflectBooleanAttribute(HTMLCommandElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLCommandElement, "checked");
    impl.Element.reflectStringAttribute(HTMLCommandElement, "radiogroup");
    // XXX: also reflect URL attribute icon

    return HTMLCommandElement;
});

defineLazyProperty(impl, "HTMLDListElement", function() {
    function HTMLDListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLDListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDListElement"),
    });

    return HTMLDListElement;
});

defineLazyProperty(impl, "HTMLDataListElement", function() {
    function HTMLDataListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLDataListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDataListElement"),
    });

    return HTMLDataListElement;
});

defineLazyProperty(impl, "HTMLDetailsElement", function() {
    function HTMLDetailsElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLDetailsElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDetailsElement"),
    });

    impl.Element.reflectBooleanAttribute(HTMLDetailsElement, "open");

    return HTMLDetailsElement;
});

defineLazyProperty(impl, "HTMLDivElement", function() {
    function HTMLDivElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLDivElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDivElement"),
    });

    return HTMLDivElement;
});

defineLazyProperty(impl, "HTMLEmbedElement", function() {
    function HTMLEmbedElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLEmbedElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLEmbedElement"),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLEmbedElement, "src");
    impl.Element.reflectStringAttribute(HTMLEmbedElement, "type");
    impl.Element.reflectStringAttribute(HTMLEmbedElement, "width");
    impl.Element.reflectStringAttribute(HTMLEmbedElement, "height");

    return HTMLEmbedElement;
});

defineLazyProperty(impl, "HTMLFieldSetElement", function() {
    function HTMLFieldSetElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLFieldSetElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFieldSetElement"),
    });

    impl.Element.reflectBooleanAttribute(HTMLFieldSetElement, "disabled");
    impl.Element.reflectStringAttribute(HTMLFieldSetElement, "name");

    return HTMLFieldSetElement;
});

defineLazyProperty(impl, "HTMLFormElement", function() {
    function HTMLFormElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLFormElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFormElement"),
    });

    impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "autocomplete",
                                            null,
                                            {
                                                on: "on",
                                                off: "off"
                                            }, "on");
    impl.Element.reflectStringAttribute(HTMLFormElement, "name");
    impl.Element.reflectStringAttribute(HTMLFormElement,
                                        "accept-charset", "acceptCharset");

    impl.Element.reflectStringAttribute(HTMLFormElement, "target");
    impl.Element.reflectBooleanAttribute(HTMLFormElement,
                                         "novalidate", "noValidate");
    impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "method", null, {
        get: "get",
        post: "post"
    }, "get");

    // Both enctype and encoding reflect the enctype content attribute
    impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "enctype", null, {
        "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
        "multipart/form-data":"multipart/form-data",
        "text/plain": "text/plain"
    }, "application/x-www-form-urlencoded");
    impl.Element.reflectEnumeratedAttribute(HTMLFormElement,
                                            "enctype", "encoding", {
        "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
        "multipart/form-data":"multipart/form-data",
        "text/plain": "text/plain"
    }, "application/x-www-form-urlencoded");

    return HTMLFormElement;
});

defineLazyProperty(impl, "HTMLHRElement", function() {
    function HTMLHRElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLHRElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHRElement"),
    });

    return HTMLHRElement;
});

defineLazyProperty(impl, "HTMLHeadElement", function() {
    function HTMLHeadElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLHeadElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHeadElement"),
    });

    return HTMLHeadElement;
});

defineLazyProperty(impl, "HTMLHeadingElement", function() {
    function HTMLHeadingElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLHeadingElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHeadingElement"),
    });

    return HTMLHeadingElement;
});

defineLazyProperty(impl, "HTMLHtmlElement", function() {
    function HTMLHtmlElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLHtmlElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHtmlElement"),
    });

    return HTMLHtmlElement;
});

defineLazyProperty(impl, "HTMLIFrameElement", function() {
    function HTMLIFrameElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLIFrameElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLIFrameElement"),
    });

    // XXX impl.reflectURLAttribute(HTMLIFrameElement, "src");
    impl.Element.reflectStringAttribute(HTMLIFrameElement, "srcdoc");
    impl.Element.reflectStringAttribute(HTMLIFrameElement, "name");
    impl.Element.reflectStringAttribute(HTMLIFrameElement, "width");
    impl.Element.reflectStringAttribute(HTMLIFrameElement, "height");
    // XXX: sandbox is a reflected settable token list
    impl.Element.reflectBooleanAttribute(HTMLIFrameElement, "seamless");
    
    return HTMLIFrameElement;
});

defineLazyProperty(impl, "HTMLImageElement", function() {
    function HTMLImageElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLImageElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLImageElement"),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLImageElement, "src");
    // XXX: I don't know whether to reflect crossorigin as a string or
    // as an enumerated attribute. Since it is not "limited to only
    // known values", I think it is just a string
    impl.Element.reflectStringAttribute(HTMLImageElement, "alt");
    impl.Element.reflectStringAttribute(HTMLImageElement, "crossorigin",
                                        "crossOrigin");
    impl.Element.reflectStringAttribute(HTMLImageElement, "usemap", "useMap");
    impl.Element.reflectBooleanAttribute(HTMLImageElement, "ismap", "isMap");
    


    return HTMLImageElement;
});

defineLazyProperty(impl, "HTMLInputElement", function() {
    function HTMLInputElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLInputElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLInputElement"),
    });


    impl.Element.reflectStringAttribute(HTMLInputElement, "name");
    impl.Element.reflectBooleanAttribute(HTMLInputElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLInputElement, "autofocus");

    impl.Element.reflectStringAttribute(HTMLInputElement, "accept");
    impl.Element.reflectStringAttribute(HTMLInputElement, "alt");
    impl.Element.reflectStringAttribute(HTMLInputElement, "max");
    impl.Element.reflectStringAttribute(HTMLInputElement, "min");
    impl.Element.reflectStringAttribute(HTMLInputElement, "pattern");
    impl.Element.reflectStringAttribute(HTMLInputElement, "placeholder");
    impl.Element.reflectStringAttribute(HTMLInputElement, "step");
    impl.Element.reflectStringAttribute(HTMLInputElement,
                                        "dirname", "dirName");
    impl.Element.reflectStringAttribute(HTMLInputElement,
                                        "value", "defaultValue");

    impl.Element.reflectBooleanAttribute(HTMLInputElement, "multiple");
    impl.Element.reflectBooleanAttribute(HTMLInputElement, "required");
    impl.Element.reflectBooleanAttribute(HTMLInputElement,
                                         "readonly", "readOnly");
    impl.Element.reflectBooleanAttribute(HTMLInputElement,
                                        "checked", "defaultChecked");

    impl.Element.reflectIntegerAttribute(HTMLInputElement, "size", 20, null,
                                         1, null, 1);
    impl.Element.reflectIntegerAttribute(HTMLInputElement, "maxlength", -1,
                                         "maxLength", 0, null, 0);

    // impl.Element.reflectURLAttribute(HTMLInputElement, "src");

    impl.Element.reflectEnumeratedAttribute(HTMLInputElement, "autocomplete",
                                            null,
                                            {
                                                on: "on",
                                                off: "off"
                                            });
    
    impl.Element.reflectEnumeratedAttribute(HTMLInputElement, "type", null, 
                                            {
                                                hidden: "hidden",
                                                text: "text",
                                                search: "search",
                                                tel: "tel",
                                                url: "url",
                                                email: "email",
                                                password: "password",
                                                datetime: "datetime",
                                                date: "date",
                                                month: "month",
                                                week: "week",
                                                time: "time",
                                                "datetime-local": "datetime-local",
                                                number: "number",
                                                range: "range",
                                                color: "color",
                                                checkbox: "checkbox",
                                                radio: "radio",
                                                file: "file",
                                                submit: "submit",
                                                image: "image",
                                                reset: "reset",
                                                button: "button",
                                            }, "text");


    impl.Element.reflectStringAttribute(HTMLInputElement,
                                        "formtarget", "formTarget");
    impl.Element.reflectBooleanAttribute(HTMLInputElement,
                                         "formnovalidate", "formNoValidate");
    impl.Element.reflectEnumeratedAttribute(HTMLInputElement,
                                            "formmethod", "formMethod", {
                                                get: "get",
                                                post: "post"
                                            }, "get");
    impl.Element.reflectEnumeratedAttribute(HTMLInputElement,
                                            "formenctype", "formEnctype", {
        "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
        "multipart/form-data":"multipart/form-data",
        "text/plain": "text/plain"
    }, "application/x-www-form-urlencoded");

    return HTMLInputElement;
});

defineLazyProperty(impl, "HTMLKeygenElement", function() {
    function HTMLKeygenElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLKeygenElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLKeygenElement"),
    });

    impl.Element.reflectStringAttribute(HTMLKeygenElement, "name");
    impl.Element.reflectBooleanAttribute(HTMLKeygenElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLKeygenElement, "autofocus");

    impl.Element.reflectStringAttribute(HTMLKeygenElement, "challenge");
    impl.Element.reflectEnumeratedAttribute(HTMLKeygenElement, "keytype", null,
                                            { rsa: "rsa" }, "rsa");

    return HTMLKeygenElement;
});

defineLazyProperty(impl, "HTMLLIElement", function() {
    function HTMLLIElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLLIElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLIElement"),
    });

    impl.Element.reflectIntegerAttribute(HTMLLIElement, "value", 0);

    return HTMLLIElement;
});

defineLazyProperty(impl, "HTMLLabelElement", function() {
    function HTMLLabelElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLLabelElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLabelElement"),
    });

    impl.Element.reflectStringAttribute(HTMLLabelElement, "for", "htmlFor");

    return HTMLLabelElement;
});

defineLazyProperty(impl, "HTMLLegendElement", function() {
    function HTMLLegendElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLLegendElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLegendElement"),
    });

    return HTMLLegendElement;
});

defineLazyProperty(impl, "HTMLLinkElement", function() {
    function HTMLLinkElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLLinkElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLinkElement"),
    });

    // XXX: still have to reflect URL attribute href
    // and DOMSettableTokenList sizes also DOMTokenList relList
    impl.Element.reflectStringAttribute(HTMLLinkElement, "rel");
    impl.Element.reflectStringAttribute(HTMLLinkElement, "media");
    impl.Element.reflectStringAttribute(HTMLLinkElement, "hreflang");
    impl.Element.reflectStringAttribute(HTMLLinkElement, "type");
    


    return HTMLLinkElement;
});

defineLazyProperty(impl, "HTMLMapElement", function() {
    function HTMLMapElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLMapElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMapElement"),
    });

    impl.Element.reflectStringAttribute(HTMLMapElement, "name");

    return HTMLMapElement;
});

defineLazyProperty(impl, "HTMLMenuElement", function() {
    function HTMLMenuElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLMenuElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMenuElement"),
    });

    impl.Element.reflectStringAttribute(HTMLMenuElement, "type");
    impl.Element.reflectStringAttribute(HTMLMenuElement, "label");

    return HTMLMenuElement;
});

defineLazyProperty(impl, "HTMLMetaElement", function() {
    function HTMLMetaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLMetaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMetaElement"),
    });

    impl.Element.reflectStringAttribute(HTMLMetaElement, "name");
    impl.Element.reflectStringAttribute(HTMLMetaElement, "content");
    impl.Element.reflectStringAttribute(HTMLMetaElement,
                                        "http-equiv", "httpEquiv");

    return HTMLMetaElement;
});

defineLazyProperty(impl, "HTMLMeterElement", function() {
    function HTMLMeterElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLMeterElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMeterElement"),
    });

    return HTMLMeterElement;
});

defineLazyProperty(impl, "HTMLModElement", function() {
    function HTMLModElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLModElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLModElement"),
    });

    impl.Element.reflectStringAttribute(HTMLModElement, "cite");
    impl.Element.reflectStringAttribute(HTMLModElement, "datetime", "dateTime");

    return HTMLModElement;
});

defineLazyProperty(impl, "HTMLOListElement", function() {
    function HTMLOListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLOListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOListElement"),

        // Utility function (see the start attribute default value). Returns
        // the number of <li> children of this element
        _numitems: attribute(function() {
            var items = 0;
            this.childNodes.forEach(function(n) {
                if (n.nodeType === ELEMENT_NODE && n.tagName === "LI")
                    items++;
            });
            return items;
        }),
    });

    impl.Element.reflectStringAttribute(HTMLOListElement, "type");
    impl.Element.reflectBooleanAttribute(HTMLOListElement, "reversed");
    impl.Element.reflectIntegerAttribute(HTMLOListElement, "start", 
                                         function() {
                                             // The default value of the
                                             // start attribute is 1 unless
                                             // the list is reversed. Then it
                                             // is the # of li children
                                             if (this.reversed)
                                                 return this._numitems;
                                             else
                                                 return 1;
                                         });
    

    return HTMLOListElement;
});

defineLazyProperty(impl, "HTMLObjectElement", function() {
    function HTMLObjectElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLObjectElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLObjectElement"),
    });

    // impl.Element.reflectURLAttribute(HTMLObjectElement, "data");
    impl.Element.reflectStringAttribute(HTMLObjectElement, "type");
    impl.Element.reflectStringAttribute(HTMLObjectElement, "name");
    impl.Element.reflectStringAttribute(HTMLObjectElement, "usemap", "useMap");
    impl.Element.reflectBooleanAttribute(HTMLObjectElement,
                                         "typemustmatch", "typeMustMatch");
    impl.Element.reflectStringAttribute(HTMLObjectElement, "width");
    impl.Element.reflectStringAttribute(HTMLObjectElement, "height");

    return HTMLObjectElement;
});

defineLazyProperty(impl, "HTMLOptGroupElement", function() {
    function HTMLOptGroupElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLOptGroupElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOptGroupElement"),
    });
    
    impl.Element.reflectBooleanAttribute(HTMLOptGroupElement, "disabled");
    impl.Element.reflectStringAttribute(HTMLOptGroupElement, "label");

    return HTMLOptGroupElement;
});

defineLazyProperty(impl, "HTMLOptionElement", function() {
    function HTMLOptionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLOptionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOptionElement"),
    });

    impl.Element.reflectBooleanAttribute(HTMLOptionElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLOptionElement,
                                         "selected", "defaultSelected");
    impl.Element.reflectStringAttribute(HTMLOptionElement, "label");

    return HTMLOptionElement;
});

defineLazyProperty(impl, "HTMLOutputElement", function() {
    function HTMLOutputElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLOutputElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOutputElement"),
    });

    // XXX Reflect for/htmlFor as a settable token list
    impl.Element.reflectStringAttribute(HTMLOutputElement, "name");

    return HTMLOutputElement;
});

defineLazyProperty(impl, "HTMLParagraphElement", function() {
    function HTMLParagraphElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLParagraphElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLParagraphElement"),
    });

    return HTMLParagraphElement;
});

defineLazyProperty(impl, "HTMLParamElement", function() {
    function HTMLParamElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLParamElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLParamElement"),
    });

    return HTMLParamElement;
});

defineLazyProperty(impl, "HTMLPreElement", function() {
    function HTMLPreElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLPreElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLPreElement"),
    });

    return HTMLPreElement;
});

defineLazyProperty(impl, "HTMLProgressElement", function() {
    function HTMLProgressElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLProgressElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLProgressElement"),
    });

    impl.Element.reflectPositiveFloatAttribute(HTMLProgressElement, "max", 1.0);

    return HTMLProgressElement;
});

defineLazyProperty(impl, "HTMLQuoteElement", function() {
    function HTMLQuoteElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLQuoteElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLQuoteElement"),
    });

    impl.Element.reflectStringAttribute(HTMLQuoteElement, "cite");

    return HTMLQuoteElement;
});

// HTMLScriptElement used to be here, but now has its own file.

defineLazyProperty(impl, "HTMLSelectElement", function() {
    function HTMLSelectElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLSelectElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSelectElement"),
    });

    impl.Element.reflectStringAttribute(HTMLSelectElement, "name");
    impl.Element.reflectBooleanAttribute(HTMLSelectElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLSelectElement, "autofocus");

    impl.Element.reflectBooleanAttribute(HTMLSelectElement, "multiple");
    impl.Element.reflectBooleanAttribute(HTMLSelectElement, "required");
    impl.Element.reflectIntegerAttribute(HTMLSelectElement, "size", 0);
    
    return HTMLSelectElement;
});

defineLazyProperty(impl, "HTMLSourceElement", function() {
    function HTMLSourceElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLSourceElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSourceElement"),
    });

    // impl.Element.reflectURLAttribute(HTMLSourceElement, "src");
    impl.Element.reflectStringAttribute(HTMLSourceElement, "type");
    impl.Element.reflectStringAttribute(HTMLSourceElement, "media");

    return HTMLSourceElement;
});

defineLazyProperty(impl, "HTMLSpanElement", function() {
    function HTMLSpanElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLSpanElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSpanElement"),
    });

    return HTMLSpanElement;
});

defineLazyProperty(impl, "HTMLStyleElement", function() {
    function HTMLStyleElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLStyleElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLStyleElement"),
    });

    impl.Element.reflectStringAttribute(HTMLStyleElement, "media");
    impl.Element.reflectStringAttribute(HTMLStyleElement, "type");
    impl.Element.reflectBooleanAttribute(HTMLStyleElement, "scoped");

    return HTMLStyleElement;
});

defineLazyProperty(impl, "HTMLTableCaptionElement", function() {
    function HTMLTableCaptionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableCaptionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableCaptionElement"),
    });

    return HTMLTableCaptionElement;
});

defineLazyProperty(impl, "HTMLTableCellElement", function() {
    function HTMLTableCellElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableCellElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableCellElement"),
    });

    impl.Element.reflectIntegerAttribute(HTMLTableCellElement, "colspan", 1,
                                         "colSpan", 1, null, 1);
    impl.Element.reflectIntegerAttribute(HTMLTableCellElement, "rowspan", 1,
                                         "rowSpan");
    //XXX Also reflect settable token list headers


    return HTMLTableCellElement;
});

defineLazyProperty(impl, "HTMLTableColElement", function() {
    function HTMLTableColElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableColElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableColElement"),
    });

    impl.Element.reflectIntegerAttribute(HTMLTableColElement, "span", 1, null,
                                         1, null, 1);
    

    return HTMLTableColElement;
});

defineLazyProperty(impl, "HTMLTableElement", function() {
    function HTMLTableElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableElement"),
    });

    impl.Element.reflectStringAttribute(HTMLTableElement, "border");

    return HTMLTableElement;
});

defineLazyProperty(impl, "HTMLTableRowElement", function() {
    function HTMLTableRowElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableRowElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableRowElement"),
    });

    return HTMLTableRowElement;
});

defineLazyProperty(impl, "HTMLTableSectionElement", function() {
    function HTMLTableSectionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTableSectionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableSectionElement"),
    });

    return HTMLTableSectionElement;
});

defineLazyProperty(impl, "HTMLTextAreaElement", function() {
    function HTMLTextAreaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTextAreaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTextAreaElement"),
    });


    impl.Element.reflectStringAttribute(HTMLTextAreaElement, "name");
    impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "disabled");
    impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "autofocus");

    impl.Element.reflectStringAttribute(HTMLTextAreaElement, "placeholder");
    impl.Element.reflectStringAttribute(HTMLTextAreaElement, "wrap");
    impl.Element.reflectStringAttribute(HTMLTextAreaElement,
                                        "dirname", "dirName");

    impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "required");
    impl.Element.reflectBooleanAttribute(HTMLTextAreaElement,
                                         "readonly", "readOnly");

    impl.Element.reflectIntegerAttribute(HTMLTextAreaElement, "rows", 2, null,
                                         1, null, 1);
    impl.Element.reflectIntegerAttribute(HTMLTextAreaElement, "cols", 20, null,
                                         1, null, 1);
    impl.Element.reflectIntegerAttribute(HTMLTextAreaElement,
                                         "maxlength", -1, "maxLength",
                                         0, null, 0);


    return HTMLTextAreaElement;
});

defineLazyProperty(impl, "HTMLTimeElement", function() {
    function HTMLTimeElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTimeElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTimeElement"),
    });

    impl.Element.reflectStringAttribute(HTMLTimeElement, "datetime","dateTime");
    impl.Element.reflectBooleanAttribute(HTMLTimeElement, "pubdate", "pubDate");

    return HTMLTimeElement;
});

defineLazyProperty(impl, "HTMLTitleElement", function() {
    function HTMLTitleElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTitleElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTitleElement"),
    });

    return HTMLTitleElement;
});

defineLazyProperty(impl, "HTMLTrackElement", function() {
    function HTMLTrackElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLTrackElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTrackElement"),
    });

    // impl.Element.reflectURLAttribute(HTMLTrackElement, "src");
    impl.Element.reflectStringAttribute(HTMLTrackElement, "srclang");
    impl.Element.reflectStringAttribute(HTMLTrackElement, "label");
    impl.Element.reflectBooleanAttribute(HTMLTrackElement, "default");
    impl.Element.reflectEnumeratedAttribute(HTMLTrackElement, "kind", null,
                                            {
                                                subtitles: "subtitles",
                                                captions: "captions",
                                                descriptions: "descriptions",
                                                chapters: "chapters",
                                                metadata: "metadata"
                                            }, 
                                            "subtitles");


    return HTMLTrackElement;
});

defineLazyProperty(impl, "HTMLUListElement", function() {
    function HTMLUListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLUListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLUListElement"),
    });

    return HTMLUListElement;
});

defineLazyProperty(impl, "HTMLUnknownElement", function() {
    function HTMLUnknownElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLUnknownElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLUnknownElement"),
    });

    return HTMLUnknownElement;
});

defineLazyProperty(impl, "HTMLMediaElement", function() {
    function HTMLMediaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLMediaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMediaElement"),
    });

    // impl.Element.reflectURLAttribute(HTMLMediaElement, "src");
    impl.Element.reflectStringAttribute(HTMLMediaElement,
                                        "crossorigin", "crossOrigin");
    impl.Element.reflectEnumeratedAttribute(HTMLMediaElement, "preload", null,
                                            {
                                                none: "none",
                                                metadata: "metadata",
                                                auto: "auto",
                                                "": "auto"
                                            },
                                            "metadata" // user-agent defined
                                           );

    impl.Element.reflectBooleanAttribute(HTMLMediaElement, "loop");
    impl.Element.reflectBooleanAttribute(HTMLMediaElement, "autoplay");
    impl.Element.reflectStringAttribute(HTMLMediaElement,
                                        "mediagroup", "mediaGroup");
    impl.Element.reflectBooleanAttribute(HTMLMediaElement, "controls");
    impl.Element.reflectBooleanAttribute(HTMLMediaElement,
                                         "muted", "defaultMuted");

    return HTMLMediaElement;
});

defineLazyProperty(impl, "HTMLAudioElement", function() {
    function HTMLAudioElement(doc, localName, prefix) {
        impl.HTMLMediaElement.call(this, doc, localName, prefix);
    }

    HTMLAudioElement.prototype = O.create(impl.HTMLMediaElement.prototype, {
        _idlName: constant("HTMLAudioElement"),
    });

    return HTMLAudioElement;
});

defineLazyProperty(impl, "HTMLVideoElement", function() {
    function HTMLVideoElement(doc, localName, prefix) {
        impl.HTMLMediaElement.call(this, doc, localName, prefix);
    }

    HTMLVideoElement.prototype = O.create(impl.HTMLMediaElement.prototype, {
        _idlName: constant("HTMLVideoElement"),
    });

    // impl.Element.reflectURLAttribute(HTMLVideoElement,"poster");
    impl.Element.reflectIntegerAttribute(HTMLVideoElement, "width", 0, null,0);
    impl.Element.reflectIntegerAttribute(HTMLVideoElement, "height", 0, null,0);

    return HTMLVideoElement;
});

defineLazyProperty(impl, "HTMLTableDataCellElement", function() {
    function HTMLTableDataCellElement(doc, localName, prefix) {
        impl.HTMLTableCellElement.call(this, doc, localName, prefix);
    }

    HTMLTableDataCellElement.prototype = O.create(impl.HTMLTableCellElement.prototype, {
        _idlName: constant("HTMLTableDataCellElement"),
    });

    return HTMLTableDataCellElement;
});

defineLazyProperty(impl, "HTMLTableHeaderCellElement", function() {
    function HTMLTableHeaderCellElement(doc, localName, prefix) {
        impl.HTMLTableCellElement.call(this, doc, localName, prefix);
    }

    HTMLTableHeaderCellElement.prototype = O.create(impl.HTMLTableCellElement.prototype, {
        _idlName: constant("HTMLTableHeaderCellElement"),
    });

    impl.Element.reflectEnumeratedAttribute(HTMLTableHeaderCellElement,
                                            "scope", null, {
                                                row: "row",
                                                col: "col",
                                                rowgroup: "rowgroup",
                                                colgroup: "colgroup",
                                            },
                                            "");

    return HTMLTableHeaderCellElement;
});

defineLazyProperty(impl, "HTMLFrameSetElement", function() {
    function HTMLFrameSetElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLFrameSetElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFrameSetElement"),
    });

    return HTMLFrameSetElement;
});

defineLazyProperty(impl, "HTMLFrameElement", function() {
    function HTMLFrameElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
    }

    HTMLFrameElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFrameElement"),
    });

    return HTMLFrameElement;
});
