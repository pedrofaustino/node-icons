'use strict';

var icons = require('../lib/icons.js'),
    express = require('express'),
    app = express(),
    fs = require('fs');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

app.get('/link', function(req, res){
    var str = '<html><head>'+
        '<link rel="apple-touch-icon-precomposed" sizes="57x57" href="apple-touch-icon-114.png" />' +
        '</head><body></body></html>';
    res.writeHead(200, {
        'content-type': 'text/html'
    });
    res.write(str, 'utf8');
    res.end();
});
app.listen(6767);

exports['discover'] = {
    setUp: function(done) {
        // setup here
        done();
    },
    'apple-touch-icon on markup': function(test) {
        test.expect(1);
        // tests here
        icons.discover("http://localhost:6767/link", function(err, devices) {
            var icons = 0;
            for (var i = 0; i < devices.length; i++) {
                for (var j = 0; j < devices[i].urls.length; j++) {
                    icons++;
                }
            }
            test.equal(icons, 1, 'should have discovered 1 icon.');
            test.done();
        });
    }
};
