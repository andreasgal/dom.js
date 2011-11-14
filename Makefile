FILES= \
	src/snapshot.js \
	src/globals.js \
	src/utils.js \
	src/wrapmap.js \
	src/xmlnames.js \
	src/idl.js \
	src/domcore.js \
	src/htmlelts.js \
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
	src/impl/HTMLElement.js \
	src/impl/HTMLScriptElement.js \
	src/impl/HTMLParser.js \
	src/main.js

###  Details for jstests.py
# Need to set these environment variables:
#    JS_PATH -- The directory where the js executible is located
#    JSTESTS_PATH -- The directory where jstests.py lives
NUM_CORES=4
TEST_PAT='' #override from command line to limit the tests
DOM_TEST_DIR=tests/cmdline


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


src/domcore.js: src/domcore.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/domcore.idl > src/domcore.js
	@chmod 444 $@
	@echo "Created $@"

src/htmlelts.js: src/htmlelts.idl tools/idl2domjs
	@rm -f $@;
	tools/idl2domjs src/htmlelts.idl > src/htmlelts.js
	@chmod 444 $@
	@echo "Created $@"


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

clean:
	@rm -f dom.js
	@rm -f src/domcore.js
	@rm -f src/htmlelts.js
