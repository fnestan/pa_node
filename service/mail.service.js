const nodemailer = require('nodemailer');

class MailService {

    static async sendMail(email, banni) {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'nestanfrantz@gmail.com',
                pass: 'frantz123456789'

            },
            tls: {
                rejectUnauthorized: false
            }
        });
        let text;
        if (banni === 'user') {
            text = "Nous avons le regret de vous annoncé que  avez été banni, nous en sommes désolé si vous avez des questions " +
                "vous pouvez nous contacter par téléphone ou par email."


        } else {
            text = "Nous avons le regret de vous annoncé que  votre annexe a été banni,  nous en sommes désolé si vous avez des questions " +
                "vous pouvez nous contacter par téléphone ou par email."

        }
        const mailOptions = {
            from: 'no-reply@message.com',
            to: email,//user.email,
            subject: 'Bannissement',
            text: text
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
