const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");

// Configure transport options
const mailgunOptions = {
  auth: {
    api_key: process.env.MAILGUN_ACTIVE_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

const transport = mailgunTransport(mailgunOptions);

// EmailService
class EmailService {
  constructor() {
    this.emailClient = nodemailer.createTransport(transport);
  }

  makeANiceEmail(text) {
    return `
      <div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
      ">
        <h2>Hello There!</h2>
        <p>${text}</p>

        <p>😘, Inkuulu</p>
      </div>
    `;
  }
  sendEmail(to, subject, text) {
    return new Promise((resolve, reject) => {
      this.emailClient.sendMail(
        {
          from: '"Inkuluu" <helloo@inkuulu.com>',
          to,
          subject,
          html: this.makeANiceEmail(text)
        },
        (err, info) => {
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        }
      );
    });
  }
}
module.exports = new EmailService();
