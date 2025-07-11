const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    
    this.to = user.email, 
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Doaa Mahdy <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //  Sengrid
      return 1;
    }
    // In Development we use mailtrap cause we donnot need messages leak to real users inboxes
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Use host instead of service for custom SMTP
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "567", // Use SSL (port 465) or TLS (port 587)
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1)Render Html Based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
      firstName:this.firstName,
      url:this.url,
      subject
    })
    // 2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: convert(html),
    };
    
    // 3)create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natuors Family!");
  }
  async sendPasswordRest(){
    await this.send(
      'passwordReset',
      'your password reset token (valid for 10 minutes )');
  }
};
