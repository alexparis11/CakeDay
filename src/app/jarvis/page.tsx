import type { Metadata } from "next"
import JarvisDashboard from "@/components/jarvis/JarvisDashboard"

export const metadata: Metadata = {
  title: "Jarvis — Command Center",
  description: "One dashboard for every business, run by a roster of specialized agents.",
}

export default function JarvisPage() {
  return <JarvisDashboard />
}
