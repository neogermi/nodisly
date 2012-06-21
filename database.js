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
Nodisly.Database.createSurl = function (url, success, error) {

    Nodisly.Database.rclient.get(Nodisly.Config.R_PRFX + "url:" + url, function(err, reply) {
        if (reply === null) {
            // we do not know this URL!
            Nodisly.Database.rclient.spop(Nodisly.Config.FREE_IDS_FIELD, function (err, uuid) {
                Nodisly.Database.rclient.sadd(Nodisly.Config.TAKEN_IDS_FIELD, uuid);
                Nodisly.Database.rclient.hmset( Nodisly.Config.R_PRFX + "uuid:" + uuid, "url", url, "uuid", uuid);
                Nodisly.Database.rclient.set(   Nodisly.Config.R_PRFX + "url:"  + url,  uuid);
                Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "uuid:" + uuid, Nodisly.Config.ONE_YEAR); // expires after one year!
                Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "url:"  + url,  Nodisly.Config.ONE_YEAR); // expires after one year!
                success({"url" : url, "uuid" : uuid});
            });
        } else {
            success({"url" : url, "uuid" : reply});
        }
        
        Nodisly.Database.rclient.scard(Nodisly.Config.FREE_IDS_FIELD, function (e, len) {
            if (len < Nodisly.Config.WARN_SIZE_LIST)
                Nodisly.Email.send(Nodisly.Config.ADMIN_EMAIL, 
                        "Warning: Nodisly is running out of IDs", 
                        "Please fill the DB soon with fresh UUIDs!\n" + 
                        "$ node fill_keys.js");
        });
        
    });
};

Nodisly.Database.getSurl = function (uuid, success, error) {
    if (uuid) {
        Nodisly.Database.rclient.hgetall(Nodisly.Config.R_PRFX + "uuid:" + uuid, function(err, reply) {
            if (reply !== null) {
                var surl = {
                    "uuid" : uuid,
                    "url" : reply.url
                };
                // update TTL!
                Nodisly.Database.rclient.expire(Nodisly.Config.R_PRFX + "uuid:" + uuid, Nodisly.Config.ONE_YEAR);
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
