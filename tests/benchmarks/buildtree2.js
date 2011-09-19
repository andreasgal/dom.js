// Build a DOM tree (based on the Firefox about:home page) in a div.
// Like buildtree.js, but doesn't create a new document each time
// just a new div element.
// I've commented out href and src attributes so gecko doesn't try to 
// fetch anything.  And I've changed the <form> element since dom.js doesn't
// support those yet.
function buildtree() {
    var d = document;
    var top = d.createElement("div");
    var e, parent = top;

    e = d.createElement("head");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("link");
    e.setAttribute("rel", "icon");
    e.setAttribute("type", "image/png");
    e.setAttribute("id", "favicon");
    parent.appendChild(e);

    e = d.createElement("link");
    e.setAttribute("rel", "stylesheet");
    e.setAttribute("type", "text/css");
    e.setAttribute("media", "all");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("body");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("div");
    e.setAttribute("id", "brandStartSpacer");
    parent.appendChild(e);

    e = d.createElement("div");
    e.setAttribute("id", "brandStart");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("img");
    e.setAttribute("id", "brandStartLogo");
    e.setAttribute("alt", "");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "searchContainer");
    parent.appendChild(e);
    parent = e;

    // XXX: should be a form element, but dom.js doesn't support them yet
    e = d.createElement("deformed");
    e.setAttribute("name", "searchForm");
    e.setAttribute("id", "searchForm");
    e.setAttribute("onsubmit", "onSearchSubmit(event)");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("div");
    e.setAttribute("id", "searchLogoContainer");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("img");
    e.setAttribute("id", "searchEngineLogo");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "searchInputContainer");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("input");
    e.setAttribute("type", "text");
    e.setAttribute("name", "q");
    e.setAttribute("value", "");
    e.setAttribute("id", "searchText");
    e.setAttribute("maxlength", "256");
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "searchButtons");
    parent.appendChild(e);
    parent = e;


    e = d.createElement("input");
    e.setAttribute("id", "searchSubmit");
    e.setAttribute("type", "submit");
    e.setAttribute("value", "&abouthome.searchEngineButton.label;");
    parent.appendChild(e);
    parent = parent.parentNode.parentNode.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "contentContainer");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("div");
    e.setAttribute("id", "snippetContainer");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("div");
    e.setAttribute("id", "defaultSnippets");
    e.setAttribute("hidden", "true");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("span");
    e.setAttribute("id", "defaultSnippet1");
    e.appendChild(d.createTextNode("&abouthome.defaultSnippet1.v1;"));
    parent.appendChild(e);

    e = d.createElement("span");
    e.setAttribute("id", "defaultSnippet2");
    e.appendChild(d.createTextNode("&abouthome.defaultSnippet2.v1;"));
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "snippets");
    parent.appendChild(e);
    parent = parent.parentNode.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "sessionRestoreContainer");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("button");
    e.setAttribute("id", "restorePreviousSession");
    e.appendChild(d.createTextNode("&historyRestoreLastSession.label;"));
    parent.appendChild(e);
    parent = parent.parentNode;

    e = d.createElement("div");
    e.setAttribute("id", "bottomSection");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("div");
    e.setAttribute("id", "aboutMozilla");
    parent.appendChild(e);
    parent = e;

    e = d.createElement("a");
    e.setAttribute("href", "http://www.mozilla.com/about/");
    e.appendChild(d.createTextNode("&abouthome.aboutMozilla;"));
    parent.appendChild(e);

    return top;
}
