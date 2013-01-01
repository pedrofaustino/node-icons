# Icons - Find the URLs of a web app's icons

## Install
`npm install icons`

## Simple to use
Icons is designed to find the URLs of a web app's icons.


Current version is able to discover following icons:

* [Apple's apple-touch-icons](https://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

It supports redirection by the Refresh HTTP Header or its markup equivalent, the latter being used at the time of writing by [Twitter](http://twitter.com). It also supports redirection to the URL provided by the HTML link element with `@rel="alternate"` and `@media="handheld"`, being used at the time of writing by [NYTimes](http://nytimes.com).


```javascript
var icons = require('icons');
icons.discover("https://github.com", function(err, icons) {
    console.log(err ? ("ERROR " + err) : icons);
});
```

prints

```javascript
[{
    name: ['iPhone', 'iPod Touch', 'Android', 'BlackBerry'],
    pixels: [0, 57],
    urls: ['http://www.github.com/apple-touch-icon-114.png'],
    location: ['link']
}, {
    name: 'iPad',
    pixels: [72],
    urls: ['http://www.github.com/apple-touch-icon-144.png'],
    location: ['link']
}, {
    name: 'iPhone Retina',
    pixels: [114],
    urls: ['http://www.github.com/apple-touch-icon-114.png'],
    location: ['link']
}, {
    name: 'iPad Retina',
    pixels: [144],
    urls: ['http://www.github.com/apple-touch-icon-144.png'],
    location: ['link']
}]
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## License
Copyright (c) 2012 Pedro Faustino  
Licensed under the MIT license.
