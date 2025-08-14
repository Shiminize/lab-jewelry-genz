/**
 * Email Service for GlowGlitch
 * Handles transactional emails including verification, password reset
 * Implements secure email delivery with proper templates
 */

import nodemailer from 'nodemailer'
import { z } from 'zod'

// Environment validation for email service
const emailEnvSchema = z.object({
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.string().min(1, 'SMTP_PORT is required'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
  FROM_EMAIL: z.string().email('FROM_EMAIL must be valid email').default('noreply@glowglitch.com'),
  FROM_NAME: z.string().default('GlowGlitch'),
  SUPPORT_EMAIL: z.string().email().default('support@glowglitch.com'),
  BASE_URL: z.string().url('BASE_URL must be valid URL')
})

// Parse and validate environment variables
let emailConfig: z.infer<typeof emailEnvSchema>
try {
  emailConfig = emailEnvSchema.parse(process.env)
} catch (error) {
  console.warn('Email service configuration missing. Email functionality will be disabled.')
  emailConfig = null as any
}

// Create transporter
let transporter: nodemailer.Transporter | null = null

if (emailConfig) {
  transporter = nodemailer.createTransporter({
    host: emailConfig.SMTP_HOST,
    port: parseInt(emailConfig.SMTP_PORT),
    secure: parseInt(emailConfig.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: emailConfig.SMTP_USER,
      pass: emailConfig.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  })
}

// Email template base
function getEmailTemplate(content: string, title: string = 'GlowGlitch'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #fdfdf9;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);
            border-radius: 12px;
        }
        
        .logo {
            font-family: 'Fraunces', serif;
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            text-decoration: none;
        }
        
        .tagline {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
        }
        
        .content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 30px;
        }
        
        .button {
            display: inline-block;
            background: #d4af37;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: background-color 0.2s;
        }
        
        .button:hover {
            background: #b8941f;
        }
        
        .footer {
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .footer a {
            color: #d4af37;
            text-decoration: none;
        }
        
        .security-notice {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 14px;
            color: #6c757d;
        }
        
        h1 {
            font-family: 'Fraunces', serif;
            font-size: 24px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        
        p {
            margin-bottom: 16px;
            color: #444;
        }
        
        .highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 12px;
            margin: 16px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="${emailConfig?.BASE_URL || 'https://glowglitch.com'}" class="logo">GlowGlitch</a>
            <div class="tagline">Lab-grown luxury that captivates</div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>
                This email was sent by <a href="${emailConfig?.BASE_URL || 'https://glowglitch.com'}">GlowGlitch</a><br>
                If you have questions, contact us at <a href="mailto:${emailConfig?.SUPPORT_EMAIL || 'support@glowglitch.com'}">${emailConfig?.SUPPORT_EMAIL || 'support@glowglitch.com'}</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
                © ${new Date().getFullYear()} GlowGlitch. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

// Send email verification
export async function sendVerificationEmail(
  email: string,
  token: string,
  user: { firstName: string; lastName: string }
): Promise<boolean> {
  if (!transporter || !emailConfig) {
    console.warn('Email service not configured. Verification email not sent.')
    return false
  }
  
  const verificationUrl = `${emailConfig.BASE_URL}/auth/verify-email?token=${token}`
  
  const content = `
    <h1>Welcome to GlowGlitch, ${user.firstName}!</h1>
    
    <p>Thank you for joining our community of jewelry lovers. We're excited to help you discover the perfect pieces that capture your unique style.</p>
    
    <p>To complete your registration and start exploring our collection of lab-grown luxury jewelry, please verify your email address:</p>
    
    <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <div class="security-notice">
        <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create an account with GlowGlitch, please ignore this email.
    </div>
    
    <p>Once verified, you'll be able to:</p>
    <ul style="margin-left: 20px; margin-bottom: 20px;">
        <li>Browse our curated collection of lab-grown jewelry</li>
        <li>Use our 3D customizer to design unique pieces</li>
        <li>Save your favorite designs and create wishlists</li>
        <li>Track your orders and delivery status</li>
        <li>Join our creator program for exclusive benefits</li>
    </ul>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <div class="highlight">
        <a href="${verificationUrl}" style="word-break: break-all;">${verificationUrl}</a>
    </div>
  `
  
  try {
    await transporter.sendMail({
      from: `"${emailConfig.FROM_NAME}" <${emailConfig.FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to GlowGlitch - Verify Your Email',
      html: getEmailTemplate(content, 'Verify Your Email - GlowGlitch'),
      text: `
Welcome to GlowGlitch, ${user.firstName}!

Thank you for joining our community. To complete your registration, please verify your email address by visiting:

${verificationUrl}

This link will expire in 24 hours. If you didn't create an account with GlowGlitch, please ignore this email.

Best regards,
The GlowGlitch Team
      `.trim()
    })
    
    console.log(`Verification email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  user: { firstName: string }
): Promise<boolean> {
  if (!transporter || !emailConfig) {
    console.warn('Email service not configured. Password reset email not sent.')
    return false
  }
  
  const resetUrl = `${emailConfig.BASE_URL}/auth/reset-password?token=${token}`
  
  const content = `
    <h1>Reset Your Password</h1>
    
    <p>Hi ${user.firstName},</p>
    
    <p>We received a request to reset the password for your GlowGlitch account. If you made this request, click the button below to set a new password:</p>
    
    <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <div class="security-notice">
        <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
    </div>
    
    <p>For your security, please:</p>
    <ul style="margin-left: 20px; margin-bottom: 20px;">
        <li>Choose a strong, unique password</li>
        <li>Don't share your password with anyone</li>
        <li>Use a password manager if possible</li>
    </ul>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <div class="highlight">
        <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
    </div>
    
    <p>If you continue to have problems, please contact our support team at <a href="mailto:${emailConfig.SUPPORT_EMAIL}">${emailConfig.SUPPORT_EMAIL}</a>.</p>
  `
  
  try {
    await transporter.sendMail({
      from: `"${emailConfig.FROM_NAME}" <${emailConfig.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your GlowGlitch Password',
      html: getEmailTemplate(content, 'Reset Your Password - GlowGlitch'),
      text: `
Hi ${user.firstName},

We received a request to reset the password for your GlowGlitch account. If you made this request, visit this link to set a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.

Best regards,
The GlowGlitch Team
      `.trim()
    })
    
    console.log(`Password reset email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}

// Send welcome email (after email verification)
export async function sendWelcomeEmail(
  email: string,
  user: { firstName: string; lastName: string }
): Promise<boolean> {
  if (!transporter || !emailConfig) {
    console.warn('Email service not configured. Welcome email not sent.')
    return false
  }
  
  const content = `
    <h1>Welcome to GlowGlitch, ${user.firstName}!</h1>
    
    <p>Your email has been verified and your account is now active. You're all set to start exploring our collection of stunning lab-grown jewelry!</p>
    
    <p>Here's what you can do now:</p>
    
    <div style="margin: 30px 0;">
        <div style="display: inline-block; width: 100%; margin-bottom: 20px;">
            <h3 style="color: #d4af37; margin-bottom: 8px;">🎨 Design Your Own Jewelry</h3>
            <p>Use our 3D customizer to create unique pieces tailored to your style.</p>
        </div>
        
        <div style="display: inline-block; width: 100%; margin-bottom: 20px;">
            <h3 style="color: #d4af37; margin-bottom: 8px;">💎 Browse Premium Collection</h3>
            <p>Explore our curated selection of lab-grown diamond jewelry.</p>
        </div>
        
        <div style="display: inline-block; width: 100%; margin-bottom: 20px;">
            <h3 style="color: #d4af37; margin-bottom: 8px;">🌟 Join Creator Program</h3>
            <p>Earn rewards by sharing your love for sustainable luxury.</p>
        </div>
    </div>
    
    <div style="text-align: center;">
        <a href="${emailConfig.BASE_URL}/catalog" class="button">Start Shopping</a>
    </div>
    
    <div class="highlight">
        <strong>Special Offer:</strong> Use code <strong>WELCOME10</strong> for 10% off your first order!
    </div>
    
    <p>If you have any questions, our support team is here to help. Just reply to this email or contact us at <a href="mailto:${emailConfig.SUPPORT_EMAIL}">${emailConfig.SUPPORT_EMAIL}</a>.</p>
  `
  
  try {
    await transporter.sendMail({
      from: `"${emailConfig.FROM_NAME}" <${emailConfig.FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to GlowGlitch - Your Account is Ready!',
      html: getEmailTemplate(content, 'Welcome to GlowGlitch'),
      text: `
Welcome to GlowGlitch, ${user.firstName}!

Your email has been verified and your account is now active. You're all set to start exploring our collection of stunning lab-grown jewelry!

What you can do now:
- Design your own jewelry with our 3D customizer
- Browse our premium collection of lab-grown diamonds
- Join our creator program for exclusive rewards

Visit us at: ${emailConfig.BASE_URL}

Special offer: Use code WELCOME10 for 10% off your first order!

Best regards,
The GlowGlitch Team
      `.trim()
    })
    
    console.log(`Welcome email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  if (!transporter) {
    return false
  }
  
  try {
    await transporter.verify()
    console.log('Email service is ready')
    return true
  } catch (error) {
    console.error('Email service configuration error:', error)
    return false
  }
}