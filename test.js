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
                assert.strictEqual(topic.body, "ok!");
            }
        }
    }
}).export(module);
