const nodemailer =  require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
   
    auth: {
      user: 'arfan.nu@students.amikom.ac.id',
      pass: 'ddxk jezd itps duru',
    },
  });

exports.sendVerificationEmail = (user, token) => {
  const verificationLink = `${process.env.base_url}api/user/verify?token=${token}`;
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Email Verification',
    text: `Click the following link to verify your email: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sent mail', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

exports.sendForgotPasswordEmail = (user, token) =>{
    const verificationLink = `${process.env.base_url}api/user/reset-password?token=${token}`;
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: user.email,
        subject: 'Change password',
        text: `Click the following link to change your password : ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sent mail', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}