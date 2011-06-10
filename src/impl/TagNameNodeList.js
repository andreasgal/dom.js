function TagNameNodeList(root, filter) {
    this.root = root;
    this.filter = filter;
    this._sid = root._sid;
    this.done = false;
    this.cache = [];
}

TagNameNodeList.prototype = {
    get length() { 
        this.checkcache();
        if (!this.done) traverse();
        return this.cache.length;
    },

    item: function(n) {
        this.checkcache();
        if (!this.done && n >= this.cache.length)
            traverse(n);
        return this.cache[n];
    },

    checkcache: function() {
        if (this._sid !== this.root._sid) {
            // subtree has changed, so invalidate cache
            this.cache.length = 0;
            this.done = false;
            this._sid = this.root._sid;
        }
    },

    // If n is specified, then traverse the tree until we've found the nth
    // item (or until we've found all items).  If n is not specified, 
    // traverse until we've found all items.
    traverse: function(n) {
        // increment n so we can compare to length, and so it is never falsy
        if (n !== undefined) n++;  

        let elt;
        while(elt = this.next()) {
            this.cache.push(elt);
            if (n && this.cache.length === n) return;
        }
        
        // no next element, so we've found everything
        this.done = true;
    },

    // Return the next element under root that matches filter
    next: function() {
        let start = (this.cache.length == 0)    // Start at the root or at
            ? this.root                         // the last element we found
            : this.cache[this.cache.length-1];

        let elt = start.nextElement(this.root);
        while(elt) {
            if (this.filter(elt)) {
                return elt;
            }

            elt = elt.nextElement(this.root);
        }
        return null;
    }
};