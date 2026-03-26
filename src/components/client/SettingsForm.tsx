"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Company } from "@/types"
import { toast } from "@/hooks/useToast"

const schema = z.object({
  default_cake_type: z.string().min(1, "Cake type is required"),
  default_delivery_notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface SettingsFormProps {
  company: Company
}

export default function SettingsForm({ company }: SettingsFormProps) {
  const router = useRouter()
  const [loadingPortal, setLoadingPortal] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      default_cake_type: company.default_cake_type,
      default_delivery_notes: company.default_delivery_notes ?? "",
    },
  })

  async function onSubmit(data: FormData) {
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
      return
    }
    toast({ title: "Settings saved" })
    router.refresh()
  }

  async function handleBillingPortal() {
    setLoadingPortal(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      if (!res.ok) throw new Error("Failed to get portal URL")
      const { url } = await res.json()
      window.location.href = url
    } catch {
      toast({ title: "Error", description: "Could not open billing portal.", variant: "destructive" })
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      {/* Default delivery settings */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Delivery defaults</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="default_cake_type">Default cake type</Label>
            <Input
              id="default_cake_type"
              placeholder="Vanilla Sponge"
              {...register("default_cake_type")}
            />
            {errors.default_cake_type && (
              <p className="text-xs text-red-600">{errors.default_cake_type.message}</p>
            )}
            <p className="text-xs text-zinc-500">
              Used as the default cake for all new birthday orders.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="default_delivery_notes">Default delivery notes</Label>
            <Textarea
              id="default_delivery_notes"
              placeholder="e.g. Leave at reception. Ring bell."
              rows={3}
              {...register("default_delivery_notes")}
            />
          </div>

          <Button
            type="submit"
            variant="coral"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </section>

      {/* Billing */}
      <section className="pt-4 border-t border-zinc-200">
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Subscription & billing</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Manage your payment method, view invoices, and update your plan.
        </p>

        <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50 mb-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">Current subscription</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {company.headcount <= 20 ? "Starter plan — £49/mo" : "Growth plan — £89/mo"}
            </p>
          </div>
          <Badge variant={company.subscription_status as "active" | "inactive"}>
            {company.subscription_status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Button
          variant="outline"
          onClick={handleBillingPortal}
          disabled={loadingPortal || !company.stripe_customer_id}
        >
          {loadingPortal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Manage billing
        </Button>
        {!company.stripe_customer_id && (
          <p className="text-xs text-zinc-400 mt-1">Billing not yet configured. Contact your administrator.</p>
        )}
      </section>
    </div>
  )
}
