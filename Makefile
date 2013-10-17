OCAMLC=ocamlc #$(DEBUG)
DEBUG=-annot

%.cmo: %.ml
	$(OCAMLC) -c $<

%.cmi: %.mli
	$(OCAMLC) -c $<

all: lambda

lambda: lambda.cmo
	$(OCAMLC) -o $@ $<

clean:
	rm -f *~ \#* *.cm[iotd]* *.js *.annot lambda

lambda.cmo : lambda.cmi
lambda.cmi :
