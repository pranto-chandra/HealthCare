import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  console.log(`📧 Sending verification code: ${otp} to ${email}`);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification OTP - Healthcare Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">Healthcare Management System</h1>
          <p style="color: #666; margin: 5px 0;">Email Verification</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
          <p style="color: #666; margin-bottom: 20px;">Please use the following 6-digit code to verify your email address:</p>

          <div style="font-size: 32px; font-weight: bold; color: #4F46E5; padding: 15px; border: 3px solid #4F46E5; border-radius: 8px; text-align: center; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Your account remains secure.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from Healthcare Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};
