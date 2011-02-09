# Pact

A collection of [Vows](http://vowsjs.org) macros for easy HTTP server testing.

Tastes great with [Express](http://expressjs.com) and [Connect](http://senchalabs.github.com/connect/).

Works with [Node.js](http://nodejs.org/) v0.2.5 and later.

## Documentation

<http://reid.github.com/pact/>

## Installation

    npm i pact

## Example

    // Pact works with http.Server instances.
    // This includes express.Server, connect.Server, etc.
    // This method returns a new express.Server:
    var createServer = require("../lib/app").createServer;

    require("vows").describe("HTTP Server").addBatch({
        "A server in development" : {
            // Start a server for testing with httpify
            // Give it a new http.Server
            topic : httpify(createServer()),
            "when /foo is requested" : {
                topic : request(), // knows the URL from context name
                "should fail" : code(400) // check status code
            }
            "when /foo?bar=baz is requested" : {
                topic : request(),
                "should succeed" : code(200),
                "should return response time header" : function (topic) {
                    // header names are lowercased for easy testing
                    assert.include(topic.headers, "x-response-time");
                },
                "should be correct size" : function (topic) {
                    // response is available as topic.body
                    assert.equal(topic.body.length, 11);
                }
            },
            "when making a bogus request" : {
                // you can always specify your own URL
                // POST requests work as well
                topic : request({
                    url : "/bogus",
                    method : "POST",
                    body : "quux=0"
                }),
                "should fail" : code(404)
            }
        },
        "A server in production" : {
            topic : function () {
                // Example: wrap httpify for testing
                // with a new environment
                var oldEnv = process.env.NODE_ENV;
                process.env.NODE_ENV = "production";
                var server = app.createServer();
                httpify(server).apply(this);
                process.env.NODE_ENV = oldEnv;
            },
            "when / is requested" : {
                topic : request(),
                "should fail" : code(404)
            }
        }
    }).export(module);

## About

Authored by [Reid Burke](http://github.com/reid), copyright Yahoo! Inc., and provided under the BSD license. See LICENSE file.

## History

Pact is used at Yahoo! for testing Node.js servers. It's based on the embedded Vows macros from the YUI Labs [Yeti](http://github.com/yui/yeti) project.

## Bugs

Submit bugs and pull requests to [Pact on GitHub](http://github.com/reid/pact).
