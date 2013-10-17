OCAMLC=ocamlc $(DEBUG)
DEBUG=-annot
JSC=js_of_ocaml $(JSDEBUG)
JSDEBUG=-pretty -noinline
OCAMLCJS=ocamlfind $(OCAMLC) -syntax camlp4o -package "js_of_ocaml,js_of_ocaml.syntax"

%.cmo: %.ml
	$(OCAMLC) -c $<

%.cmi: %.mli
	$(OCAMLC) -c $<

%.js: %.byte
	$(JSC) $<

%.byte: %.ml
	$(OCAMLCJS) -linkpkg $< -o $@

all: lambda test_canvas.js

lambda: lambda.cmo
	$(OCAMLC) -o $@ $<

clean:
	rm -f *~ \#* *.cm[iotd]* *.js *.annot lambda

lambda.cmo : lambda.cmi
lambda.cmi :


#ocamlfind ocamlc -syntax camlp4o -package "js_of_ocaml,js_of_ocaml.syntax" -linkpkg test_canvas.ml -o test_canvas
