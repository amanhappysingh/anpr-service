
const emailController = require("../controllers/email.controller");
const EmailRecipient = require("../modals/emailRecipient.model");
const nodemailer = require("nodemailer");



exports.sendMail = async (subject, html, attachment) => {
  const emails = await EmailRecipient.findAll();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const emailList = emails.rows.map(e => e.email);

  if (emailList.length === 0) {
    console.log("No active emails");
    return;
  }

  return await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: emailList.join(","),
    subject,
    html,
    attachments: attachment ? [attachment] : [],
  });
};