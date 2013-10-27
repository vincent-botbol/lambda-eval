TARGET=presentation

all: $(TARGET).pdf clean

$(TARGET).pdf: $(TARGET).tex
	pdflatex $<

show: all
	evince $(TARGET).pdf

clean:
	rm -rf *.out *.snm *.log *.aux *.nav *~ *.toc