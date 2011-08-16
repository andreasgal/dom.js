

var raised_exception = false;

try {
    assert(0, "Hello");
} catch (e) {
    raised_exception = true;
}

assert(raised_exception, "assert did not raise an exception.");