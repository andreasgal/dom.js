// This is a simple constructor for a simple Window implementation
// We'll set things up (in src/main.js for now) so that it unwraps
// to the global object
function Window() {
    this.document = new impl.DOMImplementation().createHTMLDocument("");
    this.document._scripting_enabled = true;
    this.document.defaultView = this;
    this.location = new impl.Location(this, "about:blank");
}

Window.prototype = O.create(impl.EventTarget.prototype, {
    _idlName: constant("Window"),

    history: constant({
        back: nyi,
        forward: nyi,
        go: nyi,
        _idlName: "History"
    }),

    navigator: constant({
        appName: "dom.js",
        appVersion: "0.1",
        platform: "JavaScript!",
        userAgent: "Servo",
        _idlName: "Navigator"
    }),

    // Self-referential properties
    window: attribute(function() { return this; }),
    self: attribute(function() { return this; }),
    frames: attribute(function() { return this; }),

    // Self-referential properties for a top-level window
    parent: attribute(function() { return this; }),
    top: attribute(function() { return this; }),

    // We don't support any other windows for now
    length: constant(0),           // no frames
    frameElement: constant(null),  // not part of a frame
    opener: constant(null),        // not opened by another window

    // The onload event handler.
    // XXX: need to support a bunch of other event types, too,
    // and have them interoperate with document.body.

    onload: attribute(
        function() {
            return this._getEventHandler("load");
        },
        function(v) {
            this._setEventHandler("load", v);
        }
    ),


});
