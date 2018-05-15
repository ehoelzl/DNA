const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SERVER_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = {
    sendStamp: function(filename, hash, signature, user) {
        let complete_signature = signature;
        complete_signature.push({'email' : user});
        var mailOptions = {
            from: '"DNA" <eth.notary@gmail.com>',
            to: user,
            subject: 'Signature',
            text: "Dear user, \n\n please find attached your signature for your timestamped document with name " + filename +
            " and hash 0x" + hash.substr(0,64) + ". \n Keep it safe. \n\n" +
            "This is an automatic email, please do not answer. \n\n The DNA team \n\n",
            attachments: [{
                filename: 'signature.json',
                content: JSON.stringify(complete_signature)
            }]
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent for TimeStamping: ' + info.response);
            }
        });
    },

    sendPatent: function(ownerMail, patentName, rentee){
      var mailOptions = {
        from: '"DNA" <eth.notary@gmail.com>',
        to: ownerMail,
        subject: 'New Rental',
        text: "Dear user, \n\n This email is a notification regarding your deposited patent " +patentName+ ".\n " +
                    "User with address " + rentee + " has requested access. The funds have been transfered to your Ethereum address.\n\n"+
                    "This is an automatic email, please do not answer. \n\n The DNA team \n\n",
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Email sent for patent buy: ' + info.response);
        }
      });
    }
};