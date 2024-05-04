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

// Define the email options
const mailOptions = {
  from: "Ala@makota.com",
  to: "daniel_toporek@wp.pl",
  subject: "Test Nodemailer Email",
  text: "Hello from Nodemailer!",
  html: "<p>Hello from <b>Nodemailer</b>!</p>",
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error occurred:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
