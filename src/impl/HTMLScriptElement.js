defineLazyProperty(impl, "HTMLScriptElement", function() {
    const JavaScriptMimeTypes = {
        "application/ecmascript":true,
        "application/javascript":true,
        "application/x-ecmascript":true,
        "application/x-javascript":true,
        "text/ecmascript":true,
        "text/javascript":true,
        "text/javascript1.0":true,
        "text/javascript1.1":true,
        "text/javascript1.2":true,
        "text/javascript1.3":true,
        "text/javascript1.4":true,
        "text/javascript1.5":true,
        "text/jscript":true,
        "text/livescript":true,
        "text/x-ecmascript":true,
        "text/x-javascript":true
    };


    function HTMLScriptElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
        // Internal script flags, used by the parser and elsewhere
        this._already_started = false;
        this._parser_inserted = false;
        this._ready_to_execute = false;
        this._force_async = true;
        this._had_async_content_attribute = false;
        this._creatorDocument = doc; // in case ownerDocument changes later
    }

    // Script elements that are not parser inserted must call _prepare() when:
    // 1) a script is inserted into the document.  (see _roothook below)
    // 2) the script's children change
    //   XXX: need to make this one happen
    //   I could use a proxy array for childNodes and handle that here
    //   That might be more efficient than adding hooks in Node.
    //   Also, I sent email to whatwg mailing list about this.
    //   Firefox actually triggers a script if a text node child
    //   changes from the empty string to non-empty, and that would
    //   be hard to have a hook for. Or, I could use the modtime thing
    //   to look for any changes on any descendant and then check the
    //   text property. The transition from "" to non-empty text would
    //   be a _prepare() trigger.  But I'm hoping that the spec will change
    //   so that any child insertion (including an empty text node) \
    //   is enough.
    //
    // 3) when the a src attribute is defined
    //   (See _newattrhook below);
    //


    HTMLScriptElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLScriptElement"),

        // Script elements need to know when they're inserted into the
        // document, so they define this hook method
        _roothook: constant(function() {
            if (!this._parser_inserted) this._prepare();
        }),

        // The Script element needs to know when its src and async attrs are set
        _newattrhook: constant(function(name, value) {
            switch(name) {
            case 'async':
                this._force_async = false;
                break;
            case 'src':
                if (!this._parser_inserted && this.rooted) this._prepare();
                break;
            }
        }),

        // The Script element needs to know when a child is added
        // This hook is only for direct children: it does not bubble up
        _addchildhook: constant(function(child) {
            // XXX what if multiple children are added at once
            // via a DocumentFragment, do we run all of them or only the first?
            if (!this._parser_inserted && this.rooted) this._prepare();
        }),

        // Finally, it needs to know when a Text child has changed
        // This hook only gets triggered for direct children, not all
        // descendants
        _textchangehook: constant(function(child) {
            if (!this._parser_inserted && this.rooted) this._prepare();
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
        _prepare: constant(function() {
            // If the script element is marked as having "already started",
            // then the user agent must abort these steps at this point. The
            // script is not executed.
            if (this._already_started) return;

            // If the element has its "parser-inserted" flag set, then set
            // was-parser-inserted to true and unset the element's
            // "parser-inserted" flag. Otherwise, set was-parser-inserted to
            // false.
            var was_parser_inserted = this._parser_inserted;
            this._parser_inserted = false;

            // If was-parser-inserted is true and the element does not have an
            // async attribute, then set the element's "force-async" flag to
            // true.
            if (was_parser_inserted && !this.hasAttribute("async"))
                this._force_async = true;

            // If the element has no src attribute, and its child nodes, if
            // any, consist only of comment nodes and empty text nodes, then
            // the user agent must abort these steps at this point. The script
            // is not executed.
            if (!this.hasAttribute("src") && this.text === "") return;

            // If the element is not in a Document, then the user agent must
            // abort these steps at this point. The script is not executed.
            if (!this.rooted) return;

            // If either:
            //     the script element has a type attribute and its value is the
            //     empty string, or the script element has no type attribute
            //     but it has a language attribute and that attribute's value
            //     is the empty string, or the script element has neither a
            //     type attribute nor a language attribute, then
            //
            // ...let the script block's type for this script element be
            // "text/javascript".
            //
            // Otherwise, if the script element has a type attribute, let the
            // script block's type for this script element be the value of that
            // attribute with any leading or trailing sequences of space
            // characters removed.
            //
            // Otherwise, the element has a non-empty language attribute; let
            // the script block's type for this script element be the
            // concatenation of the string "text/" followed by the value of the
            // language attribute.
            //
            // The language attribute is never conforming, and is always
            // ignored if there is a type attribute present.
            var hastype = this.hasAttribute("type");
            var typeattr = hastype ? this.getAttribute("type") : undefined;
            var haslang = this.hasAttribute("language");
            var langattr = haslang ? this.getAttribute("language") : undefined;
            var scripttype;

            if ((typeattr === "") ||
                (!hastype && langattr === "") ||
                (!hastype && !haslang)) {
                scripttype = "text/javascript";
            }
            else if (hastype) {
                // Can't use trim() here, because it has a different
                // definition of whitespace than html does
                scripttype = htmlTrim(typeattr);
            }
            else {
                scripttype = "text/" + langattr;
            }

            // If the user agent does not support the scripting language given
            // by the script block's type for this script element, then the
            // user agent must abort these steps at this point. The script is
            // not executed.
            if (!JavaScriptMimeTypes[toLowerCase(scripttype)]) return;

            // If was-parser-inserted is true, then flag the element as
            // "parser-inserted" again, and set the element's "force-async"
            // flag to false.
            if (was_parser_inserted) {
                this._parser_inserted = true;
                this._force_async = false;
            }

            // The user agent must set the element's "already started" flag.
            this._already_started = true;

            // The state of the element at this moment is later used to
            // determine the script source.
            this._script_text = this.text;  // We'll use this in _execute

            // If the element is flagged as "parser-inserted", but the
            // element's Document is not the Document of the parser that
            // created the element, then abort these steps.
            if (this._parser_inserted &&
                this.ownerDocument !== this._creatorDocument)
                return;  // Script was moved to a new document

            // If scripting is disabled for the script element, then the user
            // agent must abort these steps at this point. The script is not
            // executed.
            //
            // The definition of scripting is disabled means that, amongst
            // others, the following scripts will not execute: scripts in
            // XMLHttpRequest's responseXML documents, scripts in
            // DOMParser-created documents, scripts in documents created by
            // XSLTProcessor's transformToDocument feature, and scripts that
            // are first inserted by a script into a Document that was created
            // using the createDocument() API. [XHR] [DOMPARSING] [DOMCORE]
            //
            // XXX: documents with a browsing context have scripting on
            // (except iframes with the sandbox attr). Standalone docs do not.
            // Its not clear to me when I should set this flag.  dom.js is
            // in a weird situation since we don't really have a window yet,
            // but we do want to run scripts.  For now, I think I'll have
            // the parser set this, and also set it on the initial
            // global document.
            //
            if (!this.ownerDocument._scripting_enabled) return;

            // If the script element has an event attribute and a for
            // attribute, then run these substeps:
            //
            //     Let for be the value of the for attribute.
            //
            //     Let event be the value of the event attribute.
            //
            //     Strip leading and trailing whitespace from event and for.
            //
            //     If for is not an ASCII case-insensitive match for the string
            //     "window", then the user agent must abort these steps at this
            //     point. The script is not executed.
            //
            //     If event is not an ASCII case-insensitive match for either
            //     the string "onload" or the string "onload()", then the user
            //     agent must abort these steps at this point. The script is
            //     not executed.

            var forattr = this.getAttribute("for") || "";
            var eventattr = this.getAttribute("event") || "";
            if (forattr || eventattr) {
                forattr = toLowerCase(htmlTrim(forattr));
                eventattr = toLowerCase(htmlTrim(eventattr));
                if (forattr !== "window" ||
                    (event !== "onload" && event !== "onload()"))
                    return;
            }


            // If the script element has a charset attribute, then let the
            // script block's character encoding for this script element be the
            // encoding given by the charset attribute.
            //
            // Otherwise, let the script block's fallback character encoding
            // for this script element be the same as the encoding of the
            // document itself.
            //
            // Only one of these two pieces of state is set.
            if (this.hasAttribute("charset")) {
                // XXX: ignoring charset issues for now
            }
            else {
                // XXX: ignoring charset issues for now
            }

            // If the element has a src attribute whose value is not the empty
            // string, then the value of that attribute must be resolved
            // relative to the element, and if that is successful, the
            // specified resource must then be fetched, from the origin of the
            // element's Document.
            //
            // If the src attribute's value is the empty string or if it could
            // not be resolved, then the user agent must queue a task to fire a
            // simple event named error at the element, and abort these steps.
            //
            // For historical reasons, if the URL is a javascript: URL, then
            // the user agent must not, despite the requirements in the
            // definition of the fetching algorithm, actually execute the
            // script in the URL; instead the user agent must act as if it had
            // received an empty HTTP 400 response.
            //
            // For performance reasons, user agents may start fetching the
            // script as soon as the attribute is set, instead, in the hope
            // that the element will be inserted into the document. Either way,
            // once the element is inserted into the document, the load must
            // have started. If the UA performs such prefetching, but the
            // element is never inserted in the document, or the src attribute
            // is dynamically changed, then the user agent will not execute the
            // script, and the fetching process will have been effectively
            // wasted.
            if (this.hasAttribute("src")) {
                // XXX
                // The spec for handling this is really, really complicated.
                // For now, I'm just going to try to get something basic working

                var url = this.getAttribute("src");

                if (this.ownerDocument._parser) {
                    this.ownerDocument._parser.pause();
                }

/*
                // XXX: this is a hack
                // If we're running in node, and the document has an
                // _address, then we can resolve the URL
                if (this.ownerDocument._address &&
                    typeof require === "function") {
                    url = require('url').resolve(this.ownerDocument._address,
                                                 url);
                }
*/
                // Resolve the script url against the document url
                var documenturl = new URL(this.ownerDocument.defaultView.location.href);
                url = documenturl.resolve(url);


                // XXX: this is experimental
                // If we're in a web worker, use importScripts
                // to load and execute the script.
                // Maybe this will give us better error messages
                if (global.importScripts) {
                    try {
                        importScripts(url);
                    }
                    catch(e) {
                        error(e + " " + e.stack);
                    }
                    finally {
                        this.ownerDocument._parser.resume();
                    }
                }
                else {

                    var script = this;
                    var xhr = new XMLHttpRequest();

                    // Web workers support this handler but not the old
                    // onreadystatechange handler
                    xhr.onloadend = function() {
                        if (xhr.status === 200 ||
                            xhr.status === 0 /* file:// urls */) {
                            script._script_text = xhr.responseText;
                            script._execute();
                            delete script._script_text;
                        }
                        // Do this even if we failed
                        if (script.ownerDocument._parser) {
                            script.ownerDocument._parser.resume();
                        }
                    };

                    // My node version of XHR responds to this handler but
                    // not to onloadend above.
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState !== 4) return;
                        if (xhr.status === 200 ||
                            xhr.status === 0 /* file:// urls */) {
                            script._script_text = xhr.responseText;
                            script._execute();
                            delete script._script_text;
                        }

                        // Do this even if we failed
                        if (script.ownerDocument._parser) {
                            script.ownerDocument._parser.resume();
                        }
                    }

                    xhr.open("GET", url);
                    xhr.send();
                }
            }
            else {

                // XXX
                // Just execute inlines scripts now.
                // Later, I've got to deal with the all the cases below

                this._execute();
            }

            // Then, the first of the following options that describes the
            // situation must be followed:

            // If the element has a src attribute, and the element has a defer
            // attribute, and the element has been flagged as
            // "parser-inserted", and the element does not have an async
            // attribute

            //     The element must be added to the end of the list of scripts
            //     that will execute when the document has finished parsing
            //     associated with the Document of the parser that created the
            //     element.

            //     The task that the networking task source places on the task
            // queue once the fetching algorithm has completed must set the
            // element's "ready to be parser-executed" flag. The parser will
            // handle executing the script.  If the element has a src
            // attribute, and the element has been flagged as
            // "parser-inserted", and the element does not have an async
            // attribute

            //     The element is the pending parsing-blocking script of the
            //     Document of the parser that created the element. (There can
            //     only be one such script per Document at a time.)

            //     The task that the networking task source places on the task
            // queue once the fetching algorithm has completed must set the
            // element's "ready to be parser-executed" flag. The parser will
            // handle executing the script.  If the element does not have a src
            // attribute, and the element has been flagged as
            // "parser-inserted", and the Document of the HTML parser or XML
            // parser that created the script element has a style sheet that is
            // blocking scripts

            //     The element is the pending parsing-blocking script of the
            //     Document of the parser that created the element. (There can
            //     only be one such script per Document at a time.)

            //     Set the element's "ready to be parser-executed" flag. The
            // parser will handle executing the script.  If the element has a
            // src attribute, does not have an async attribute, and does not
            // have the "force-async" flag set

            //     The element must be added to the end of the list of scripts
            //     that will execute in order as soon as possible associated
            //     with the Document of the script element at the time the
            //     prepare a script algorithm started.

            //     The task that the networking task source places on the task
            //     queue once the fetching algorithm has completed must run the
            //     following steps:

            //         If the element is not now the first element in the list
            //         of scripts that will execute in order as soon as
            //         possible to which it was added above, then mark the
            //         element as ready but abort these steps without executing
            //         the script yet.

            //         Execution: Execute the script block corresponding to the
            //         first script element in this list of scripts that will
            //         execute in order as soon as possible.

            //         Remove the first element from this list of scripts that
            //         will execute in order as soon as possible.

            //         If this list of scripts that will execute in order as
            //         soon as possible is still not empty and the first entry
            //         has already been marked as ready, then jump back to the
            //         step labeled execution.

            // If the element has a src attribute

            //     The element must be added to the set of scripts that will
            //     execute as soon as possible of the Document of the script
            //     element at the time the prepare a script algorithm started.

            //     The task that the networking task source places on
            //     the task queue once the fetching algorithm has
            //     completed must execute the script block and then
            //     remove the element from the set of scripts that
            //     will execute as soon as possible.
            //
            // Otherwise The user agent must immediately execute the
            // script block, even if other scripts are already
            // executing.
        }),

        _execute: constant(function() {
            // We test this in _prepare(), but the spec says we
            // have to check again here.
            if (this._parser_inserted &&
                this.ownerDocument !== this._creatorDocument) return;

            // XXX
            // For now, we're just doing inline scripts, so I'm skipping
            // the steps about if the load was not successful.
            var code = this._script_text;

            // If the script is from an external file, then increment the
            // ignore-destructive-writes counter of the script element's
            // Document. Let neutralized doc be that Document.
            // XXX: ignoring this for inline scripts for now.

            // XXX
            // There is actually more to executing a script than this.
            // See http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#create-a-script
            try {
// XXX For now, we're just assuming that there is never more than
// one document at a time, and all scripts get executed against the
// same global object.
//                var olddoc = global.document;
//                global.document = wrap(this.ownerDocument);
                evalScript(code);
//                global.document = olddoc;
            }
            catch(e) {
                // XXX fire an onerror event before reporting
                error(e + " " + e.stack);
            }

            // Decrement the ignore-destructive-writes counter of neutralized
            // doc, if it was incremented in the earlier step.

            // If the script is from an external file, fire a simple event
            // named load at the script element.

            // Otherwise, the script is internal; queue a task to fire a simple
            // event named load at the script element.

        }),
    });

    // XXX impl.Element.reflectURLAttribute(HTMLScriptElement, "src");
    impl.Element.reflectStringAttribute(HTMLScriptElement, "type");
    impl.Element.reflectStringAttribute(HTMLScriptElement, "charset");
    impl.Element.reflectBooleanAttribute(HTMLScriptElement, "defer");


    return HTMLScriptElement;
});
