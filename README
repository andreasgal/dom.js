The goal of this project is to evaluate whether it is feasible to implement a
WebIDL-compliant HTML5 DOM in JavaScript. While a couple other self-hosted
JavaScript DOM implementations exist, none of them are WebIDL-compliant
(i.e. properties don't live on the prototype but directly on each node, for
example). Also, all other implementations do not provide proper encapsulation.
The details of the implementation leak through the API.

The code uses ES5 strict mode, and ES6 Proxies and WeakMaps and the
'const' keyword.

The Makefile generates dom.js from many smaller files in the src/
directory. dom.js includes all of the smaller files within one large
closure so the variables and constants that appear to be global do
not, in fact, leak into the global scope.

The src/impl/ directory contains an implementation of the DOM using
plain JavaScript objects.  By itself, this is not a conforming
implementation because its internal properties are
visible. Publicly-visible objects are wrappers around this internal
implementation and we use a WeakMap to create a private mapping from
each public DOM object to its the internal implementation object.

Many more details of the architecture and code organization are below.


Installing
======

Get a copy of the dom.js source:
    git clone git://github.com/andreasgal/dom.js.git

Install node.js:
    http://nodejs.org/#download

Install spidermonkey:

    Look for a jsshell download at
        http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora/

    Or, build from source following these directions:

        https://developer.mozilla.org/En/SpiderMonkey/Build_Documentation

Building
======

1. Run "git submodule init".
2. Run "git submodule update". This clones the repos that dom.js
   depends on
3. Run "make". This assembles the dom.js, src/domcore.js, and src/htmlelts.js
   files from the other source files in the project.

Testing
======

Run 'make coverage'.  If you've got a debug build of Spidermonkey, it
will run slowly but display code coverage information. If you're using
a non-debug build, the tests will run quickly but display some error
messages about not being able to display coverage information.

Directory Structure
===================

This repo includes the following important files and directories:

LICENSE

   dom.js is open-source, licensed under the BSD license

Makefile

   Type 'make' to build dom.js from the files in src/

deps/

   Other git repos that dom.js depends on.
   In addition to these, it also requires node (for tools)
   and spidermonkey (to run standalone and to run tests)
         
deps/CoverMonkey/
        
   A code-coverage tool for SpiderMonkey.
   Required for the 'make coverage' target in the Makefile

deps/webidl.js/

   A parser for WebIDL files. This is required to convert the .idl
   files in src/idl/ (which describe public DOM APIs) into .js files
   in src/

deps/parser-lib/

   A css parser that dom.js uses to implement the HTMLElement.style 
   property.

src/

   The source code for dom.js

src/idl/

   WebIDL files that describe public DOM interfaces. The files in this
   directory are automatically converted into JavaScript code in src/

src/impl/

   An internal DOM implementation with implementation details hanging
   out everywhere.

tools/

   Programs to convert idl files to js files and to run tests.
   These tools require Node

tests/

   An incomplete set of DOM tests. The most complete set is in
   tests/newtests, and these are the ones that are run by the 'make
   coverage' target in the Makefile
   
servo/

   dom.js is part of a larger Mozilla experimental browser engine
   called Project Servo.  This directory contains code that runs
   dom.js in a Web Worker, and then uses the browser's native DOM to
   fake a layout engine for dom.js

nodeservo/

   A Node-based version of servo, using web sockets to communicate
   between dom.js running in node and a native DOM fake layout engine
   running in a browser.  Currently unstable.


Architecture
===============

What follows is an overview of the dom.js architecture, organized by
going through the source code files one at a time.

Makefile

   This file defines a list of all the source files. The default
   target assembles dom.js from a lot of separate sources.

   It is worth taking a look at what the Makefile does to create
   dom.js.  Most importantly, it wraps all the code from all the files
   inside a single function, so that none of the variables they define
   are global variables.  To export a global variable, dom.js code
   must explicitly define a property of 'global'. ('global' is the 
   argument to the containing function and its value is the global
   object, of course).

   The other trick that the Makefile does when building dom.js is to
   put almost all of the code within another big function, this one in
   strict mode.  This leaves only one file of code in non-strict mode.


src/loose.js

   This file contains any code that dom.js needs that must be in
   non-strict mode. In particular, event handlers registered with HTML
   attributes must execute with an augmented scope chain, and doing
   this correctly requires the with statement which is not allowed in
   strict mode.  So this file contains that code.

   It also contains (for now, at least) an evalScript function used by
   the HTML parser to execute scripts.  That will probably go away
   eventually. 

src/snapshot.js

   This file makes private copies of all the JavaScript primitives,
   with the goal of making dom.js immune to monkeypatching that occurs
   after dom.js has loaded.  Once we have a proper embedding, with
   dom.js running in a different excution context than <script> tags
   do, this may no longer be a goal we need to pursue.

   For now, though, if we don't want external code to be able to
   observe or intercept any of the calls that dom.js makes to built-in
   methods, all dom.js code must use the copies defined in this
   file. In particular, this means that OO style must be abandoned for
   all built-in types. If you have a string s and call its
   s.indexOf(c) method, that call can be intercepted.  Instead, you
   must always call indexOf(s,c) instead.  This can be hard to
   remember to do, and I suspect that there are parts of the codebase
   that do not do it consistently.

src/globals.js

   This file contains a number of constants. They're not really global
   variables, but are visible throughout dom.js.  The constants use
   the 'const' keyword. They include namespace URLs, and also the impl
   and idl objects that hold the internal and external constructors
   for various DOM interface types.

src/utils.js

   Various utilities including an assert() function and a nyi()
   function that just throws a "Not Yet Implemented" error for parts
   of the DOM that aren't ready yet.

   The key function to understand in this file is
   defineLazyProperty().  It takes an object o, a property name p and
   a function f and defines the property o.p with a getter
   method. When the property is first queried, the function f is
   evaluated to compute the property value, and the property is then
   converted to an ordinary data property with that value.  This is
   here because the DOM defines a lot of interfaces like
   HTMLTableRowElement that are not often used.  The global object
   must have an HTMLTableRowElement property on it, but with this
   trick we don't actually have to initialize that interface unless it
   is actually needed.  defineLazyProperty() is often used with the
   IDLInterface() function in src/idl.js

src/wrapmap.js

   As explained earlier in this README file, dom.js creates two
   separate objects for each node in the document tree. One object is
   the implementation, and it exposes many implementation details.
   The second object is the public wrapper that defines only the
   public methods and property accessors defined by the DOM and HTML
   specifications and hides all implementation details. The public
   wrappers are created lazily as needed. If you parse a file of HTML,
   dom.js will build a document tree with one implementation object
   for each node in the tree.  But it doesn't create the corresponding
   public objects until you actually access individual nodes with
   .firstChild or getElementById() or whatever.

   This file defines two key functions: wrap() and unwrap().  Wrap
   takes an implementation object as its argument and returns the
   public wrapper object.  Unwrap does the opposite: it takes a public
   object and returns its implementation object.  You'll see these two
   functions in use in files like src/domcore.js, which is
   automatically generated from src/idl/domcore.idl.  They aren't
   often used outside of the generated files, but are occasionally
   when it is necessary to wrap an implementation object before
   passing it to external code (such as when triggering an event
   handler).

   The unwrap() function relies on a WeakMap object (new in ES6) to
   maintain a mapping between public wrappers and their associated
   implemenation objects.

   The wrap() function doesn't need to use a weakmap.  If a public
   object has already been created for a given implementation object,
   it is stored in the _idl property of the implemenation object and
   wrap() just returns the value of that property.  If not, then
   wrap() looks at the _idlName property of the implementation
   object. All wrappable objects are required to have one of these,
   and it is typically defined on their prototype. The value of
   _idlName should be a string that names the public interface of the
   wrapper object. That name must be a property of the idl object
   (defined in src/globals.js), and the value of that property will be
   an object with a factory method for creating new public wrapper
   objects. (See also IDLInterface() in src/idl.js).  When a new
   public wrapper object is created, it is stored in the _idl property
   of the wrapped object, and a mapping is added to the WeakMap so
   that the public object can be unwrapped.

src/idl.js

   This file defines a number of type conversion methods that are
   required by the WebIDL spec and are used in the automatically
   generated wrapper code in files like src/domcore.js.

   This file also defines the IDLInterface constructor that is used
   (often in conjunction with defineLazyProperty()) to create public
   interface objects like Document, Element and HTMLTableElement as
   well as their prototype objects.  

   The IDLInterface() code is well-commented; read those comments to
   see how it works and find examples in src/domcore.js and the other
   generated files.  Note that IDLInterface() is used in a two step
   process, to first define the a lazy property of the 'idl' object
   (used by the wrap() method in src/wrapmap.js) and then to define
   the public interface as a lazy property of the global object.

   For IDL interfaces that have array-like or other somewhat magical
   behavior, the IDLInterface() constructor can take a reference to a
   function that returns a Proxy (new in ES6) object to handle the
   special behavior.  Several types of proxies are described in
   individual files below.

src/xmlnames.js

   This file defines two utility functions for determining whether a
   string is a valid XML name or valid XML qualified name.

src/domcore.js
src/events.js
src/htmlelts.js
src/windowobjs.js

   These four files are automatically generated from the corresponding
   src/idl/*.idl with the program tools/idl2domjs.  These files define
   the public wrapper objects defined by WebIDL interfaces.

src/AttrArrayProxy.js

   This file defines an AttrArrayProxy() factory method that returns a
   Proxy object that makes the Element.attributes object behave like
   an array.  See also AttrArray in src/impl/Element.js

src/NodeListProxy.js

   This file defines a NodeListProxy() factory function that returns a
   Proxy object that makes objects with item() methods and length
   properties behave like arrays. 

src/HTMLCollectionProxy.js

   This file defines an HTMLCollectionProxy() factory function that
   returns a Proxy object used for the HTMLCollection interface. The
   object passed in should have item() and namedItem() methods and a
   length property. The returned proxy acts like an array with added
   named properties.

src/DOMException.js

   This is an implementation of the public DOMException type plus a
   bunch of utility functions for throwing exceptions of various
   types. Unlike other interfaces, there is not a dichotomy between
   implementation object and public wrapper object for DOMException.

   This implementation is out-of-date. Both WebIDL and DOM4 have made
   changes to the way exceptions are to be implemented and dom.js has
   not yet tracked those changes.

src/impl/EventTarget.js
src/impl/Node.js
src/impl/Leaf.js
src/impl/CharacterData.js
src/impl/Text.js
src/impl/Comment.js
src/impl/ProcessingInstruction.js
src/impl/Element.js
src/impl/MutationConstants.js
src/impl/domstr.js
src/impl/Document.js
src/impl/DocumentFragment.js
src/impl/DocumentType.js
src/impl/DOMImplementation.js
src/impl/FilteredElementList.js
src/impl/Event.js
src/impl/CustomEvent.js
src/impl/UIEvent.js
src/impl/MouseEvent.js
src/impl/HTMLElement.js
src/impl/HTMLScriptElement.js
src/impl/HTMLParser.js
src/impl/CSSStyleDeclaration.js
src/impl/cssparser.js
src/impl/URL.js
src/impl/URLDecompositionAttributes.js
src/impl/Location.js
src/impl/Window.js
src/main.js
  
