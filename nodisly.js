//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
/**************** DEPENDENCIES ****************/
Nodisly.redis = require("redis");
Nodisly.express = require("express");
Nodisly.email = require('nodemailer');
Nodisly.path = require('path');
Nodisly.fs = require('fs');
/**************** DEPENDENCIES ****************/

/**************** MODULES ****************/
require('./config.js');
require('./mail.js');
require('./util.js');
require('./database.js');
require('./rest.js');
/**************** MODULES ****************/

console.log("server started at: http://127.0.0.1:" + Nodisly.Config.PORT + " with base url:" + Nodisly.Config.BASE_URL);
Nodisly.REST.app.listen(Nodisly.Config.PORT);

