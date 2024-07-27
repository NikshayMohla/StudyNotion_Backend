const nodeMailer = require("nodemailer")

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                password: process.env.MAIL_PASSWORD,
            }
        })
        let info = await transporter.sendMail({
            from: "STUDYNOTION INCORPORATION",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log(info)
        return info
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = mailSender