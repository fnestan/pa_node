const nodemailer = require('nodemailer');

class MailService {

    static async sendMail(email, object, message) {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'nestanfrantz@gmail.com',
                pass: 'Paris1996**'

            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'no-reply@message.com',
            to: email,
            subject: object,
            text: message
        };
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);

            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = MailService;
