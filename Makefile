OCAMLC=ocamlc $(DEBUG)
DEBUG=-annot
JSC=js_of_ocaml $(JSDEBUG)
JSDEBUG=-pretty -noinline
OCAMLCJS=ocamlfind $(OCAMLC) -syntax camlp4o -package "js_of_ocaml,js_of_ocaml.syntax"

TARGET=lambda_display

%.cmo: %.ml
	$(OCAMLC) -c $<

%.cmi: %.mli
	$(OCAMLC) -c $<

%.js: %.byte
	$(JSC) $<

%.byte: %.ml
	$(OCAMLCJS) -linkpkg $< -o $@

all: lambda_display

lambda_display: tree_layout.cmo lambda.cmo lambda_display.cmo
	$(OCAMLC) graphics.cma -o $@ $^

clean:
	rm -f *~ \#* *.cm[iotd]* *.js *.annot lambda

lambda.cmo : lambda.cmi
lambda.cmi :
lambda_display.cmo : tree_layout.cmo lambda.cmi
lambda_display.cmx : tree_layout.cmx lambda.cmx
tree_layout.cmo :
tree_layout.cmx :

#ocamlfind ocamlc -syntax camlp4o -package "js_of_ocaml,js_of_ocaml.syntax" -linkpkg test_canvas.ml -o test_canvas
