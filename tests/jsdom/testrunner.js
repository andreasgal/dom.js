function run(tests) {
    var t = {
        pass: 0,
        fail: 0,
        total_pass: 0,
        total_fail: 0,

        equal: function(actual, expected, msg) {
            if (actual == expected) {
                this.pass++;
            }
            else {
                this.fail++;
                print("Assertion failed: " + msg + ": expected " + expected +
                     " but got " + actual);
            }
        },

        notEqual: function(actual, expected, msg) {
            if (actual != expected) {
                this.pass++;
            }
            else {
                this.fail++;
                print("Assertion failed: " + msg);
            }
        },

        ok: function(value, msg) {
            this.equal(true, value, msg);
        },

        done: function() {
            if (this.fail > 0) {
                print("FAIL");
                fails++;
            }
            else {
                print("PASS");
                passes++;
            }
            this.reset();
        },

        reset: function() {
            this.total_pass += this.pass;
            this.total_fail += this.fail;
            this.pass = this.fail = 0;
        }

    };

    var passes = 0, fails = 0, aborts = 0;

    for(var testname in tests) {
        print("Running " + testname + "...")
        try {
            tests[testname](t);
        }
        catch(e) {
            print("Aborted: " + e.message);
            aborts++;
            t.reset();
        }
    }

    print(t.total_pass + " assertions passed ");
    print(t.total_fail + " assertions failed ");
    print(passes + " test cases passed");
    print(fails + " test cases failed");
    print(aborts + " test cases aborted");
    
}