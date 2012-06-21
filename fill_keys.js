//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
/**************** DEPENDENCIES ****************/
Nodisly.redis = require("redis");
Nodisly.express = require("express");
/**************** DEPENDENCIES ****************/

require('./config.js');
require('./util.js');
require('./database.js');

Nodisly.Database.rclient.scard(Nodisly.Config.FREE_IDS_FIELD, function (e, len) {
    console.log(len + " ids left!");
    Nodisly.Database.fillItUp(len);
 });