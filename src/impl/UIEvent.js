defineLazyProperty(impl, "UIEvent", function() {
    function UIEvent() {
        // Just use the superclass constructor to initialize
        impl.Event.call(this);

        this.view = null;  // FF uses the current window
        this.detail = 0;
    }
    UIEvent.prototype = O.create(impl.Event.prototype, {
        _idlName: constant("UIEvent"),
        initUIEvent: constant(function(type, bubbles, cancelable,
                                       view, detail) {
            this.initEvent(type, bubbles, cancelable);
            this.view = view;
            this.detail = detail;
        }),
    });
    return UIEvent;
});
