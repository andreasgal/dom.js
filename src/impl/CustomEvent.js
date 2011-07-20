defineLazyProperty(impl, "CustomEvent", function() {
    function CustomEvent(type, dictionary) {
        // Just use the superclass constructor to initialize
        impl.Event.call(this, type, dictionary);
    }
    CustomEvent.prototype = Object.create(impl.Event.prototype);
    return CustomEvent;
});
