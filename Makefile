# We need a version of JavaScript that supports WeakMap, Proxy, const and let.
# Build your own:
# https://developer.mozilla.org/En/SpiderMonkey/Build_Documentation
JS = /usr/local/bin/js

MODULES = \
	src/snapshot.js \
	src/utils.js \
	src/interface.js \
	src/wrapmap.js \
	src/Tree.js \
	src/DOMException.js \
	src/EventTarget.js \
	src/Node.js \
	src/Element.js \
	src/Attr.js \
	src/Document.js \
	src/DOMImplementation.js \
	src/CharacterData.js \
	src/Comment.js \
	src/Text.js \
	src/ProcessingInstruction.js \
	src/NodeList.js \
	src/boot.js \
	src/peek.js

dom.js: LICENSE ${MODULES} test/monkey.js
# Output preamble
	@rm -f $@;
	@echo '// This file was automatically generated; DO NOT EDIT.' >> $@
	@echo '/************************************************************************' >> $@
	@cat LICENSE >> $@
	@echo '************************************************************************/' >> $@

# Output function wrapper
	@echo '(function closure(global) {' >> $@
	@echo '"use strict";' >> $@

# Append each of the module files
	@for f in ${MODULES} ;\
	do \
		echo >> $@ ;\
		echo >> $@ ;\
		echo >> $@ ;\
		echo '/************************************************************************' >> $@;\
		echo ' * ' $$f >> $@ ;\
		echo ' ************************************************************************/' >> $@;\
		echo >> $@ ;\
		cat $$f >> $@ ;\
	done

# Close the function wrapper
	@echo '}(this));' >> $@

# Output code that monkey patches everything to test that we don't use it
#	@cat test/monkey.js >> $@

	@chmod 444 $@
	@echo "Created $@"
