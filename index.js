/*!
 * Pact
 * Copyright 2011 Yahoo! Inc.
 * Licensed under the BSD license.
 */

/**
 * Dependencies.
 */
var assert = require('assert');

var http = require('./lib/http');
var STATUS_CODES = require('http').STATUS_CODES;

/**
 * A starting server port number.
 */
var _port = 19100;

/**
 * Factory for server port numbers.
 *
 * @return {Number} port A new port number.
 */
function getPort() {
    return ++_port;
}

/**
 * Return a function that makes an HTTP request
 * according to what's specified in the provided `req`
 * object.
 *
 * Relative 302 redirects will be followed.
 *
 * You can specify:
 *
 * - url: The path to request. Defaults to a path as the second word of
 *   a context.
 * - method: Defaults to GET.
 * - data: Request body for POST.
 * - headers: HTTP request headers object.
 *
 * These are all optional.
 *
 * Instead of specifying `url` in `req`, you can make it the second word of
 * your context. This lets you omit `req` completely, for example:
 *
 *     "when /foo/bar/baz is requested" : {
 *          topic : request(),
 *          "should succeed" : code(200)
 *     }
 *
 * Your test functions will recieve an object containing:
 *
 *  - body: The response body, which is an object if the response was
 *    application/json.
 *  - status: HTTP status code.
 *  - headers: HTTP headers as an object, with headers in lowercase.
 *
 * A topic function.
 *
 * For an example test function, {@see code}.
 *
 * @param {Object} req Request object.
 * @return {Function} Topic function that makes the request.
 */
function request(req) {
    var path, options = {
        host: 'localhost',
        method: 'GET'
    };
    if (req) {
        if ('url' in req) path = options.path = req.url;
        if ('data' in req) options.body = req.data;
        if ('method' in req) options.method = req.method;
        if ('headers' in req) options.headers = req.headers;
    }
    return function(lastTopic) {
        var vow = this;
        // try to find port number
        var port = Array.prototype.slice.call(arguments, -1)[0];
        if (!isNaN(port))
            options.port = port;
        else throw new Error('Unable to determine port from topic.');
        if ('function' === typeof path)
            options.path = path(lastTopic);
        else if (!path)
            options.path = vow.context.name.split(/ +/)[1];
        http.request(
            options
        ).on('response', function X(res, results) {
            var err = null;
            if (res.statusCode === 302) { // handle redirects
                if (options._302) {
                    err = 'Redirect loop';
                } else {
                    var location = res.headers.location;
                    if (location.indexOf('/') === 0) {
                        // relative path, don't handle absolute
                        options.path = location;
                        options._302 = true;
                        return http.request(options).on('response', X);
                    }
                }
            }
            vow.callback(err, {
                body: results,
                status: res.statusCode,
                headers: res.headers
            });
        });
    }
}

/**
 * Return a function that starts a `http.Server` listening on 127.0.0.1.
 *
 * Your test functions will recieve the port the server is listening on.
 *
 * A topic function.
 *
 * @param {Object} server `http.Server` instance.
 * @param {Number} port Optional. Port to listen on.
 * @return {Function} Topic function that starts the server.
 */
function httpify(server, port) {
    port = port || getPort();
    return function() {
        var vows = this;
        server.listen(port, '127.0.0.1', function(err) {
            vows.callback(err, port);
        });
    };
}

/**
 * Return a function that asserts that `status` matches httpify's status.
 *
 * A test function.
 *
 * @see httpify
 * @param {Number} status Expected HTTP status code.
 * @return {Function} Test function that checks the status.
 */
function code(status) {
    return function(lastTopic) {
        assert.strictEqual(lastTopic.status, status,
            'Expected ' + status +
                  ' ' + STATUS_CODES[status] +
                  ', received: ' + lastTopic.status +
                  ' ' + STATUS_CODES[lastTopic.status] +
                  '.\n' + lastTopic.body
        );
    };
}

/**
 * Export these functions.
 */
module.exports = {
    code: code,
    request: request,
    httpify: httpify
};
