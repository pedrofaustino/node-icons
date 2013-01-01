/*
 * icons
 * 
 * https://github.com/pedrofaustino/node-icons
 *
 * Copyright (c) 2012 Pedro Faustino
 * Licensed under the MIT license.
 */

if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    var log = function() {};
} else {
    var log = console.log;
}

exports.discover = function(websiteUrl, callback) {
    'use strict';

    var cheerio = require("cheerio"),
        urlmod = require("url"),
        async = require("async"),
        request = require("request"),

        isUrl = /^https?:/,
        parsedUrl = urlmod.parse(isUrl.test(websiteUrl) ? websiteUrl : "http://" + websiteUrl),
        prefix = "apple-touch-icon",
        no_effects_string = "-precomposed",
        devices = [
            {
                name: ['iPhone', 'iPod Touch', 'Android', 'BlackBerry'],
                pixels: [0, 57],
                urls: [],
                location: [] // can be 'root' or 'link' or both
            }, {
                name: 'iPad',
                pixels: [72],
                urls: [],
                location: []
            }, {
                name: 'iPhone Retina',
                pixels: [114],
                urls: [],
                location: []
            }, {
                name: 'iPad Retina',
                pixels: [144],
                urls: [],
                location: []
            }
        ],
        urls = [],
        ua = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3 like Mac OS X; de-de) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile/8F190';

    websiteUrl = parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname;
    
    function findPixels(str) {
        if (str) {
            return parseInt(str.match(/\d+/), 10);
        } else {
            return 0;
        }
    }

    function addIconUrl(url, location, sizes) {
        var pixels = null;

        log("Found icon in " + location + " with url " + url);
        
        if (location === 'root') {
            pixels = findPixels(url);
        } else {
            pixels = findPixels(sizes);
        }

        for (var i = 0; i < devices.length; i++) {
            for (var j = 0; j < devices[i].pixels.length; j++) {
                if(pixels === devices[i].pixels[j]) {
                    devices[i].urls.push(url);
                    devices[i].location.push(location);
                }
            }
        }
    }

    function parseRefresh(websiteUrl, str) {
        str = str.split('=')[1] || '';
        if (!isUrl.test(str)) {
            str = urlmod.resolve(websiteUrl, str);
        }
        return str;
    }

    function search(myurl) {
        // Search the link element in the HTML document itself
        urls.push(myurl);

        /** If no links are specified in the HTML document, the website root directory is searched
        - iOS Reference: https://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
        - BlackBerry reference: http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/Adding-WebSite-to-Home-Screen-Icon/m-p/568119
        - Android:
        http://developer.android.com/reference/android/webkit/WebChromeClient.html#onReceivedTouchIconUrl(android.webkit.WebView,%20java.lang.String,%20boolean)
        http://mathiasbynens.be/notes/touch-icons
        **/
        for (var i = 0; i < devices.length; i++) {
            for (var j = 0; j < devices[i].pixels.length; j++) {
                var pixels = devices[i].pixels[j],
                    resolution = pixels === 0 ? "" : ("-" + pixels + "x" + pixels);
                urls.push(myurl + prefix + resolution + ".png");
                urls.push(myurl + prefix + resolution + no_effects_string + ".png");
            }
        }

        async.forEach(
            urls,
            function(url, cb) {
                request({ 'uri': url, 'headers': { 'user-agent' : ua } }, function(error, response, body) {
                    if(!error && response.statusCode === 200) {
                        if(url.search(/\.png$/) !== -1) {
                            // found icon in the root dir
                            addIconUrl(url, 'root');
                        } else {
                            var $ = cheerio.load(body),
                                refresh = null,
                                links = null;

                            links = $("html").find("link[rel*='"+prefix+"'], link[rel*='"+prefix+no_effects_string+"']");
                            if (links.length > 0) {
                                links.each(function(i, lnk) {
                                    var uri = $(lnk).attr("href");
                                    if (!isUrl.test(uri)) {
                                        uri = urlmod.resolve(url, uri);
                                    }
                                    addIconUrl(uri, 'link', $(lnk).attr("sizes"));
                                });
                            }
                        }
                    }
                    
                    cb(null);
                });
            },
            function(err) {
                var urls = 0;
                
                if(!err) {
                    for (var i = 0; i < devices.length; i++) {
                        urls += devices[i].urls.length;
                    }
                    err = urls > 0 ? false : "No icon found.";
                }
                
                callback(err, devices);
        });
    }

    request({ 'uri': websiteUrl, 'headers': { 'user-agent' : ua } }, function(error, response, body) {
        var uriNext = null;
        if(!error && response.statusCode === 200) {
            if(response.headers.refresh) {
                uriNext = parseRefresh(websiteUrl, response.headers.refresh);
                log("Found HTTP 'Refresh' header with url " + uriNext);
            } else {
                var $ = cheerio.load(body);
                $('html').find("meta[http-equiv='refresh']").each(function(i, meta){
                    uriNext = parseRefresh(websiteUrl, $(meta).attr("content"));
                    log("Found meta http-equiv='refresh' with content " + uriNext);
                    return false;
                });

                if(!uriNext) {
                    // is there a <link rel="alternate" media="handheld" href="http://mobile.nytimes.com">
                    uriNext = $('link[rel="alternate"][media="handheld"]').attr('href');
                    if(uriNext) {
                        if (!isUrl.test(uriNext)) {
                            uriNext = urlmod.resolve(websiteUrl, uriNext);
                        }
                        log("Found link rel='alternate media='handheld' with href " + uriNext);
                    }
                }
            }
        }
        
        search(uriNext || websiteUrl);
    });
};
