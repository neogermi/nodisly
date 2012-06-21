//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
Nodisly.Database = {};

/**************** DB SETUP ****************/
Nodisly.Database.rclient = Nodisly.redis.createClient();
Nodisly.Database.rclient.on("error", function (err) {
    console.log("Error " + err);
});
/**************** DB SETUP ****************/

/**************** DB ACCESS ****************/
Nodisly.Database.createSurl = function (body, success, error) {

    if (Nodisly.Util.isValidId(body.id)) {
        Nodisly.Database.rclient.get(Nodisly.Config.R_PRFX + "uuid:" + body.id, function(err, reply) {
            if (reply === null) {
                Nodisly.Database.rclient.srem(Nodisly.Config.FREE_IDS_FIELD, body.id, function (err) {
                    Nodisly.Database.rclient.sadd(Nodisly.Config.TAKEN_IDS_FIELD, body.id);
                    Nodisly.Database.rclient.hmset( Nodisly.Config.R_PRFX + "uuid:" + body.id, "url", body.url, "uuid", body.id);
                    Nodisly.Database.rclient.sadd(  Nodisly.Config.R_PRFX + "url:"  + body.url,  body.id);
                    Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "uuid:" + body.id, Nodisly.Config.ONE_YEAR); // expires after one year!
                    Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "url:"  + body.url,  Nodisly.Config.ONE_YEAR); // expires after one year!
                    success({"url" : body.url, "surl" : Nodisly.Config.BASE_URL + ((Nodisly.Config.BASE_URL.substr(-1) === "/")? "" : "/") + body.id, "id" : body.id});
                });
            } else {
                delete body["id"];
                return Nodisly.Database.createSurl(body, success, error);
            }
        });
    } else {
        Nodisly.Database.rclient.smembers(Nodisly.Config.R_PRFX + "url:" + body.url, function(err, reply) {
            if (reply === null) {
                // we do not know this URL!
                Nodisly.Database.rclient.spop(Nodisly.Config.FREE_IDS_FIELD, function (err, uuid) {
                    Nodisly.Database.rclient.sadd(Nodisly.Config.TAKEN_IDS_FIELD, uuid);
                    Nodisly.Database.rclient.hmset( Nodisly.Config.R_PRFX + "uuid:" + uuid, "url", body.url, "uuid", uuid);
                    Nodisly.Database.rclient.sadd(  Nodisly.Config.R_PRFX + "url:"  + body.url,  uuid);
                    Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "uuid:" + uuid, Nodisly.Config.ONE_YEAR); // expires after one year!
                    Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "url:"  + body.url,  Nodisly.Config.ONE_YEAR); // expires after one year!
                    success({"url" : body.url, "surl" : Nodisly.Config.BASE_URL + ((Nodisly.Config.BASE_URL.substr(-1) === "/")? "" : "/") + uuid, "id" : uuid});
                });
            } else {
                reply = (typeof reply === "object")? reply.shift() : reply;
                success({"url" : body.url, "surl" : Nodisly.Config.BASE_URL + ((Nodisly.Config.BASE_URL.substr(-1) === "/")? "" : "/") + reply, "id" : reply});
            }
            
            Nodisly.Database.rclient.scard(Nodisly.Config.FREE_IDS_FIELD, function (e, len) {
                if (len < Nodisly.Config.WARN_SIZE_LIST)
                    Nodisly.Email.send(Nodisly.Config.ADMIN_EMAIL, 
                            "Warning: Nodisly is running out of IDs", 
                            "Please fill the DB soon with fresh UUIDs!\n" + 
                            "$ node fill_keys.js");
            });
        });
    }
};

Nodisly.Database.getSurl = function (id, success, error) {
    if (Nodisly.Util.isValidId(id)) {
        Nodisly.Database.rclient.hgetall(Nodisly.Config.R_PRFX + "uuid:" + id, function(err, reply) {
            if (reply !== null) {
                var surl = {
                    "id" : id,
                    "surl" : Nodisly.Config.BASE_URL + ((Nodisly.Config.BASE_URL.substr(-1) === "/")? "" : "/") + id,
                    "url" : reply.url
                };
                // update TTL!
                Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "uuid:" + id, Nodisly.Config.ONE_YEAR);
                Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "url:" + surl.url, Nodisly.Config.ONE_YEAR);
                success(surl);
            } else {
                error("No valid id!");
            }
        });
    } else {
        error("No valid id!");
    }
};

Nodisly.Database.fillItUp = function (len) {
    len = (len)? len : 0;

    if (len < Nodisly.Config.MAX_SIZE_LIST) {
        var uuid = Nodisly.Util.getUuid();
        //add only if not in "nodisly:free_uuids" && not in "nodisly:taken_uuids"
        Nodisly.Database.rclient.sismember(Nodisly.Config.TAKEN_IDS_FIELD, uuid, function (err, result) {
            if (result === 0) {
                Nodisly.Database.rclient.sadd(Nodisly.Config.FREE_IDS_FIELD, uuid, function () {
                    Nodisly.Database.rclient.scard(Nodisly.Config.FREE_IDS_FIELD, function (e, len) {
                        Nodisly.Database.fillItUp(len); 
                    });
                });
            } else {
                console.log("duplicate found: " + uuid + " (no worries!)");
            }
        });
    } else {
        console.log ("Filled up the DB!");
        process.exit(0);
    }
};
