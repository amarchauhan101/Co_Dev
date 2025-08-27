const nodemailer = require("nodemailer");

const createTransport = () => {
  console.log('📧 Creating email transporter...');
  console.log('Email Host:', process.env.EMAIL_HOST);
  console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('Email Pass:', process.env.EMAIL_PASS ? 'Set (hidden)' : 'Not set');
  
  return nodemailer.createTransport({
    service: 'gmail', // Add this for Gmail
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Add this for development
    }
  });
};

const sendInvitationEmail = async (email, invitationToken, role) => {
  try {
    console.log('📧 Attempting to send invitation email...');
    console.log('To:', email);
    console.log('Role:', role);
    console.log('Token:', invitationToken);

    const transporter = createTransport();
    
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP server connection verified');

    // Fix the invitation link (use consistent format)
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/register/${invitationToken}`;
    console.log('🔗 Invitation link:', invitationLink);

    const mailOptions = {
      from: `"Admin Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚀 Admin Invitation - ${role.toUpperCase()} Role`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 10px;">
          <h1 style="color: #2d3748; text-align: center;">🎉 You're Invited to Join as Admin!</h1>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 20px;">
              Congratulations! You have been invited to join our admin team as a <strong style="color: #667eea;">${role.toUpperCase()}</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;
                        font-size: 16px;">
                ✨ Accept Admin Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #718096; margin-top: 20px;">
              Or copy and paste this link in your browser:
            </p>
            <div style="background: #f7fafc; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 10px 0;">
              <code style="word-break: break-all; color: #2d3748;">${invitationLink}</code>
            </div>
          </div>
          
          <div style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 30px;">
            <p>⏰ This invitation will expire in 24 hours.</p>
            <p>🔐 This is a secure invitation link. Do not share it with others.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Admin invitation sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      invitationLink: invitationLink 
    };
    
  } catch (err) {
    console.error("❌ Error sending email:", err);
    
    // Provide specific error messages
    if (err.code === 'EAUTH') {
      console.error('🔐 Authentication Error: Please check your Gmail App Password');
      console.error('💡 Make sure you:');
      console.error('   1. Used your Gmail App Password (not regular password)');
      console.error('   2. Enabled 2-Factor Authentication');
      console.error('   3. Generated App Password from Google Account settings');
    }
    
    throw new Error(`Email sending failed: ${err.message}`);
  }
};

module.exports = {
    sendInvitationEmail
};
