test:
	npm test

deploy:
	scp index.html rburke@produce.yahoo.com:public/yui/pact.html

lint:
	gjslint *.js

doc:
	dox --title Pact --desc \
		"[Vows](http://vowsjs.org) macros for testing HTTP servers." \
		--ribbon "http://github.com/reid/pact" \
		index.js > index.html

.PHONY: test deploy lint doc
