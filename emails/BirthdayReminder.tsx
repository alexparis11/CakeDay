import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface BirthdayReminderProps {
  employeeName: string
  deliveryDate: string
  cakeType: string
  deliveryAddress: string
  orderId: string
  appUrl: string
}

export default function BirthdayReminder({
  employeeName = "Sarah Johnson",
  deliveryDate = "Thursday, 2 April 2025",
  cakeType = "Vanilla Sponge",
  deliveryAddress = "123 Business Park, London, EC1A 1BB",
  orderId = "order-id",
  appUrl = "https://app.yourcakeday.com",
}: BirthdayReminderProps) {
  const ordersUrl = `${appUrl}/orders`

  return (
    <Html>
      <Head />
      <Preview>🎂 {employeeName}&apos;s birthday is in 7 days — approve their cake order</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>🎂 CakeDay</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h1}>
              {employeeName}&apos;s birthday is in 7 days
            </Heading>
            <Text style={paragraph}>
              A birthday is coming up! Please review and approve the cake order below so
              we can arrange delivery in time.
            </Text>

            {/* Order summary */}
            <Section style={orderBox}>
              <Heading as="h2" style={h2}>Order Summary</Heading>
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Employee</Text>
                </Column>
                <Column>
                  <Text style={value}>{employeeName}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Delivery date</Text>
                </Column>
                <Column>
                  <Text style={value}>{deliveryDate}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Cake type</Text>
                </Column>
                <Column>
                  <Text style={value}>{cakeType}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={labelCol}>
                  <Text style={label}>Delivery address</Text>
                </Column>
                <Column>
                  <Text style={value}>{deliveryAddress}</Text>
                </Column>
              </Row>
            </Section>

            {/* CTA buttons */}
            <Section style={buttonSection}>
              <Button style={approveButton} href={ordersUrl}>
                ✅ Approve Order
              </Button>
              <Button style={skipButton} href={ordersUrl}>
                Skip this order
              </Button>
            </Section>

            <Text style={smallText}>
              You can also manage this order from your{" "}
              <a href={ordersUrl} style={link}>CakeDay dashboard</a>.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            CakeDay — Birthday cake deliveries, automated.
            <br />
            You&apos;re receiving this because you manage a CakeDay account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const main = { backgroundColor: "#f4f4f5", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" }
const header = { backgroundColor: "#FF6B4A", borderRadius: "8px 8px 0 0", padding: "24px 32px" }
const logo = { color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0" }
const content = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 8px 8px", border: "1px solid #e4e4e7" }
const h1 = { fontSize: "22px", fontWeight: "700", color: "#18181b", marginTop: "0" }
const h2 = { fontSize: "14px", fontWeight: "600", color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "12px" }
const paragraph = { color: "#52525b", fontSize: "15px", lineHeight: "24px" }
const orderBox = { backgroundColor: "#fafafa", border: "1px solid #e4e4e7", borderRadius: "8px", padding: "20px", margin: "24px 0" }
const labelCol = { width: "140px" }
const label = { color: "#71717a", fontSize: "13px", margin: "4px 0" }
const value = { color: "#18181b", fontSize: "14px", fontWeight: "500", margin: "4px 0" }
const buttonSection = { margin: "28px 0 16px", display: "flex", gap: "12px" }
const approveButton = { backgroundColor: "#FF6B4A", color: "#fff", borderRadius: "6px", padding: "12px 28px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block", marginRight: "12px" }
const skipButton = { backgroundColor: "#f4f4f5", color: "#52525b", borderRadius: "6px", padding: "12px 28px", fontSize: "15px", fontWeight: "500", textDecoration: "none", display: "inline-block", border: "1px solid #e4e4e7" }
const smallText = { color: "#71717a", fontSize: "13px" }
const link = { color: "#FF6B4A" }
const hr = { borderColor: "#e4e4e7", margin: "24px 0" }
const footer = { color: "#a1a1aa", fontSize: "12px", textAlign: "center" as const, lineHeight: "20px" }
