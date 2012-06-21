//     Nodisly - NodeJS Redis URL Shortener
//     (c) 2012 Sebastian Germesin
//     Nodisly may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://github.com/neogermi/nodisly

Nodisly = (typeof Nodisly === "undefined")? {} : Nodisly;
Nodisly.Email = {};

Nodisly.Email.smtp = 
    Nodisly.email.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: Nodisly.Config.EMAIL.USERNAME,
            pass: Nodisly.Config.EMAIL.PASSWORD
        }
    });

Nodisly.Email.send = function (to, subject, body, from) {
    var mailOptions = {
        from: from ? from : Nodisly.Config.EMAIL.FROM,
        to: to,
        subject: subject,
        text: body
    };

    Nodisly.Email.smtp.sendMail(mailOptions,
            function (error, response) {
                if(error){
                    console.log(error);
                }
        });
};