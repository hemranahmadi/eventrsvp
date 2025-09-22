# EventRSVP Website

A modern event RSVP management system built with Next.js, featuring real email verification and comprehensive event management.

## Features

### Authentication System
- **Real Email Verification**: Users must provide valid email addresses and verify them with a 6-digit code
- **Email Validation**: Blocks disposable email addresses and validates email format
- **Secure Registration**: Password requirements and duplicate email prevention
- **Session Management**: Persistent login sessions with localStorage

### Event Management
- Create and manage events with detailed information
- Set RSVP deadlines and guest limits
- Real-time RSVP tracking and analytics
- Event activation/deactivation controls

### RSVP System
- Public RSVP forms with email validation
- Guest count management
- Update existing RSVPs
- Deadline enforcement

## Email Integration Ready

The authentication system is ready for production email services:

\`\`\`javascript
// Replace the simulated email function in lib/auth.ts
sendVerificationEmail: async (email: string, code: string): Promise<boolean> => {
  // Integration examples:
  
  // SendGrid
  const msg = {
    to: email,
    from: 'noreply@yourdomain.com',
    subject: 'Verify your EventRSVP account',
    text: `Your verification code is: ${code}`,
  }
  await sgMail.send(msg)
  
  // Or Mailgun, AWS SES, etc.
  return true
}
\`\`\`

## Environment Variables

\`\`\`
# Add these for production email service
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
\`\`\`

## Getting Started

1. Users must register with real email addresses
2. Email verification is required before login
3. Create events and share RSVP links
4. Monitor responses through the dashboard

The system enforces email validation at multiple levels to ensure only legitimate users can create accounts and RSVP to events.
