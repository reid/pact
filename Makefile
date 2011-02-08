deploy:
	scp index.html rburke@produce.yahoo.com:public/yui/pact.html

doc:
	dox --title Pact --desc \
		"[Vows](http://vowsjs.org) macros for testing HTTP servers." \
		--ribbon "http://github.com/reid/pact" \
		index.js > index.html

.PHONY: deploy doc
