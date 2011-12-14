FILES= \
	src/snapshot.js \
	src/globals.js \
	src/utils.js \
	src/wrapmap.js \
	src/xmlnames.js \
	src/idl.js \
	src/domcore.js \
	src/events.js \
	src/htmlelts.js \
	src/windowobjs.js \
	src/AttrArrayProxy.js \
	src/NodeListProxy.js \
	src/HTMLCollectionProxy.js \
	src/DOMException.js \
	src/impl/EventTarget.js \
	src/impl/Node.js \
	src/impl/Leaf.js \
	src/impl/CharacterData.js \
	src/impl/Text.js \
	src/impl/Comment.js \
	src/impl/ProcessingInstruction.js \
	src/impl/Element.js \
	src/impl/MutationConstants.js \
	src/impl/domstr.js \
	src/impl/Document.js \
	src/impl/DocumentFragment.js \
	src/impl/DocumentType.js \
	src/impl/DOMImplementation.js \
	src/impl/FilteredElementList.js \
	src/impl/Event.js \
	src/impl/CustomEvent.js \
	src/impl/UIEvent.js \
	src/impl/MouseEvent.js \
	src/impl/HTMLElement.js \
	src/impl/HTMLScriptElement.js \
	src/impl/HTMLParser.js \
	src/impl/CSSStyleDeclaration.js \
	src/impl/cssparser.js \
	src/impl/URL.js \
	src/impl/URLDecompositionAttributes.js \
	src/impl/Location.js \
	src/impl/Window.js \
	src/main.js

###  Details for jstests.py
# Need to set these environment variables:
#    JS_PATH -- The directory where the js executible is located
#    JSTESTS_PATH -- The directory where jstests.py lives
NUM_CORES=4
TEST_PAT='' #override from command line to limit the tests
DOM_TEST_DIR=tests/cmdline

all: dom.js domnode.js

dom.js: LICENSE ${FILES} src/loose.js
# Output preamble
	@rm -f $@;
	@echo '// This file was automatically generated; DO NOT EDIT.' >> $@
	@echo '/************************************************************************' >> $@
	@cat LICENSE >> $@
	@echo '************************************************************************/' >> $@

# Output the main function wrapper that holds everything
	@echo '(function(global) {' >> $@

# Output src/loose.js for any code that requires non-strict mode
	@echo '/************************************************************************' >> $@
	@echo ' * src/loose.js' >> $@
	@echo ' ************************************************************************/' >> $@
	@echo >> $@
	@echo '//@line 1 "src/loose.js"' >> $@
	@cat src/loose.js >> $@

# Output another function wrapper for the bulk of the code in strict mode
	@echo '(function(global) {' >> $@
	@echo '"use strict";' >> $@

# Append each of the module files
# Prefix each one with an //@line comment to specify the source filename
# This gives the correct filename for static compilation errors when
# run in the js shell with js -e 'options("atline")' -f dom.js
# But it messes up the line numbers for runtime errors and always reports
# the last filename in the file...
	@for f in ${FILES} ;\
	do \
		echo >> $@ ;\
		echo >> $@ ;\
		echo >> $@ ;\
		echo '/************************************************************************' >> $@;\
		echo ' * ' $$f >> $@ ;\
		echo ' ************************************************************************/' >> $@;\
		echo >> $@ ;\
		echo '//@line 1 "'$$f'"' >> $@ ;\
		cat $$f >> $@ ;\
	done

# Close the inner function wrapper
	@echo '}(global));' >> $@

# Close the outer function wrapper
	@echo '}(this));' >> $@

# Output code that monkey patches everything to test that we don't use it
#	@cat test/monkey.js >> $@

	@chmod 444 $@
	@echo "Created $@"


# The node version of dom.js
domnode.js: LICENSE ${FILES} src/loose.js
# Output preamble
	@rm -f $@;
	@echo '// This file was automatically generated; DO NOT EDIT.' >> $@
	@echo '/************************************************************************' >> $@
	@cat LICENSE >> $@
	@echo '************************************************************************/' >> $@

# Output src/loose.js for any code that requires non-strict mode
	@echo '/************************************************************************' >> $@
	@echo ' * src/loose.js' >> $@
	@echo ' ************************************************************************/' >> $@
	@echo >> $@
	@echo '//@line 1 "src/loose.js"' >> $@
	@cat src/loose.js >> $@

# Append each of the module files
# Prefix each one with an //@line comment to specify the source filename
# This gives the correct filename for static compilation errors when
# run in the js shell with js -e 'options("atline")' -f dom.js
# But it messes up the line numbers for runtime errors and always reports
# the last filename in the file...
	@for f in ${FILES} ;\
	do \
		echo >> $@ ;\
		echo >> $@ ;\
		echo >> $@ ;\
		echo '/************************************************************************' >> $@;\
		echo ' * ' $$f >> $@ ;\
		echo ' ************************************************************************/' >> $@;\
		echo >> $@ ;\
		echo '//@line 1 "'$$f'"' >> $@ ;\
		cat $$f >> $@ ;\
	done

	@chmod 444 $@
	@echo "Created $@"


# Create domcore.js from domcore.idl
src/domcore.js: src/idl/domcore.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/idl/domcore.idl > src/domcore.js
	@chmod 444 $@
	@echo "Created $@"

# Create htmlelts.js from htmlelts.idl
src/htmlelts.js: src/idl/htmlelts.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/idl/htmlelts.idl > src/htmlelts.js
	@chmod 444 $@
	@echo "Created $@"

# Create events.js from events.idl
src/events.js: src/idl/events.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/idl/events.idl > src/events.js
	@chmod 444 $@
	@echo "Created $@"

# Create windowobjs.js from windowobjs.idl
src/windowobjs.js: src/idl/windowobjs.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/idl/windowobjs.idl > src/windowobjs.js
	@chmod 444 $@
	@echo "Created $@"


# build parserlib.js in the submodule if necessary
# this step requires ant.
src/impl/cssparser.js: deps/parser-lib/src/css/*.js deps/parser-lib/src/util/*.js
	cd deps/parser-lib; ant;
	cp deps/parser-lib/build/parserlib.js src/impl/cssparser.js

# To limit the tests, specify a value for TEST_PAT from the command line.
# For instance:
#     make test-detailed TEST_PAT=DOMException
test-summary: dom.js
	${JSTESTS_PATH}/jstests.py -d -j ${NUM_CORES} -m ${DOM_TEST_DIR}/jstests.list --xul-info=none:none:true ${JS_PATH}/js ${TEST_PAT}

test-detailed: dom.js
	${JSTESTS_PATH}/jstests.py -dso -j ${NUM_CORES} -m ${DOM_TEST_DIR}/jstests.list --xul-info=none:none:true ${JS_PATH}/js ${TEST_PAT}

coverage: dom.js
	rm -f coverage.html
	tools/test_runner

nodetests: domnode.js
	@tests/nodetests test_DOMException.js
	@tests/nodetests test_attr.js
	@tests/nodetests test_basic.js
	@tests/nodetests test_collections.js
	@tests/nodetests test_createComment.js
	@tests/nodetests test_createElement.js
	@tests/nodetests test_createProcessingInstruction.js
	@tests/nodetests test_createTextNode.js
	@tests/nodetests test_document.js
	@tests/nodetests test_events.js
	@tests/nodetests test_hierarchy.js
	@tests/nodetests test_importNode.js
	@tests/nodetests test_innerHTML.js
	@tests/nodetests test_lookup.js
	@tests/nodetests test_namespaces.js
	@tests/nodetests test_reflected_attributes.js
	@tests/nodetests test_replaceChild.js
	@tests/nodetests node_test_tokenizer.js
	@tests/nodetests node_test_parser.js
	@tests/nodetests test_attributes.js

clean:
	@rm -f dom.js
	@rm -f src/domcore.js
	@rm -f src/htmlelts.js
	@rm -f src/events.js
	@rm -f src/windowobjs.js
