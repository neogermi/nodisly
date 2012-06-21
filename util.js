//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
/**************** UTILITIES / HELPER ****************/
Nodisly.Util = {};

Nodisly.Util.getUuid = function (length) {
    var vals = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    vals = vals.split("");
    length = (length)? length : 5;
                
    for (var l = 0, uuid = ""; l < length; l++) {
        uuid += vals[Math.floor(Math.random() * 100) % vals.length];
    }
    
    return uuid; 
};

Nodisly.Util.apacheLog = function (host, date, verb, url, status, content, referer, useragent) {
    content = (content) ? JSON.stringify(content) :  "";
    console.log(host + " -" + " - [" + Nodisly.Util.toDateString(date) + "] - \" " + verb + " " + url + " " + "HTTP/1.1\"" + " " + status + " " + content.length + " " + referer + " " + "\"" + useragent + "\"");
};

Nodisly.Util.toDateString = function (d) {
    d = (d)? d : new Date();
    
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Oct", "Nov", "Dec"];
    
    var offset = d.getHours() - d.getUTCHours();
    var offsetStr = (offset < 0)? "-" : "+";
    offsetStr += (offset < 10)? "0" : "";
    offsetStr += (offset - (offset % 1));
    offsetStr += (offset % 1 === 0)? "00" : ((offset % 1) * 60);

    var hours = (d.getHours() < 10)? ("0" + d.getHours()) : d.getHours();
    var mins = (d.getMinutes() < 10)? ("0" + d.getMinutes()) : d.getMinutes();
    var secs = (d.getSeconds() < 10)? ("0" + d.getSeconds()) : d.getSeconds();
    
    return d.getDate() + "/" + months[d.getMonth()-1] + "/" + d.getFullYear() + ":" + hours + ":" + mins + ":" + secs + " " + offsetStr;     
};

// PURGE DB: redis-cli KEYS "nodisly:*" | xargs redis-cli -n 100 DEL
// PURGE DB: redis-cli KEYS "nodisly:free_uuids*" | xargs redis-cli -n 100 DEL
// PURGE DB: redis-cli KEYS "nodisly:taken_uuids*" | xargs redis-cli -n 100 DEL
// FILL-UP: for i in {1..1000000}; do key=`cat /dev/urandom | tr -cd "$CHAR" | head -c ${1:-6}` && redis-cli LPUSH "nodisly:free_uuids" $key;

/**************** UTILITIES / HELPER ****************/