defineLazyProperty(impl, "EventTarget", function() {
    function EventTarget() {}

    EventTarget.prototype = O.create(Object.prototype, {
        _idlName: constant("EventTarget"),

        // XXX
        // See WebIDL §4.8 for details on object event handlers
        // and how they should behave.  We actually have to accept
        // any object to addEventListener... Can't type check it.
        // on registration.

        // XXX:
        // Capturing event listeners are sort of rare.  I think I can optimize
        // them so that dispatchEvent can skip the capturing phase (or much of
        // it).  Each time a capturing listener is added, increment a flag on
        // the target node and each of its ancestors.  Decrement when removed.
        // And update the counter when nodes are added and removed from the
        // tree as well.  Then, in dispatch event, the capturing phase can 
        // abort if it sees any node with a zero count.  
        addEventListener: constant(function addEventListener(type,
                                                             listener,
                                                             capture) {
            
            if (!listener) return;
            if (!this._listeners) this._listeners = {};
            if (!(type in this._listeners)) this._listeners[type] = {};
            let list = this._listeners[type];

            // If this listener has already been registered, just return
            for(var i = 0, n = list.length; i < n; i++) {
                let l = list[i];
                if (l.listener === listener && l.capture === capture)
                    return;
            }
            
            // Add an object to the list of listeners
            let obj = { listener: listener, capture: capture };
            if (typeof listener === "function") obj.f = listener;
            push(list, obj);
        }),

        removeEventListener: constant(function removeEventListener(type,
                                                                   listener,
                                                                   capture) {
            if (this._listeners) {
                let list = this._listeners[type];
                if (list) {
                    // Find the listener in the list and remove it
                    for(var i = 0, n = list.length; i < n; i++) {
                        let l = list[i];
                        if (l.listener === listener && l.capture === capture) {
                            if (list.length === 1)
                                delete this._listeners[type];
                            else 
                                splice(list, i, 1);
                        }
                    }
                }
            }
        }),

        // See DOMCore §4.4
        dispatchEvent: constant(function dispatchEvents(event) {

            function invoke(target, event) {
                let type = event.type, phase = event.eventPhase;
                event.currentTarget = target;

                if (!target._listeners) return;
                let list = target._listeners[type];
                if (!list) return;

                for(var i = 0, n = list.length; i < n; i++) {
                    if (event._stopImmediatePropagation) return;
                    let l = list[i];
                    if ((phase === CAPTURING_PHASE && !l.capture) ||
                        (phase === BUBBLING_PHASE && l.capture))
                        continue;
                    if (l.f) {
                        l.f.call(event.currentTarget, wrap(event));
                    }
                    else {
                        let f = l.listener.handleEvent;
                        if (typeof f !== "function")
                            throw TypeError("handleEvent property of " +
                                            "event listener object is " +
                                            "not a function.");
                        f.call(l.listener, wrap(event));
                    }
                }
            }

            if (!event._initialized || event._dispatching) InvalidStateError();
            event.isTrusted = false;
            
            // Begin dispatching the event now
            event._dispatching = true;
            event.target = this;

            // Build the list of targets for the capturing and bubbling phases
            // XXX: we'll eventually have to add Window to this list.
            let ancestors = [];
            for(let n = this.parentNode; n; n = n.parentNode)
                push(ancestors, n);

            // Capturing phase
            event.eventPhase = CAPTURING_PHASE;
            for(let i = ancestors.length-1; i >= 0; i--) {
                invoke(ancestors[i], event);
                if (event._propagationStopped) break;
            }

            // At target phase
            if (!event._propagationStopped) {
                event.eventPhase = AT_TARGET;
                invoke(this, event);
            }

            // Bubbling phase
            if (event.bubbles && !event._propagationStopped) {
                event.eventPhase = BUBBLING_PHASE;
                for(let i = 0, n = ancestors.length; i < n; i++) {
                    invoke(ancestors[i], event);
                    if (event._propagationStopped) break;
                }
            }

            event._dispatching = false;
            event.eventPhase = AT_TARGET;
            event.currentTarget = null;

            return !event.defaultPrevented;
        }),
    });

    return EventTarget;
});