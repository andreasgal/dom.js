var ElementStack = (function() {

    function ElementStack() {
        this.elements = [];
        this.top = null;  // stack.top is the "current node" in the spec
    }

    ElementStack.prototype.push = function(e) {
        push(this.elements, e);
        this.top = e;
    }

    ElementStack.prototype.pop = function(e) {
        pop(this.elements);
        this.top = this.elements[this.elements.length-1];
    }

    // Pop elements off the stack up to and including the first 
    // element with the specified (HTML) tagname
    ElementStack.prototype.popTag = function(tag) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            var e = this.elements[i];
            if (e.namespaceURI !== HTML_NAMESPACE) continue;
            if (e.localName === tag) break;
        }
        this.elements.length = i;
        this.top = this.element[i-1];
    }

    // Pop elements off the stack up to and including the first 
    // element that is an instance of the specified type
    ElementStack.prototype.popElementType = function(type) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            if (this.elements[i] instanceof type) break;
        }
        this.elements.length = i;
        this.top = this.element[i-1];
    }

    // Pop elements off the stack up to and including the element e.
    // Note that this is very different from removeElement()
    // This requires that e is on the stack.
    ElementStack.prototype.popElement = function(e) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            if (this.elements[i] === e) break;
        }
        this.elements.length = i;
        this.top = this.element[i-1];
    }

    // Remove a specific element from the stack.
    // Do nothing if the element is not on the stack
    ElementStack.prototype.removeElement(e) {
        if (this.top === e) this.pop();
        else {
            var idx = A.lastIndexOf(this.elements, e);
            if (idx !== -1)
                splice(this.elements, idx, 1);
        }
    }

    // Pop elements off the stack until (but not including) the first one
    // that is a member of the specified set
    // Use for operations like "clear to table context"
    ElementStack.prototype.popUntil = function(set) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            if (isA(this.elements[i], set)) break;
        }
        this.elements.length = i+1;
        this.top = this.elements[i];
    }

    ElementStack.prototype.clearToContext = function(type) {
        // Note that we don't loop to 0. Never pop the <html> elt off.
        for(var i = this.elements.length-1; i > 0; i--) {
            if (this.elements[i] instanceof type) break;
        }
        this.elements.length = i+1;
        this.top = this.elements[i];
    }


    ElementStack.prototype.clearToTableContext = function() {
        // Note that we don't loop to 0. Never pop the <html> elt off.
        for(var i = this.elements.length-1; i > 0; i--) {
            if (this.elements[i] instanceof HTMLTableElement) break;
        }
        this.elements.length = i+1;
        this.top = this.elements[i];
    }

    ElementStack.prototype.clearToTableBodyContext = function() {
        // Note that we don't loop to 0. Never pop the <html> elt off.
        for(var i = this.elements.length-1; i > 0; i--) {
            if (this.elements[i] instanceof HTMLTableSectionElement) break;
        }
        this.elements.length = i+1;
        this.top = this.elements[i];
    }

    ElementStack.prototype.contains = function(elt) {
        return A.lastIndexOf(this.elements, elt) !== -1;
    }

    ElementStack.prototype.getFosterParent() {
        for(var i = this.elements.length-1; i >= 0; i--) {
            if (this.elements[i] instanceof HTMLTableElement) {
                var parent = this.elements[i].parentElement;
                return parent ? parent: this.elements[i-1];
            }
        }
        return this.elements[0];
    }

    ElementStack.prototype.inSpecificScope = function(tag, set) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            var elt = this.elements[i];
            var ns = elt.namespaceURI;
            var localname = elt.localName;
            if (ns === HTML_NAMESPACE && localname === tag) return true;
            var tags = set[ns];
            if (tags && localname in tags) return false;
        }
        return false;
    }

    // Like the above, but for a specific element, not a tagname
    ElementStack.prototype.elementInSpecificScope = function(target, set) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            var elt = this.elements[i];
            if (elt === target) return true;
            var tags = set[elt.namespaceURI];
            if (tags && elt.localName in tags) return false;
        }
        return false;
    }

    // Like the above, but for an element interface, not a tagname
    ElementStack.prototype.elementTypeInSpecificScope = function(target, set) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            var elt = this.elements[i];
            if (elt instanceof target) return true;
            var tags = set[elt.namespaceURI];
            if (tags && elt.localName in tags) return false;
        }
        return false;
    }

    ElementStack.prototype.inScope = function(tag) {
        return this.inSpecificScope(tag, inScopeSet);
    }

    ElementStack.prototype.elementInScope = function(e) {
        return this.elementInSpecificScope(e, inScopeSet);
    }

    ElementStack.prototype.elementTypeInScope = function(type) {
        return this.elementTypeInSpecificScope(type, inScopeSet);
    }

    ElementStack.prototype.inButtonScope = function(tag) {
        return this.inSpecificScope(tag, inButtonScopeSet);
    }

    ElementStack.prototype.inListItemScope = function(tag) {
        return this.inSpecificScope(tag, inListItemScopeSet);
    }

    ElementStack.prototype.inTableScope = function(tag) {
        return this.inSpecificScope(tag, inTableScopeSet);
    }

    ElementStack.prototype.inSelectScope = function(tag) {
        // Can't implement this one with inSpecificScope, since it involves
        // a set defined by inverting another set. So implement manually.
        for(var i = this.elements.length-1; i >= 0; i--) {
            var elt = this.elements[i];
            if (elt.namespaceURI !== HTML_NAMESPACE) return false;
            var localname = elt.localName;
            if (localname === target) return true;
            if (localname !== "optgroup" && localname !== "option")
                return false;
        }
        return false;
    }

    ElementStack.prototype.generateImpliedEndTags = function(butnot) {
        for(var i = this.elements.length-1; i >= 0; i--) {
            var e = this.elements[i];
            if (butnot && e.localName === butnot) break;
            if (!isA(this.elements[i], impliedEndTagsSet)) break;
        }

        this.elements.length = i+1;
        this.top = this.elements[i];
    }


    var inScopeSet = {
        HTML_NAMESPACE: {
            "applet":true,
            "caption":true,
            "html":true,
            "table":true,
            "td":true,
            "th":true,
            "marquee":true,
            "object":true,
        },
        MATHML_NAMESPACE: {
            "mi":true,
            "mo":true,
            "mn":true,
            "ms":true,
            "mtext":true,
            "annotation-xml":true,
        },
        SVG_NAMESPACE: {
            "foreignObject":true,
            "desc":true,
            "title":true,
        }
    };

    var inListItemScopeSet = Object.create(inScopeSet);
    inListItemScopeSet.HTML_NAMESPACE = Object.create(inScopeSet.HTML_NAMESPACE);
    inListItemScopeSet.HTML_NAMESPACE.ol = true;
    inListItemScopeSet.HTML_NAMESPACE.ul = true;

    var inButtonScopeSet = Object.create(inScopeSet);
    inButtonScopeSet.HTML_NAMESPACE = Object.create(inScopeSet.HTML_NAMESPACE);
    inButtonScopeSet.HTML_NAMESPACE.button = true;

    var inTableScopeSet = {
        HTML_NAMESPACE: {
            "html":true,
            "table":true
        }
    };

    // The set of elements for select scope is the everything *except* these
    var invertedSelectScopeSet = {
        HTML_NAMESPACE: {
            "optgroup":true,
            "option":true
        }
    }


    return ElementStack
}());