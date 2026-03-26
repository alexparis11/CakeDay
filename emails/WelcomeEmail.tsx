import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Link,
} from "@react-email/components"
import * as React from "react"

interface WelcomeEmailProps {
  contactName: string
  companyName: string
  loginUrl: string
  appUrl: string
}

export default function WelcomeEmail({
  contactName = "Alex Smith",
  companyName = "Acme Corp",
  loginUrl = "https://app.yourcakeday.com/login",
  appUrl = "https://app.yourcakeday.com",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to CakeDay — your employee birthday cake service is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>🎂 CakeDay</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome to CakeDay, {contactName}!</Heading>
            <Text style={paragraph}>
              Your CakeDay account for <strong>{companyName}</strong> is now active.
              We&apos;ll automatically remind you about upcoming employee birthdays and help
              you arrange cake deliveries — all in one place.
            </Text>

            <Button style={loginButton} href={loginUrl}>
              Sign in to CakeDay
            </Button>

            {/* Quick start */}
            <Section style={stepsBox}>
              <Heading as="h2" style={h2}>Get started in 3 steps</Heading>
              <Section style={step}>
                <Text style={stepNum}>1</Text>
                <Text style={stepText}>
                  <strong>Upload your employee list</strong> — go to the Employees page
                  and upload a CSV with first_name, last_name, birthday (MM-DD), and
                  delivery_address columns.
                </Text>
              </Section>
              <Section style={step}>
                <Text style={stepNum}>2</Text>
                <Text style={stepText}>
                  <strong>Review upcoming birthdays</strong> — your dashboard shows a
                  30-day calendar of upcoming birthdays with order status badges.
                </Text>
              </Section>
              <Section style={step}>
                <Text style={stepNum}>3</Text>
                <Text style={stepText}>
                  <strong>Approve cake orders</strong> — when a birthday is 7 days away,
                  you&apos;ll receive an email. Head to Orders to approve or skip each one.
                </Text>
              </Section>
            </Section>

            <Text style={helpText}>
              Need help? Reply to this email or visit{" "}
              <Link href={appUrl} style={link}>{appUrl}</Link> to get started.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            CakeDay — Birthday cake deliveries, automated.
            <br />
            You received this because an admin created your account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: "#f4f4f5", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" }
const header = { backgroundColor: "#FF6B4A", borderRadius: "8px 8px 0 0", padding: "24px 32px" }
const logo = { color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0" }
const content = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 8px 8px", border: "1px solid #e4e4e7" }
const h1 = { fontSize: "24px", fontWeight: "700", color: "#18181b", marginTop: "0" }
const h2 = { fontSize: "14px", fontWeight: "600", color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "16px" }
const paragraph = { color: "#52525b", fontSize: "15px", lineHeight: "24px" }
const loginButton = { backgroundColor: "#FF6B4A", color: "#fff", borderRadius: "6px", padding: "14px 32px", fontSize: "16px", fontWeight: "600", textDecoration: "none", display: "inline-block", margin: "8px 0 28px" }
const stepsBox = { backgroundColor: "#fafafa", border: "1px solid #e4e4e7", borderRadius: "8px", padding: "24px", margin: "0 0 24px" }
const step = { display: "flex", gap: "12px", marginBottom: "16px" }
const stepNum = { backgroundColor: "#FF6B4A", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0, margin: "0 12px 0 0" }
const stepText = { color: "#52525b", fontSize: "14px", lineHeight: "22px", margin: "0" }
const helpText = { color: "#71717a", fontSize: "14px" }
const link = { color: "#FF6B4A" }
const hr = { borderColor: "#e4e4e7", margin: "24px 0" }
const footer = { color: "#a1a1aa", fontSize: "12px", textAlign: "center" as const, lineHeight: "20px" }
