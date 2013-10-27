TARGET=presentation

all: $(TARGET).pdf

$(TARGET).pdf: $(TARGET).tex
	pdflatex $<

show: all
	evince $(TARGET).pdf

clean:
	rm -rf *.out *.snm *.log *.aux *.nav *~ *.toc