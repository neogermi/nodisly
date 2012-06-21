//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
/**************** CONFIGURATION ****************/

var tmpConfig = (Nodisly.path.existsSync("nodisly.conf"))? 
        JSON.parse(Nodisly.fs.readFileSync("nodisly.conf").toString()) :
        {};

Nodisly.Config = {
        
    PORT            : tmpConfig.port ? tmpConfig.port : 3000,
    BASE_URL        : tmpConfig.base_url ? tmpConfig.base_url : "http://localhost:" + this.PORT,
    R_PRFX          : "nodisly:",
    FREE_IDS_FIELD  : "nodisly:free_uuids",
    TAKEN_IDS_FIELD : "nodisly:taken_uuids",
    ONE_YEAR        : 365 * 24 * 60 * 60,
    MAX_SIZE_LIST   : tmpConfig.max_size_list ? tmpConfig.max_size_list : 1000000,
    WARN_SIZE_LIST  : tmpConfig.warn_size_list ? tmpConfig.warn_size_list : 10000,
    ADMIN_EMAIL     : tmpConfig.admin_email ? tmpConfig.admin_email : "neogermi@googlemail.com",
    
    EMAIL : {
        HOST     : tmpConfig.email_host,
        PORT     : tmpConfig.email_port,
        FROM     : tmpConfig.email_from,
        DOMAIN   : tmpConfig.email_domain,
        USERNAME : tmpConfig.email_username,
        PASSWORD : tmpConfig.email_password
    }
};
/**************** CONFIGURATION ****************/