var originalDocument = document;
var start = null;

var MUTATE_EVENTS = {
    1: "MUTATE_VALUE",
    2: "MUTATE_ATTR",
    3: "MUTATE_REMOVE_ATTR",
    4: "MUTATE_REMOVE",
    5: "MUTATE_MOVE",
    6: "MUTATE_INSERT"
}

if (window.location.search === "?domjs" || window.location.search === "?domjsdumpevents") {
    var script = document.createElement("script");
    script.setAttribute("src", "../../dom.js");
    script.setAttribute("type", "application/javascript; version=1.8");
    document.head.appendChild(script);
}

function submitted(form) {
    originalDocument.getElementById('theiframe').src = form.url.value;
    return false;
}

function cb() {
    var url = originalDocument.getElementById("theiframe").src;
    var date = new Date();
    var timer = Date.now() - start;
    var runtime = originalDocument.createTextNode(date + ' ' + url + ' ' + timer);
    var wrapper = originalDocument.createElement('div');
    wrapper.appendChild(runtime);
    originalDocument.getElementById("parsetimes").appendChild(wrapper);
}

function mutation(o) {
    var output = originalDocument.getElementById(
        'outputiframe'
    ).contentDocument.getElementById(
        "output"
    );
    // type parent index nid child
    var node = output.ownerDocument.createTextNode(
        o.nid + ' ' + MUTATE_EVENTS[o.type] + ' ' + o.parent + ' ' + JSON.stringify(o.child));
    var wrapper = output.ownerDocument.createElement("div");
    wrapper.appendChild(node);
    //console.log(output, node, o);
    try {
        output.appendChild(wrapper);
    } catch (e) {
        console.log(e);
    }
}

function loaded(foo) {    
    if (window.location.search === "?domjs") {
        originalDocument.getElementById("domjs").className = "selected";
    } else if (window.location.search === "?domjsdumpevents") {
        originalDocument.getElementById("domjsdumpevents").className = "selected";
    } else {
        originalDocument.getElementById("native").className = "selected";
    }

    var doc = "<html>" + foo.contentDocument.documentElement.innerHTML + "</html>";
    var domjsdoc = document.implementation.createDocument(null, null, null);
    if (window.location.search === "?domjsdumpevents") {
        try {
            domjsdoc.implementation.mozSetOutputMutationHandler(domjsdoc, mutation);
        } catch (e) {
            // native dom
        }
        var output = originalDocument.getElementById('outputiframe').contentDocument.body;
        while (output.firstChild) {
            output.removeChild(output.firstChild);
        }
        var wrapper = output.ownerDocument.createElement("div");
        wrapper.setAttribute("id", "output");
        output.appendChild(wrapper);
    } else {
        var out = originalDocument.getElementById('outputiframe');
        if (out) {
            originalDocument.body.removeChild(out);
        }
    }

    start = Date.now();
    parseHtmlDocument(doc, domjsdoc, cb, null);
}
