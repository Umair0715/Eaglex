const nodemailer = require("nodemailer");

exports.sendEmail = async (email , subject , text) => {
   let transporter = nodemailer.createTransport({
      name : process.env.EMAIL_HOST ,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USER, 
         pass: process.env.EMAIL_PASSWORD,
      },
   });

   const mailOptions = {
      from:`${process.env.EMAIL_USER}` ,
      to: email,
      subject ,
      text 
   };

   return await transporter.sendMail(mailOptions);
};