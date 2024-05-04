const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendEmail(email, token) {
  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your verification token for the app",
    text: "Welcome to the app!",
    html: `<p>Your verification token is: <b>${token}</b></p>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

module.exports = sendEmail;
