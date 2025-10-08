import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface DeadlineReminderEmailProps {
  userName: string
  deadlineTitle: string
  deadlineDate: string
  daysUntilDue: number
  deadlineType: string
  actionUrl: string
}

export const DeadlineReminderEmail = ({
  userName,
  deadlineTitle,
  deadlineDate,
  daysUntilDue,
  deadlineType,
  actionUrl,
}: DeadlineReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Reminder: {deadlineTitle} is due in {daysUntilDue} days</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Deadline Reminder</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          This is a friendly reminder that you have an upcoming deadline:
        </Text>
        <Section style={deadlineSection}>
          <Text style={deadlineTitle}>{deadlineTitle}</Text>
          <Text style={deadlineInfo}>
            <strong>Type:</strong> {deadlineType}
          </Text>
          <Text style={deadlineInfo}>
            <strong>Due Date:</strong> {deadlineDate}
          </Text>
          <Text style={urgencyText}>
            {daysUntilDue === 0 ? '⚠️ Due Today!' : `⏰ ${daysUntilDue} days remaining`}
          </Text>
        </Section>
        <Link href={actionUrl} target="_blank" style={button}>
          View Details
        </Link>
        <Text style={footer}>
          This is an automated reminder from your Tax Compliance Platform.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DeadlineReminderEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 20px',
}

const deadlineSection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #3b82f6',
  padding: '24px',
  margin: '24px 20px',
}

const deadlineTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
}

const deadlineInfo = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0',
}

const urgencyText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ef4444',
  marginTop: '16px',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px 0',
  margin: '24px auto',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
  marginTop: '32px',
}
