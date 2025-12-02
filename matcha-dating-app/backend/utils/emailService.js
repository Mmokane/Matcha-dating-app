// this file will handle sending email for :
// - Email verification : when user registers
// - Password reset : when user forgets password 
// - Welcome email : optional, when email is verified 

//  * Create reusable transporter
//  * This is the "connection" to the email service
const nodemailer = require('nodemailer')

const createTransporter = () => {

	return nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port : process.env.EMAIL_PORT,
		secure : false, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD
		}
	})
}

// * Send verification email when user registers
// * @param {string} to - Recipient email address
// * @param {string} username - User's username
// * @param {string} verificationToken - Unique verification token

const sendVerificationEmail = async (to, username, verificationToken) => {
	
	try {
		const transporter = createTransporter()
		// create verification URL (front will handle this route)
		const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

		// email options 
		const mailOptions = {
			from : process.env.EMAIL_FROM || `"Matcha Dating" <${process.env.EMAIL_USER}`,
			to: to,
			html:   `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #e91e63;">Welcome to Matcha Dating! 💕</h2>
				<p>Hi <strong>${username}</strong>,</p>
				<p>Thank you for registering with Matcha Dating. Please verify your email address to complete your registration.</p>
				<p>Click the button below to verify your email:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${verificationUrl}" 
					style="background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
					Verify Email
					</a>
				</div>
				<p>Or copy and paste this link in your browser:</p>
				<p style="color: #666; word-break: break-all;">${verificationUrl}</p>
				<p style="color: #999; font-size: 12px; margin-top: 30px;">
					If you didn't create an account with Matcha Dating, please ignore this email.
				</p>
				</div>
			`,
			text: `
			Welcome to Matcha Dating!

			Hi ${username},

			Thank you for registering , please verify your email by clicking the link below :
			${verificationUrl}

			If you didn't create an account, please ignore this email.
			`
		}
		// send email 
		const info = await transporter.sendMail(mailOptions)
		console.log("verif email sent", info.messageId)
		return {success: true, messageId: info.messageId}
	}
	catch (error) {
		console.error('❌ Error sending verification email:', error.message);
   		throw new Error('Failed to send verification email: ' + error.message);
	}
}

// * Send password reset email
// * @param {string} to - Recipient email address
// * @param {string} username - User's username
// * @param {string} resetToken - Unique reset token

const sendPasswordResetEmail = async (to, username, resetToken) => {

	try {
		const transporter = createTransporter()

		//create reset url (frontend will handle this )
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
		// email options
		const mailOptions = {
			from: process.env.EMAIL_FROM || `"Matcha Dating" <${process.env.EMAIL_USER}>`,
			to: to,
			subject: 'Reset Your Password - Matcha Dating',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #e91e63;">Password Reset Request 🔐</h2>
				<p>Hi <strong>${username}</strong>,</p>
				<p>We received a request to reset your password for your Matcha Dating account.</p>
				<p>Click the button below to reset your password:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${resetUrl}" 
					style="background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
					Reset Password
					</a>
				</div>
				<p>Or copy and paste this link in your browser:</p>
				<p style="color: #666; word-break: break-all;">${resetUrl}</p>
				<p style="color: #ff9800; font-weight: bold;">⚠️ This link will expire in 1 hour.</p>
				<p style="color: #999; font-size: 12px; margin-top: 30px;">
					If you didn't request a password reset, please ignore this email and your password will remain unchanged.
				</p>
				</div>
			`,
			text: `
				Password Reset Request
				
				Hi ${username},
				
				We received a request to reset your password. Click the link below to reset it:
				${resetUrl}
				
				This link will expire in 1 hour.
				
				If you didn't request this, please ignore this email.
			`
		}
		// send email
		const info = await transporter.sendMail(mailOptions)
		console.log("Password reset email sent: ", info.messageId)
		return {success: true, messageId: info.messageId}
	}
	catch(error){
		console.error('❌ Error sending password reset email:', error.message);
    	throw new Error('Failed to send password reset email: ' + error.message);
	}
}

// * Send welcome email after email verification (optional)
// * @param {string} to - Recipient email address
// * @param {string} username - User's username

const sendWelcomeEmail = async (to, username) => {
  try {
    const transporter = createTransporter();
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Matcha Dating" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to Matcha Dating! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Welcome to Matcha! 🎉</h2>
          <p>Hi <strong>${username}</strong>,</p>
          <p>Your email has been verified successfully! You're now ready to start your journey to find meaningful connections.</p>
          <h3 style="color: #333;">Next Steps:</h3>
          <ul style="line-height: 1.8;">
            <li>Complete your profile with photos and interests</li>
            <li>Browse and discover compatible matches</li>
            <li>Connect with people who share your interests</li>
            <li>Start chatting with your matches</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/profile/edit" 
               style="background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Your Profile
            </a>
          </div>
          <p style="color: #666;">Happy matching! 💕</p>
        </div>
      `,
      text: `
        Welcome to Matcha Dating!
        
        Hi ${username},
        
        Your email has been verified! You're now ready to start finding meaningful connections.
        
        Next steps:
        - Complete your profile with photos and interests
        - Browse and discover compatible matches
        - Connect with people who share your interests
        - Start chatting with your matches
        
        Happy matching!
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};


// Export functions
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};