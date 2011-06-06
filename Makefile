# We need a version of JavaScript that supports WeakMap, Proxy, const and let.
# Build your own:
# https://developer.mozilla.org/En/SpiderMonkey/Build_Documentation
JS = /usr/local/bin/js

FILES= \
	src/snapshot.js \
	src/utils.js \
	src/interface.js \
	src/wrapmap.js \
	src/dom/node.js \
	src/dom/leaf.js \
	src/dom/text.js \
	src/dom/comment.js \
	src/dom/processinginstruction.js \
	src/dom/element.js \
	src/dom/attr.js \
	src/dom/document.js \
	src/dom/documentfragment.js \
	src/dom/documenttype.js \
	src/dom/domimplementation.js \
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
	src/boot.js

#	src/peek.js

dom.js: LICENSE ${FILES} test/monkey.js
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
	@for f in ${FILES} ;\
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

