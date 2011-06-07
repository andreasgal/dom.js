FILES= \
	src/snapshot.js \
	src/globals.js \
	src/utils.js \
	src/interface.js \
	src/wrapmap.js \
	src/xmlnames.js \
	src/impl/Node.js \
	src/impl/Leaf.js \
	src/impl/Text.js \
	src/impl/Comment.js \
	src/impl/ProcessingInstruction.js \
	src/impl/Element.js \
	src/impl/Attr.js \
	src/impl/Document.js \
	src/impl/DocumentFragment.js \
	src/impl/DocumentType.js \
	src/impl/DOMImplementation.js \
	src/wrapper/DOMException.js \
	src/wrapper/EventTarget.js \
	src/wrapper/Node.js \
	src/wrapper/Element.js \
	src/wrapper/Attr.js \
	src/wrapper/Document.js \
	src/wrapper/DOMImplementation.js \
	src/wrapper/CharacterData.js \
	src/wrapper/Comment.js \
	src/wrapper/Text.js \
	src/wrapper/ProcessingInstruction.js \
	src/wrapper/DocumentType.js \
	src/wrapper/DocumentFragment.js \
	src/wrapper/NodeList.js \

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

