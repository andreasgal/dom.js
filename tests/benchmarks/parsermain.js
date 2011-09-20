var originalDocument = document;
var mode = document.getElementById("mode");
if (window.location.search === "?domjs") {
    var script = document.createElement("script");
    script.setAttribute("src", "../../dom.js");
    script.setAttribute("type", "application/javascript; version=1.8");
    document.head.appendChild(script);
}

function submitted(form) {
    originalDocument.getElementById('theiframe').src = form.url.value;
    return false;
}

var start = null;
function cb() {
    var runtime = originalDocument.createTextNode(Date.now() - start);
    var wrapper = originalDocument.createElement('div');
    wrapper.appendChild(runtime);
    originalDocument.getElementById("parsetimes").appendChild(wrapper);
}

function loaded(foo) {    
    if (window.location.search === "?domjs") {
        originalDocument.getElementById("domjs").className = "selected";
    } else {
        originalDocument.getElementById("native").className = "selected";
    }

    var doc = "<html>" + foo.contentDocument.documentElement.innerHTML + "</html>";
    var domjsdoc = document.implementation.createDocument(null, null, null);
    start = Date.now();
    parseHtmlDocument(doc, domjsdoc, cb, null);
}
