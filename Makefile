deploy:
	scp doc.html rburke@produce.yahoo.com:public/yui/pact.html

doc:
	dox --title Pact --desc "A collection of functions for Vows." index.js > doc.html

.PHONY: deploy doc
