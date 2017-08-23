

var cache = require('./cache');
var config = require('./config.json');
var fs = require("fs");
var page = require('webpage').create();

page.onConsoleMessage = function (msg) { console.log(msg); };


cache.cachePath = config.cachePath;

/*
// Can be enabled for debugging
//
page.onResourceError = function(resourceError) {
    console.error(resourceError.url + ': ' + resourceError.errorString);
};
page.onResourceRequested = function (request) {
    console.error('= onResourceRequested()');
    console.error('  request: ' + JSON.stringify(request, undefined, 4));
};
page.onLoadStarted = function() {
    console.error('= onLoadStarted()');
    var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
    console.error('  leaving url: ' + currentUrl);
};
page.onNavigationRequested = function(url, type, willNavigate, main) {
    console.error('= onNavigationRequested');
    console.error('  destination_url: ' + url);
    console.error('  type (cause): ' + type);
    console.error('  will navigate: ' + willNavigate);
    console.error('  from page\'s main frame: ' + main);
};

page.onResourceError = function(resourceError) {
    console.error('= onResourceError()');
    console.error('  - unable to load url: "' + resourceError.url + '"');
    console.error('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};

page.onError = function(msg, trace) {
    console.error('= onError()');
    var msgStack = ['  ERROR: ' + msg];
    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};
*/
page.onResourceReceived = function(response) {
    // console.error('= onResourceReceived()' );
    // console.error('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
    if (response.contentType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=Unicode") {
        cache.includeResource(response);
        // console.log("Gotcha: " + response.url);
    }
};

page.onLoadFinished = function(status) {
    // console.error('= onLoadFinished()');
    // console.error('  status: ' + status);
    for(index in cache.cachedResources) {
        var file = cache.cachedResources[index].cacheFileNoPath;
        console.log("Cache: " + file);
        var finalFile = "hafslund.xlsx";
        console.log("Saving to " + finalFile);
        fs.write(finalFile,cache.cachedResources[index].getContents(),'b');
    }
};

page.open(config.baseUrl, function(status) {
    // console.log("Status: " + status);
    if(status === "success") {
        page.evaluate(function(config) {
            if (typeof window.click !== "function") {
                window.click = function(el){
                    var ev = document.createEvent('MouseEvent');
                    ev.initMouseEvent(
                        'click',
                        true /* bubble */, true /* cancelable */,
                        window, null,
                        0, 0, 0, 0, /* coordinates */
                        false, false, false, false, /* modifier keys */
                        0 /*left*/, null
                    );
                    el.dispatchEvent(ev);
                }
            }
            var obj = document.querySelector('#login');
            click(obj);

            document.querySelector("#UserName").value = config.username;
            document.querySelector("#Password").value = config.password;
            var obj = document.querySelector('#LoginButton');
            click(obj);
            console.log("Login submitted!");
        }, config);

        // Waiting 5 seconds to login complete
        window.setTimeout(function () {
            page.evaluate(function() {
                if (typeof window.click !== "function") {
                    window.click = function(el){
                        var ev = document.createEvent('MouseEvent');
                        ev.initMouseEvent(
                            'click',
                            true /* bubble */, true /* cancelable */,
                            window, null,
                            0, 0, 0, 0, /* coordinates */
                            false, false, false, false, /* modifier keys */
                            0 /*left*/, null
                        );
                        el.dispatchEvent(ev);
                    }
                }
                // Trying to find the link for "Forbruk"
                var aTags = document.getElementsByTagName("a");
                var searchText = "Forbruk";
                var forbrukLink;

                for (var i = 0; i < aTags.length; i++) {
                    if (aTags[i].textContent == searchText) {
                        click(aTags[i]);
                        break;
                    }
                }
            });
        }, 5000);

        // Waiting 10 seconds to the "Forbruk-page" to load
        window.setTimeout(function () {
            page.evaluate(function() {
                console.log("Getting xlsx");
                if (typeof window.click !== "function") {
                    window.click = function(el){
                        var ev = document.createEvent('MouseEvent');
                        ev.initMouseEvent(
                            'click',
                            true /* bubble */, true /* cancelable */,
                            window, null,
                            0, 0, 0, 0, /* coordinates */
                            false, false, false, false, /* modifier keys */
                            0 /*left*/, null
                        );
                        el.dispatchEvent(ev);
                    }
                }
                var obj = document.querySelector('#amsconsumption_to_excel');
                // console.log("Clicking on download-link " + obj);
                click(obj);
            })
        }, 10000);

    }
    // Waiting 15 seconds before exiting the script
    window.setTimeout(function () {
        console.log("All done");
        phantom.exit();
    }, 15000);
});
