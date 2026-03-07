const emailService = require("./email.service");

exports.sendMail = async (subject, text, attachment) => {
  const emails = await emailService.getActiveEmails();

  const emailList = emails.rows.map(e => e.email);

  if (emailList.length === 0) {
    console.log("No active emails");
    return;
  }

  return await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: emailList.join(","),
    subject,
    text,
    attachments: attachment ? [attachment] : [],
  });
};