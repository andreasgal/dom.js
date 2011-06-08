defineLazyProperty(global, "EventTarget", function() {
    return idl.EventTarget.publicInterface;
}, true);

defineLazyProperty(idl, "EventTarget", function() {
    return implementIDLInterface({
        name: "EventTarget",
        members: {
            /*
             * void addEventListener(DOMString type,
             *                       EventListener listener,
             *                       optional boolean capture);
             * 
             * When the addEventListener(type, listener, capture) method
             * is invoked these steps must be run:
             * 
             *   If listener is null terminate these steps.
             * 
             *   If capture is omitted let capture be false.
             * 
             *   Append an event listener to the associated list of event
             *   listeners with name set to type, listener set to
             *   listener, and capture set to capture, unless there
             *   already is an event listener in that list with the same
             *   name, listener, and capture.
             */
            addEventListener: function addEventListener(type,
                                                        listener,
                                                        capture) {
                nyi();
            },

            /*
             * void removeEventListener(DOMString type,
             *                          EventListener listener, 
             *                          optional boolean capture);
             * 
             * When the removeEventListener(type, listener, capture)
             * method is invoked these steps must be run:
             * 
             *   If capture is omitted let capture be false.
             * 
             *   Remove an event listener from the associated list of
             *   event listeners, whose name is name, listener is
             *   listener, and capture is capture.
             */
            removeEventListener: function removeEventListener(type,
                                                              listener,
                                                              capture) {
                nyi();
            },

            /*
             * boolean dispatchEvent(Event event);
             * 
             * When the dispatchEvent(event) method is invoked these steps
             * must be run:
             * 
             *   If event's dispatch flag is set, or if its initialized
             *   flag isn't set, throw an INVALID_STATE_ERR exception and
             *   terminate these steps.
             * 
             *   Unset event's trusted flag.
             * 
             *   Dispatch the event and return the value that returns. 
             */
            dispatchEvent: function dispatchEvent(event) {
                nyi();
            }
        }
    });
});
