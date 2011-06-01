// This is a modified and simplified version of:
// http://w3c-test.org/resources/testharness.js


/*
Distributed under both the W3C Test Suite License [1] and the W3C
3-clause BSD License [2]. To contribute to a W3C Test Suite, see the
policies and contribution forms [3].

[1] http://www.w3.org/Consortium/Legal/2008/04-testsuite-license
[2] http://www.w3.org/Consortium/Legal/2008/03-bsd-license
[3] http://www.w3.org/2004/10/27-testcases
*/

(function ()
{
    var debug = false;
    // default timeout is 5 seconds, test can override if needed
    var default_timeout = 5000;
    var default_test_timeout = 2000;

    /*
     * API functions
     */


    function test(func)
    {
	try {
	    window.monkey_patch_warnings = true;
	    func();
	    window.monkey_patch_warnings = false;
	    console.log("Passed");
	}
	catch(e) {
	    window.monkey_patch_warnings = false;
	    console.log("Test failed: ", e.message);
	}
    }

    expose(test, 'test');

    /*
     * Convert a value to a nice, human-readable string
     */
    function format_value(val)
    {
        if (val === null)
        {
            // typeof is object, so the switch isn't useful
            return "null";
        }
        // In JavaScript, -0 === 0 and String(-0) == "0", so we have to
        // special-case.
        if (val === -0 && 1/val === -Infinity)
        {
            return "-0";
        }
        // Special-case Node objects, since those come up a lot in my tests.  I
        // ignore namespaces.  I use duck-typing instead of instanceof, because
        // instanceof doesn't work if the node is from another window (like an
        // iframe's contentWindow):
        // http://www.w3.org/Bugs/Public/show_bug.cgi?id=12295
        if (typeof val == "object"
        && "nodeType" in val
        && "nodeName" in val
        && "nodeValue" in val
        && "childNodes" in val)
        {
            switch (val.nodeType)
            {
            case Node.ELEMENT_NODE:
                var ret = "Element node <";
                if (val.namespaceURI == "http://www.w3.org/1999/xhtml" || val.namespaceURI === null)
                {
                    ret += val.tagName.toLowerCase();
                }
                else
                {
                    ret += val.tagName;
                }
                for (var i = 0; i < val.attributes.length; i++)
                {
                    ret += " " + val.attributes[i].name + "=" + format_value(val.attributes[i].value);
                }
                ret += "> with " + val.childNodes.length + (val.childNodes.length == 1 ? " child" : " children");
                return ret;
            case Node.TEXT_NODE:
                return "Text node with data " + format_value(val.data) + " and parent " + format_value(val.parentNode);
            case Node.PROCESSING_INSTRUCTION_NODE:
                return "ProcessingInstruction node with target " + format_value(val.target) + " and data " + format_value(val.data);
            case Node.COMMENT_NODE:
                return "Comment node with data " + format_value(val.data);
            case Node.DOCUMENT_NODE:
                return "Document node with " + val.childNodes.length + (val.childNodes.length == 1 ? " child" : " children");
            case Node.DOCUMENT_TYPE_NODE:
                return "DocumentType node";
            case Node.DOCUMENT_FRAGMENT_NODE:
                return "DocumentFragment node with " + val.childNodes.length + (val.childNodes.length == 1 ? " child" : " children");
            default:
                return "Node object of unknown type";
            }
        }
        switch (typeof val)
        {
        case "string":
            for (var i = 0; i < 32; i++)
            {
                var replace = "\\";
                switch (i) {
                case 0: replace += "0"; break;
                case 1: replace += "x01"; break;
                case 2: replace += "x02"; break;
                case 3: replace += "x03"; break;
                case 4: replace += "x04"; break;
                case 5: replace += "x05"; break;
                case 6: replace += "x06"; break;
                case 7: replace += "x07"; break;
                case 8: replace += "b"; break;
                case 9: replace += "t"; break;
                case 10: replace += "n"; break;
                case 11: replace += "v"; break;
                case 12: replace += "f"; break;
                case 13: replace += "r"; break;
                case 14: replace += "x0e"; break;
                case 15: replace += "x0f"; break;
                case 16: replace += "x10"; break;
                case 17: replace += "x11"; break;
                case 18: replace += "x12"; break;
                case 19: replace += "x13"; break;
                case 20: replace += "x14"; break;
                case 21: replace += "x15"; break;
                case 22: replace += "x16"; break;
                case 23: replace += "x17"; break;
                case 24: replace += "x18"; break;
                case 25: replace += "x19"; break;
                case 26: replace += "x1a"; break;
                case 27: replace += "x1b"; break;
                case 28: replace += "x1c"; break;
                case 29: replace += "x1d"; break;
                case 30: replace += "x1e"; break;
                case 31: replace += "x1f"; break;
                }
                val = val.replace(String.fromCharCode(i), replace);
            }
            return '"' + val.replace('"', '\\"') + '"';
        case "boolean":
        case "undefined":
        case "number":
            return String(val);
        default:
            return typeof val + ' "' + val + '"';
        }
    }
//    expose(format_value, "format_value");

    /*
     * Assertions
     */

    function assert_true(actual, description)
    {
        var message = make_message("assert_true", description,
                                   "expected true got ${actual}", {actual:actual});
        assert(actual === true, message);
    };
    expose(assert_true, "assert_true");

    function assert_false(actual, description)
    {
        var message = make_message("assert_false", description,
                                   "expected false got ${actual}", {actual:actual});
        assert(actual === false, message);
    };
    expose(assert_false, "assert_false");

    function same_value(x, y) {
        if (y !== y)
        {
            //NaN case
            return x !== x;
        }
        else if (x === 0 && y === 0) {
            //Distinguish +0 and -0
            return 1/x === 1/y;
        }
        else
        {
            //typical case
            return x === y;
        }
    }

    function assert_equals(actual, expected, description)
    {
         /*
          * Test if two primitives are equal or two objects
          * are the same object
          */
        var message = make_message("assert_equals", description,
                                    "expected ${expected} but got ${actual}",
                                    {expected:expected, actual:actual});

        assert(same_value(actual, expected), message);
    };
    expose(assert_equals, "assert_equals");

    function assert_not_equals(actual, expected, description)
    {
         /*
          * Test if two primitives are unequal or two objects
          * are different objects
          */
         var message = make_message("assert_not_equals", description,
                                    "got disallowed value ${actual}",
                                    {actual:actual});

        assert(!same_value(actual, expected), message);
    };
    expose(assert_not_equals, "assert_not_equals");

    function assert_object_equals(actual, expected, description)
    {
         //This needs to be improved a great deal
         function check_equal(expected, actual, stack)
         {
             stack.push(actual);

             var p;
             for (p in actual)
             {
                 var message = make_message(
                     "assert_object_equals", description,
                     "unexpected property ${p}", {p:p});

                 assert(expected.hasOwnProperty(p), message);

                 if (typeof actual[p] === "object" && actual[p] !== null)
                 {
                     if (stack.indexOf(actual[p]) === -1)
                     {
                         check_equal(actual[p], expected[p], stack);
                     }
                 }
                 else
                 {
                     message = make_message(
                         "assert_object_equals", description,
                         "property ${p} expected ${expected} got ${actual}",
                         {p:p, expected:expected, actual:actual});

                     assert(actual[p] === expected[p], message);
                 }
             }
             for (p in expected)
             {
                 var message = make_message(
                     "assert_object_equals", description,
                     "expected property ${p} missing", {p:p});

                 assert(actual.hasOwnProperty(p), message);
             }
             stack.pop();
         }
         check_equal(actual, expected, []);
    };
    expose(assert_object_equals, "assert_object_equals");

    function assert_array_equals(actual, expected, description)
    {
        var message = make_message(
            "assert_array_equals", description,
            "lengths differ, expected ${expected} got ${actual}",
            {expected:expected.length, actual:actual.length});

        assert(actual.length === expected.length, message);

        for (var i=0; i < actual.length; i++)
        {
            message = make_message(
                "assert_array_equals", description,
                "property ${i}, property expected to be $expected but was $actual",
                {i:i, expected:expected.hasOwnProperty(i) ? "present" : "missing",
                 actual:actual.hasOwnProperty(i) ? "present" : "missing"});
            assert(actual.hasOwnProperty(i) === expected.hasOwnProperty(i), message);
            message = make_message(
                          "assert_array_equals", description,
                          "property ${i}, expected ${expected} but got ${actual}",
                          {i:i, expected:expected[i], actual:actual[i]});
            assert(expected[i] === actual[i], message);
        }
    }
    expose(assert_array_equals, "assert_array_equals");

    function assert_regexp_match(actual, expected, description) {
        /*
         * Test if a string (actual) matches a regexp (expected)
         */
        var message = make_message("assert_regexp_match", description,
                                   "expected ${expected} but got ${actual}",
                                   {expected:expected, actual:actual});
        assert(expected.test(actual), message);
    }
    expose(assert_regexp_match, "assert_regexp_match");


    function _assert_own_property(name) {
        return function(object, property_name, description)
        {
            var message = make_message(
                name, description,
                "expected property ${p} missing", {p:property_name});

            assert(object.hasOwnProperty(property_name), message);
        };
    }
    expose(_assert_own_property("assert_exists"), "assert_exists");
    expose(_assert_own_property("assert_own_property"), "assert_own_property");

    function assert_not_exists(object, property_name, description)
    {
        var message = make_message(
            "assert_not_exists", description,
            "unexpected property ${p} found", {p:property_name});

        assert(!object.hasOwnProperty(property_name), message);
    };
    expose(assert_not_exists, "assert_not_exists");

    function _assert_inherits(name) {
        return function (object, property_name, description)
        {
            var message = make_message(
                name, description,
                "property ${p} found on object expected in prototype chain",
                {p:property_name});
            assert(!object.hasOwnProperty(property_name), message);

            message = make_message(
                name, description,
                "property ${p} not found in prototype chain",
                {p:property_name});
            assert(property_name in object, message);
        };
    }
    expose(_assert_inherits("assert_inherits"), "assert_inherits");
    expose(_assert_inherits("assert_idl_attribute"), "assert_idl_attribute");

    function assert_readonly(object, property_name, description)
    {
         var initial_value = object[property_name];
         try {
             var message = make_message(
                 "assert_readonly", description,
                 "deleting property ${p} succeeded", {p:property_name});
             assert(delete object[property_name] === false, message);
             assert(object[property_name] === initial_value, message);
             //Note that this can have side effects in the case where
             //the property has PutForwards
             object[property_name] = initial_value + "a"; //XXX use some other value here?
             message = make_message("assert_readonly", description,
                                    "changing property ${p} succeeded",
                                    {p:property_name});
             assert(object[property_name] === initial_value, message);
         }
         finally
         {
             object[property_name] = initial_value;
         }
    };
    expose(assert_readonly, "assert_readonly");

    function assert_throws(code, func, description)
    {
        try
        {
            func.call(this);
            assert(false, make_message("assert_throws", description,
                                      "${func} did not throw", {func:func}));
        }
        catch(e)
        {
            if (e instanceof AssertionError) {
                throw(e);
            }
            if (typeof code === "object")
            {
                assert(typeof e == "object" && "name" in e && e.name == code.name,
                       make_message("assert_throws", description,
                           "${func} threw ${actual} (${actual_name}) expected ${expected} (${expected_name})",
                                    {func:func, actual:e, actual_name:e.name,
                                     expected:code,
                                     expected_name:code.name}));
                return;
            }
            var required_props = {};
            var expected_type;
            if (code in DOMException)
            {
                expected_type = "DOMException";
                required_props[code] = DOMException[code];
                required_props.code = DOMException[code];
                //Uncomment this when the latest version of every browser
                //actually implements the spec; otherwise it just creates
                //zillions of failures
                //required_props.name = code;
            }
            else if (code in RangeException)
            {
                expected_type = "RangeException";
                required_props[code] = RangeException[code];
                required_props.code = RangeException[code];
                //As above
                //required_props.name = code;
            }
            else
            {
                throw new AssertionError('Test bug: unrecognized code "' + code + '" passed to assert_throws()');
            }
            //We'd like to test that e instanceof the appropriate interface,
            //but we can't, because we don't know what window it was created
            //in.  It might be an instanceof the appropriate interface on some
            //unknown other window.  TODO: Work around this somehow?

            assert(typeof e == "object",
                    make_message("assert_throws", description,
                        "${func} threw ${e} with type ${type}, not an object",
                                {func:func, e:e, type:typeof e}));

            for (var prop in required_props)
            {
                assert(typeof e == "object" && prop in e && e[prop] == required_props[prop],
                        make_message("assert_throws", description,
                            "${func} threw ${e} that is not a " + expected_type + " " + code + ": property ${prop} is equal to ${actual}, expected ${expected}",
                                {func:func, e:e, prop:prop, actual:e[prop], expected:required_props[prop]}));
            }
        }
    }
    expose(assert_throws, "assert_throws");

    function assert_unreached(description) {
         var message = make_message("assert_unreached", description,
                                    "Reached unreachable code");

         assert(false, message);
    }
    expose(assert_unreached, "assert_unreached");


    /*
     * Utility funcions
     */
    function assert(expected_true, message)
    {
        if (expected_true !== true)
        {
            throw new AssertionError(message);
        }
    }

    function AssertionError(message)
    {
        this.message = message;
    }

    function make_message(function_name, description, error, substitutions)
    {
	var old_debug = window.monkey_patch_warnings;
	window.monkey_patch_warnings = false;
        for (var p in substitutions) {
            if (substitutions.hasOwnProperty(p)) {
                substitutions[p] = format_value(substitutions[p]);
            }
        }
        var node_form = substitute(["{text}", "${function_name}: ${description}" + error],
                                   merge({function_name:function_name,
                                          description:(description?description + " ":"")},
                                          substitutions));
        var rv = node_form.slice(1).join("");
	window.monkey_patch_warnings = old_debug;
	return rv;
    }


    function filter(array, callable, thisObj) {
        var rv = [];
        for (var i=0; i<array.length; i++)
        {
            if (array.hasOwnProperty(i))
            {
                var pass = callable.call(thisObj, array[i], i, array);
                if (pass) {
                    rv.push(array[i]);
                }
            }
        }
        return rv;
    }

    function map(array, callable, thisObj)
    {
        var rv = [];
        rv.length = array.length;
        for (var i=0; i<array.length; i++)
        {
            if (array.hasOwnProperty(i))
            {
                rv[i] = callable.call(thisObj, array[i], i, array);
            }
        }
        return rv;
    }

    function extend(array, items)
    {
        Array.prototype.push.apply(array, items);
    }

    function forEach (array, callback, thisObj)
    {
        for (var i=0; i<array.length; i++)
        {
            if (array.hasOwnProperty(i))
            {
                callback.call(thisObj, array[i], i, array);
            }
        }
    }


    function merge(a,b)
    {
        var rv = {};
        var p;
        for (p in a)
        {
            rv[p] = a[p];
        }
        for (p in b) {
            rv[p] = b[p];
        }
        return rv;
    }

    function expose(object, name)
    {
        var components = name.split(".");
        var target = window;
        for (var i=0; i<components.length - 1; i++)
        {
            if (!(components[i] in target))
            {
                target[components[i]] = {};
            }
            target = target[components[i]];
        }
        target[components[components.length - 1]] = object;
    }

    /*
     * Template code
     *
     * A template is just a javascript structure. An element is represented as:
     *
     * [tag_name, {attr_name:attr_value}, child1, child2]
     *
     * the children can either be strings (which act like text nodes), other templates or
     * functions (see below)
     *
     * A text node is represented as
     *
     * ["{text}", value]
     *
     * String values have a simple substitution syntax; ${foo} represents a variable foo.
     *
     * It is possible to embed logic in templates by using a function in a place where a
     * node would usually go. The function must either return part of a template or null.
     *
     * In cases where a set of nodes are required as output rather than a single node
     * with children it is possible to just use a list
     * [node1, node2, node3]
     *
     * Usage:
     *
     * render(template, substitutions) - take a template and an object mapping
     * variable names to parameters and return either a DOM node or a list of DOM nodes
     *
     * substitute(template, substitutions) - take a template and variable mapping object,
     * make the variable substitutions and return the substituted template
     *
     */

    function is_single_node(template)
    {
        return typeof template[0] === "string";
    }

    function substitute(template, substitutions)
    {
        if (typeof template === "function") {
            var replacement = template(substitutions);
            if (replacement)
            {
                var rv = substitute(replacement, substitutions);
                return rv;
            }
            else
            {
                return null;
            }
        }
        else if (is_single_node(template))
        {
            return substitute_single(template, substitutions);
        }
        else
        {
            return filter(map(template, function(x) {
                                  return substitute(x, substitutions);
                              }), function(x) {return x !== null;});
        }
    }

    function substitute_single(template, substitutions)
    {
        var substitution_re = /\${([^ }]*)}/g;

        function do_substitution(input) {
            var components = input.split(substitution_re);
            var rv = [];
            for (var i=0; i<components.length; i+=2)
            {
                rv.push(components[i]);
                if (components[i+1])
                {
                    rv.push(String(substitutions[components[i+1]]));
                }
            }
            return rv;
        }

        var rv = [];
        rv.push(do_substitution(String(template[0])).join(""));

        if (template[0] === "{text}") {
            substitute_children(template.slice(1), rv);
        } else {
            substitute_attrs(template[1], rv);
            substitute_children(template.slice(2), rv);
        }

        function substitute_attrs(attrs, rv)
        {
            rv[1] = {};
            for (var name in template[1])
            {
                if (attrs.hasOwnProperty(name))
                {
                    var new_name = do_substitution(name).join("");
                    var new_value = do_substitution(attrs[name]).join("");
                    rv[1][new_name] = new_value;
                };
            }
        }

        function substitute_children(children, rv)
        {
            for (var i=0; i<children.length; i++)
            {
                if (children[i] instanceof Object) {
                    var replacement = substitute(children[i], substitutions);
                    if (replacement !== null)
                    {
                        if (is_single_node(replacement))
                        {
                            rv.push(replacement);
                        }
                        else
                        {
                            extend(rv, replacement);
                        }
                    }
                }
                else
                {
                    extend(rv, do_substitution(String(children[i])));
                }
            }
            return rv;
        }

        return rv;
    }

})();
// vim: set expandtab shiftwidth=4 tabstop=4:
