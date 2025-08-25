import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const WelcomeEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: WelcomeEmailProps) => {
  const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

  return (
    <Html>
      <Head />
      <Preview>Welcome to AS Cladding & Roofing - Confirm your account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Welcome to AS Cladding & Roofing!</Heading>
            <Text style={subtitle}>
              Your professional construction management platform
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>
              Hi there! 👋
            </Text>
            <Text style={text}>
              Thank you for signing up for AS Cladding & Roofing. We're excited to help you manage your construction business more efficiently.
            </Text>
            
            <Text style={text}>
              To get started, please confirm your email address by clicking the button below:
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={confirmationUrl}>
                Confirm Email Address
              </Button>
            </Section>

            <Text style={smallText}>
              If the button doesn't work, you can copy and paste this link into your browser:
            </Text>
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>

            <Hr style={hr} />

            <Text style={text}>
              Once confirmed, you'll be able to:
            </Text>
            <Text style={featureText}>
              ✅ Create and manage professional invoices<br/>
              ✅ Track projects and monitor progress<br/>
              ✅ Generate quotes and variations<br/>
              ✅ Access AI-powered business insights<br/>
              ✅ Manage your team and clients
            </Text>

            <Hr style={hr} />

            <Text style={smallText}>
              This confirmation link will expire in 24 hours. If you didn't create an account with AS Cladding & Roofing, you can safely ignore this email.
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footer}>
              Best regards,<br/>
              The AS Cladding & Roofing Team
            </Text>
            <Text style={footerSmall}>
              Professional Construction Management Platform
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const headerSection = {
  textAlign: 'center' as const,
  padding: '20px 0 40px',
}

const contentSection = {
  padding: '0 20px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const footerSection = {
  textAlign: 'center' as const,
  padding: '40px 20px 20px',
  borderTop: '1px solid #eaeaea',
  marginTop: '40px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  textAlign: 'center' as const,
}

const subtitle = {
  color: '#666666',
  fontSize: '18px',
  margin: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const featureText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
  paddingLeft: '10px',
}

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0',
}

const link = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const hr = {
  border: 'none',
  borderTop: '1px solid #eaeaea',
  margin: '32px 0',
}

const footer = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 10px',
  textAlign: 'center' as const,
}

const footerSmall = {
  color: '#898989',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
}