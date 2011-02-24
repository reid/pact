/*!
 * Pact
 * Copyright 2011 Yahoo! Inc.
 * Licensed under the BSD license.
 */

var vows = require("vows");
var assert = require("assert");

var pact = require("./index");

var http = require("http");

function mockServer (cb) {
    return function () {
        pact.httpify(http.createServer(cb)).apply(this); 
    }
}

var headers = { "Content-Type" : "text/plain" };

vows.describe("Pact").addBatch({
    "A simple server" : {
        topic : mockServer(function (req, res) {
            res.writeHead(200, headers);
            res.end("ok!");
        }),
        "when / is requested" : {
            topic: pact.request(),
            "should succeed" : function (topic) {
                assert.strictEqual(topic.status, 200);
            },
            "contains correct header" : function (topic) {
                assert.include(topic.headers, "content-type");
                assert.strictEqual(topic.headers["content-type"], headers["Content-Type"]);
            },
            "contains valid data" : function (topic) {
                assert.strictEqual(topic.body, "ok!");
            }
        }
    },
    "A 302 redirecting server with a relative path" : {
        topic : mockServer(function (req, res) {
            if (req.url === "/ok") {
                res.writeHead(200, headers);
                res.end("tango");
            } else {
                res.writeHead(302, {
                    "Location" : "/ok"
                });
                res.end();
            }
        }),
        "when / is requested" : {
            topic : pact.request(),
            "should be 200 instead of 302" : function (topic) {
                assert.strictEqual(topic.status, 200);
            },
            "contains valid data" : function (topic) {
                assert.strictEqual(topic.body, "tango");
            }
        }
    }
}).export(module);
