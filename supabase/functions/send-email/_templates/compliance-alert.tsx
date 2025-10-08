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

interface ComplianceAlertEmailProps {
  userName: string
  itemTitle: string
  status: string
  priority: string
  country: string
  requirementType: string
  actionUrl: string
}

export const ComplianceAlertEmail = ({
  userName,
  itemTitle,
  status,
  priority,
  country,
  requirementType,
  actionUrl,
}: ComplianceAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>Compliance Alert: {itemTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>⚠️ Compliance Alert</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          A compliance item requires your attention:
        </Text>
        <Section style={alertSection}>
          <Text style={itemTitle}>{itemTitle}</Text>
          <Text style={itemInfo}>
            <strong>Country:</strong> {country}
          </Text>
          <Text style={itemInfo}>
            <strong>Type:</strong> {requirementType}
          </Text>
          <Text style={itemInfo}>
            <strong>Status:</strong> <span style={getStatusStyle(status)}>{status}</span>
          </Text>
          <Text style={itemInfo}>
            <strong>Priority:</strong> <span style={getPriorityStyle(priority)}>{priority}</span>
          </Text>
        </Section>
        <Link href={actionUrl} target="_blank" style={button}>
          Take Action
        </Link>
        <Text style={footer}>
          Please address this compliance item as soon as possible to maintain regulatory compliance.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ComplianceAlertEmail

function getStatusStyle(status: string) {
  const colors: Record<string, string> = {
    'overdue': '#ef4444',
    'at-risk': '#f59e0b',
    'pending': '#3b82f6',
  }
  return { color: colors[status] || '#666' }
}

function getPriorityStyle(priority: string) {
  const colors: Record<string, string> = {
    'high': '#ef4444',
    'medium': '#f59e0b',
    'low': '#10b981',
  }
  return { color: colors[priority] || '#666' }
}

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

const alertSection = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  padding: '24px',
  margin: '24px 20px',
}

const itemTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
}

const itemInfo = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0',
}

const button = {
  backgroundColor: '#ef4444',
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
