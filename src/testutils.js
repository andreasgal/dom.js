
function assert(expr, msg) {
    if (!expr) {
        throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
    }
}

function assert_throws(func, exception_type, msg) {
    try {
        func();
        throw new Error("Did not raise: ", func, + " " + (msg || "") + "\n" + new Error().stack);
    } catch (e) {
        // todo check the type of the exception
    }
}
