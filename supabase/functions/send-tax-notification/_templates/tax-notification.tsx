import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface TaxNotificationEmailProps {
  userName: string;
  notificationType: string;
  message: string;
  actionUrl?: string;
}

export const TaxNotificationEmail = ({
  userName,
  notificationType,
  message,
  actionUrl,
}: TaxNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Tax Update Notification</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Tax Update</Heading>
        <Text style={text}>Hello {userName},</Text>
        <Text style={text}>{message}</Text>
        {actionUrl && (
          <Link href={actionUrl} target="_blank" style={button}>
            View Details
          </Link>
        )}
        <Text style={footer}>
          This is an automated message from your tax management system.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default TaxNotificationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#556CD6',
  borderRadius: '5px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '50px',
  textAlign: 'center',
  textDecoration: 'none',
  width: '200px',
  margin: '24px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '24px 0',
}