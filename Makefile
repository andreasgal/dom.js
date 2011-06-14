FILES= \
	src/snapshot.js \
	src/globals.js \
	src/utils.js \
	src/idl.js \
	src/wrapmap.js \
	src/xmlnames.js \
	src/impl/Node.js \
	src/impl/Leaf.js \
	src/impl/CharacterData.js \
	src/impl/Text.js \
	src/impl/Comment.js \
	src/impl/ProcessingInstruction.js \
	src/impl/Element.js \
	src/impl/Attr.js \
	src/impl/Document.js \
	src/impl/DocumentFragment.js \
	src/impl/DocumentType.js \
	src/impl/DOMImplementation.js \
	src/impl/FilteredElementList.js \
	src/idl/DOMException.js \
	src/idl/EventTarget.js \
	src/idl/Node.js \
	src/idl/Element.js \
	src/idl/Attr.js \
	src/idl/Document.js \
	src/idl/DOMImplementation.js \
	src/idl/CharacterData.js \
	src/idl/Comment.js \
	src/idl/Text.js \
	src/idl/ProcessingInstruction.js \
	src/idl/DocumentType.js \
	src/idl/DocumentFragment.js \
	src/idl/NodeList.js \

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


# Close the function wrapper
	@echo '}(this));' >> $@

# Output code that monkey patches everything to test that we don't use it
#	@cat test/monkey.js >> $@

	@chmod 444 $@
	@echo "Created $@"

