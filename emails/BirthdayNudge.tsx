import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from "@react-email/components"
import * as React from "react"

interface BirthdayNudgeProps {
  employeeName: string
  deliveryDate: string
  cakeType: string
  deliveryAddress: string
  daysUntilDelivery: number
  appUrl: string
}

export default function BirthdayNudge({
  employeeName = "Sarah Johnson",
  deliveryDate = "Thursday, 2 April 2025",
  cakeType = "Vanilla Sponge",
  deliveryAddress = "123 Business Park, London, EC1A 1BB",
  daysUntilDelivery = 2,
  appUrl = "https://app.yourcakeday.com",
}: BirthdayNudgeProps) {
  const ordersUrl = `${appUrl}/orders`

  return (
    <Html>
      <Head />
      <Preview>⏰ Reminder: {employeeName}&apos;s cake order still needs your approval</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>🎂 CakeDay</Text>
          </Section>

          <Section style={content}>
            {/* Urgency banner */}
            <Section style={urgencyBanner}>
              <Text style={urgencyText}>
                ⏰ {daysUntilDelivery} {daysUntilDelivery === 1 ? "day" : "days"} until delivery
              </Text>
            </Section>

            <Heading style={h1}>
              Reminder: approve {employeeName}&apos;s birthday cake
            </Heading>
            <Text style={paragraph}>
              This order has been waiting for your approval for 5+ days.
              {daysUntilDelivery <= 3
                ? " Please approve it as soon as possible so we can dispatch on time."
                : " Don't forget to approve or skip it before the deadline."}
            </Text>

            <Section style={orderBox}>
              <Heading as="h2" style={h2}>Order Details</Heading>
              <Row>
                <Column style={labelCol}><Text style={label}>Employee</Text></Column>
                <Column><Text style={value}>{employeeName}</Text></Column>
              </Row>
              <Row>
                <Column style={labelCol}><Text style={label}>Delivery date</Text></Column>
                <Column><Text style={value}>{deliveryDate}</Text></Column>
              </Row>
              <Row>
                <Column style={labelCol}><Text style={label}>Cake type</Text></Column>
                <Column><Text style={value}>{cakeType}</Text></Column>
              </Row>
              <Row>
                <Column style={labelCol}><Text style={label}>Delivery address</Text></Column>
                <Column><Text style={value}>{deliveryAddress}</Text></Column>
              </Row>
            </Section>

            <Section style={buttonSection}>
              <Button style={approveButton} href={ordersUrl}>
                ✅ Approve Order Now
              </Button>
              <Button style={skipButton} href={ordersUrl}>
                Skip this order
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            CakeDay — Birthday cake deliveries, automated.
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
const urgencyBanner = { backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", padding: "10px 16px", marginBottom: "20px" }
const urgencyText = { color: "#c2410c", fontSize: "14px", fontWeight: "600", margin: "0" }
const h1 = { fontSize: "22px", fontWeight: "700", color: "#18181b", marginTop: "0" }
const h2 = { fontSize: "14px", fontWeight: "600", color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "12px" }
const paragraph = { color: "#52525b", fontSize: "15px", lineHeight: "24px" }
const orderBox = { backgroundColor: "#fafafa", border: "1px solid #e4e4e7", borderRadius: "8px", padding: "20px", margin: "24px 0" }
const labelCol = { width: "140px" }
const label = { color: "#71717a", fontSize: "13px", margin: "4px 0" }
const value = { color: "#18181b", fontSize: "14px", fontWeight: "500", margin: "4px 0" }
const buttonSection = { margin: "28px 0 16px" }
const approveButton = { backgroundColor: "#FF6B4A", color: "#fff", borderRadius: "6px", padding: "12px 28px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block", marginRight: "12px" }
const skipButton = { backgroundColor: "#f4f4f5", color: "#52525b", borderRadius: "6px", padding: "12px 28px", fontSize: "15px", fontWeight: "500", textDecoration: "none", display: "inline-block", border: "1px solid #e4e4e7" }
const hr = { borderColor: "#e4e4e7", margin: "24px 0" }
const footer = { color: "#a1a1aa", fontSize: "12px", textAlign: "center" as const, lineHeight: "20px" }
