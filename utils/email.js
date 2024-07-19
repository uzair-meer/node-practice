import nodemailer from "nodemailer";

export const sendEmail = async (option) => {
  // transpoter actually sends mail not node

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: "meers support<support@meer.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

await transporter.sendMail(emailOptions);
};
