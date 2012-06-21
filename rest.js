//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
/**************** SERVER SETUP ****************/
Nodisly.REST = {};
Nodisly.REST.app = Nodisly.express.createServer();

Nodisly.REST.app.configure(function(){
    Nodisly.REST.app.use(Nodisly.express.methodOverride());
    Nodisly.REST.app.use(Nodisly.express.bodyParser());
});
/**************** SERVER SETUP ****************/

/**************** REST INTERFACE ****************/

Nodisly.REST.app.post(/^\/$/, function(req, res, next) {
    var host = req.header('host');
    var referer = req.header('referrer');
    referer = (referer)? ("\"" + referer + "\"") : "-";
    var useragent = req.headers['user-agent'];
    Nodisly.Database.createSurl(req.body, function (surl) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(surl);
        Nodisly.Util.apacheLog(host, new Date(), "POST", req.url, 200, surl, referer, useragent);
    }, function (msg) {
        res.send(msg, 404);
        Nodisly.Util.apacheLog(host, new Date(), "POST", req.url, 404, undefined, referer, useragent);
    });
});

Nodisly.REST.app.get(/^\/?$/, function(req, res, next) {
    Nodisly.fs.readFile("index.html", function(err,data) {
        if (err) {
            console.log("not found!");
            res.send(err, 404);
        } else {
            res.send(data.toString());
        }
    });
});

Nodisly.REST.app.get(/^\/(\w{5,})\/stats$/, function(req, res, next) {
    var host = req.header('host');
    var referer = req.header('referrer');
    referer = (referer)? ("\"" + referer + "\"") : "-";
    var useragent = req.headers['user-agent'];
    //TODO
    Nodisly.Util.apacheLog(host, new Date(), "GET", req.url, 404, surl, referer, useragent);
    res.send(msg, 404);
});

Nodisly.REST.app.get(/^\/(\w{3,}?)\/?$/, function(req, res, next) {
    var host = req.header('host');
    var referer = req.header('referrer');
    referer = (referer)? ("\"" + referer + "\"") : "-";
    var useragent = req.headers['user-agent'];
    Nodisly.Database.getSurl(req.params[0], function (surl) {
        if (req.accepts('text/html')) {
            res.header("Location", surl.url);
            res.send(surl.url, 301);
            Nodisly.Util.apacheLog(host, new Date(), "GET", req.url, 301, surl.url, referer, useragent);
        } else if (req.accepts('application/json')) {
            res.header('Access-Control-Allow-Origin', '*');
            res.json(surl);
            Nodisly.Util.apacheLog(host, new Date(), "GET", req.url, 200, surl, referer, useragent);
        }
    }, function (msg) {
        res.send(msg, 404);
        Nodisly.Util.apacheLog(host, new Date(), "GET", req.url, 404, surl, referer, useragent);
    });
});
/**************** REST INTERFACE ****************/