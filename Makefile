# We need a version of JavaScript that supports WeakMap, Proxy, const and let.
# Build your own:
# https://developer.mozilla.org/En/SpiderMonkey/Build_Documentation
JS = /usr/local/bin/js

MODULES = \
	dom/snapshot.js \
	dom/utils.js \
	dom/interface.js \
	dom/map.js \
	dom/nodeimpl.js \
	dom/DOMException.js \
	dom/EventTarget.js \
	dom/Node.js \
	dom/CharacterData.js \
	dom/Comment.js \
	dom/Text.js \
	dom/ProcessingInstruction.js


dom.js: LICENSE ${MODULES} dom/monkey.js
# Output preamble
	@echo '// This file was automatically generated; DO NOT EDIT.' > $@
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
		echo '/************************************************************************' >> $@;\
		echo ' * ' $$f >> $@ ;\
		echo ' ************************************************************************/' >> $@;\
		echo >> $@ ;\
		cat $$f >> $@ ;\
	done

# Close the function wrapper
	@echo '}(this));' >> $@

# Output code that monkey patches everything to test that we don't use it
	@cat dom/monkey.js >> $@

	@echo 'Created dom.js'
