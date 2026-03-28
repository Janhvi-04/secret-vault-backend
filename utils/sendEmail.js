const nodemailer=require('nodemailer');
const sendEmail=async(options)=>{
    const transporter=nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com', 
        port: 2525,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions={
        from: `"Secret Vault" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    return await transporter.sendMail(mailOptions);
}
module.exports=sendEmail;