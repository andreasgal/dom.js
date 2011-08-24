
function assert(expr, msg) {
    if (!expr) {
        throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
    }
}

function assert_throws(func, exception_type, msg) {
    var raised = false;
    try {
        func();
    } catch (e) {
        raised = true;
        // todo check the type of the exception
    }
    if (!raised) throw new Error("Did not raise: ", func, + " " + (msg || "") + "\n" + new Error().stack);
}
