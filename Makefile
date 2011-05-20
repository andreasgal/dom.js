# We need a version of JavaScript that supports WeakMap, Proxy, const and let.
# Build your own:
# https://developer.mozilla.org/En/SpiderMonkey/Build_Documentation
JS = /usr/local/bin/js

MODULES = \
	dom/map.js \
	dom/utils.js \
	dom/nodeimpl.js \
	dom/DOMException.js \
	dom/EventTarget.js \
	dom/Node.js \
	dom/CharacterData.js \
	dom/Comment.js \
	dom/Text.js \
	dom/ProcessingInstruction.js


dom.js: ${MODULES} LICENSE
# Output preamble
	@echo '// This file was automatically generated; DO NOT EDIT.' > $@
	@echo '/************************************************************************' >> $@
	@cat LICENSE >> $@
	@echo '************************************************************************/' >> $@

# Output function wrapper
	@echo '"use strict";' >> $@
	@echo '(function closure(global) {' >> $@

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
	@echo 'Created dom.js'
