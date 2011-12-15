
function assert(expr, msg) {
    if (!expr) {
        throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
    }
}

function assertThrows(func, type, msg) {
    try {
        func();
    } catch (e) {
        if (type) {
            if ((typeof type === "string" && e.name !== type) ||
                (typeof type === "number" && e.code != type))
                throw Error("Threw exception of wrong type. Expected: " + type +
                            " Got: " + e + " At: " + e.stack);
        }
        return;  // Assertion was successful
    }
    throw Error("Did not raise: " + (msg || "") + "\n" + new Error().stack);
}

function notYetImplemented(func) {
    var raised = false;
    try {
        func();
    } catch (e) {
        if (e.message.match(/^Not Yet Implemented.*/)) {
            raised = true;
        }
    }
    if (!raised) throw new Error(
        "Expected Not Yet Implemented\n" + new Error().stack);
}
