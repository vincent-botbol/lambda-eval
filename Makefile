OCAMLC=ocamlc $(DEBUG)
DEBUG=-annot
JSC=js_of_ocaml $(JSDEBUG)
JSDEBUG=-pretty -noinline
OCAMLCJS=ocamlfind $(OCAMLC) -syntax camlp4o -package "js_of_ocaml,js_of_ocaml.syntax"

TARGET=lambda_display.js

%.cmo: %.ml
	$(OCAMLC) -c $<

%.cmi: %.mli
	$(OCAMLC) -c $<

%.js: %.byte
	$(JSC) $<

%.byte: %.ml
	$(OCAMLCJS) -linkpkg $< -o $@

all: $(TARGET)

lambda_display.byte: tree_layout.cmo lambda.cmo lambda_display.cmo
	$(OCAMLCJS) -linkpkg -o $@ $^

lambda_display.js: lambda_display.byte

lambda_display.cmo: lambda_display.ml
	$(OCAMLCJS) -c $<

run: lambda_display.js
	firefox index.html

clean:
	rm -f *~ \#* *.cm[iotd]* *.js *.annot *.byte

lambda.cmo : lambda.cmi
lambda.cmi :
lambda_display.cmo : tree_layout.cmo lambda.cmi
lambda_display.cmx : tree_layout.cmx lambda.cmx
tree_layout.cmo :
tree_layout.cmx :