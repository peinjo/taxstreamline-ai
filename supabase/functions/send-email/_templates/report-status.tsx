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

interface ReportStatusEmailProps {
  userName: string
  reportType: string
  reportYear: number
  previousStatus: string
  newStatus: string
  actionUrl: string
}

export const ReportStatusEmail = ({
  userName,
  reportType,
  reportYear,
  previousStatus,
  newStatus,
  actionUrl,
}: ReportStatusEmailProps) => (
  <Html>
    <Head />
    <Preview>Report Status Update: {reportType} {reportYear}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Report Status Update</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          Your tax report status has been updated:
        </Text>
        <Section style={reportSection}>
          <Text style={reportTitle}>{reportType} - {reportYear}</Text>
          <Text style={statusChange}>
            Status changed from <strong>{previousStatus}</strong> to <strong style={getStatusColor(newStatus)}>{newStatus}</strong>
          </Text>
        </Section>
        <Link href={actionUrl} target="_blank" style={button}>
          View Report
        </Link>
        <Text style={footer}>
          Tax Compliance Platform - Automated Notification
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReportStatusEmail

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'submitted': '#10b981',
    'approved': '#3b82f6',
    'rejected': '#ef4444',
    'pending': '#f59e0b',
  }
  return { color: colors[status] || '#666' }
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

const reportSection = {
  backgroundColor: '#f0f9ff',
  borderLeft: '4px solid #3b82f6',
  padding: '24px',
  margin: '24px 20px',
}

const reportTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
}

const statusChange = {
  fontSize: '16px',
  color: '#666',
  margin: '8px 0',
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
