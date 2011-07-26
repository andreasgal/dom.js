// dom.js and domstr.js and MutationConstants.js have been loaded.
// Hook up a mutation listener that will render the nodes in the
// dom.js document tree into a sibling iframe

var render_frame = parent.renderer;
var rdoc = render_frame.content_document;
var nodes = {}; // Maps nids to nodes

document.implementation.mozSetOutputMutationHandler(document, mutation_handler);

function mutation_handler(o) {
    switch(o.type) {
    case MUTATE_VALUE:
    case MUTATE_ATTR:
    case MUTATE_REMOVE_ATTR:
    case MUTATE_REMOMVE:
    case MUTATE_MOVE:
    case MUTATE_INSERT:
    }
}