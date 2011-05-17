MODULES = \
	dom/utils.js \
	dom/DOMException.js \
	dom/EventTarget.js \
	dom/Node.js

DOM.js: ${MODULES} LICENSE
# Output preamble
	@echo '// This file was automatically generated; DO NOT EDIT.' > $@
	@echo '/************************************************************************' >> $@
	@cat LICENSE >> $@
	@echo '************************************************************************/' >> $@

# Output function wrapper
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
	@echo 'Created DOM.js'
