const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_userName,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log(
    `username: ${process.env.EMAIL_userName}  and password: ${process.env.EMAIL_PASSWORD}`
  );

  const mailOptions = {
    from: "Hussein Khalil <huseeink852@gmail.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Could not send email. Please try again later.");
  } finally {
    transporter.close();
  }
};

module.exports = sendEmail;
