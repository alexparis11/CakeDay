import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from "@react-email/components"
import * as React from "react"

interface AdminOrderAlertProps {
  employeeName: string
  companyName: string
  deliveryDate: string
  cakeType: string
  deliveryAddress: string
  approvedAt: string
  orderId: string
}

export default function AdminOrderAlert({
  employeeName = "Sarah Johnson",
  companyName = "Acme Corp",
  deliveryDate = "Thursday, 2 April 2025",
  cakeType = "Vanilla Sponge",
  deliveryAddress = "123 Business Park, London, EC1A 1BB",
  approvedAt = "26 March 2025 at 09:14",
  orderId = "abc-123",
}: AdminOrderAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>🎂 New order approved: {employeeName} at {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>🎂 CakeDay — Bakery Dispatch</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              New order approved
            </Heading>
            <Text style={paragraph}>
              A client has approved a birthday cake order. Please add this to the bakery
              dispatch schedule for <strong>{deliveryDate}</strong>.
            </Text>

            {/* Dispatch card */}
            <Section style={dispatchCard}>
              <Heading as="h2" style={dispatchTitle}>📦 Dispatch Summary</Heading>

              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Order ID</Text></Column>
                <Column><Text style={value}>{orderId}</Text></Column>
              </Row>
              <Hr style={innerHr} />
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Recipient</Text></Column>
                <Column><Text style={valueStrong}>{employeeName}</Text></Column>
              </Row>
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Company</Text></Column>
                <Column><Text style={value}>{companyName}</Text></Column>
              </Row>
              <Hr style={innerHr} />
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Delivery date</Text></Column>
                <Column><Text style={valueStrong}>{deliveryDate}</Text></Column>
              </Row>
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Delivery address</Text></Column>
                <Column><Text style={value}>{deliveryAddress}</Text></Column>
              </Row>
              <Hr style={innerHr} />
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Cake type</Text></Column>
                <Column><Text style={valueStrong}>{cakeType}</Text></Column>
              </Row>
              <Hr style={innerHr} />
              <Row style={row}>
                <Column style={labelCol}><Text style={label}>Approved at</Text></Column>
                <Column><Text style={value}>{approvedAt}</Text></Column>
              </Row>
            </Section>

            <Text style={actionNote}>
              Mark this order as <strong>Dispatched</strong> in your CakeDay admin dashboard
              once the cake has been sent to the bakery.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            CakeDay Admin Alert — this email was sent automatically when a client approved an order.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: "#f4f4f5", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" }
const header = { backgroundColor: "#18181b", borderRadius: "8px 8px 0 0", padding: "24px 32px" }
const logo = { color: "#fff", fontSize: "18px", fontWeight: "700", margin: "0" }
const content = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 8px 8px", border: "1px solid #e4e4e7" }
const h1 = { fontSize: "22px", fontWeight: "700", color: "#18181b", marginTop: "0" }
const paragraph = { color: "#52525b", fontSize: "15px", lineHeight: "24px" }
const dispatchCard = { backgroundColor: "#fafafa", border: "2px solid #FF6B4A", borderRadius: "8px", padding: "20px", margin: "24px 0" }
const dispatchTitle = { fontSize: "15px", fontWeight: "700", color: "#FF6B4A", margin: "0 0 16px" }
const row = { marginBottom: "2px" }
const labelCol = { width: "140px" }
const label = { color: "#71717a", fontSize: "13px", margin: "4px 0" }
const value = { color: "#18181b", fontSize: "14px", margin: "4px 0" }
const valueStrong = { color: "#18181b", fontSize: "14px", fontWeight: "700", margin: "4px 0" }
const innerHr = { borderColor: "#e4e4e7", margin: "10px 0" }
const actionNote = { backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", padding: "12px 16px", color: "#c2410c", fontSize: "14px", lineHeight: "20px" }
const hr = { borderColor: "#e4e4e7", margin: "24px 0" }
const footer = { color: "#a1a1aa", fontSize: "12px", textAlign: "center" as const, lineHeight: "20px" }
