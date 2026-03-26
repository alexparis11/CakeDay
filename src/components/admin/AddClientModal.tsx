"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/useToast"

const schema = z.object({
  name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Valid email required"),
  headcount: z.coerce.number().min(1, "Headcount must be at least 1").max(50, "Max 50 employees (contact us for larger teams)"),
  default_cake_type: z.string().min(1, "Cake type is required"),
  default_delivery_notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AddClientModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { default_cake_type: "Vanilla Sponge" },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? "Failed to create client")
      }

      toast({ title: "Client created", description: `${data.name} has been added and a welcome email sent.` })
      reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create client",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="coral">
          <Plus className="h-4 w-4" />
          Add client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new client</DialogTitle>
          <DialogDescription>
            Create a company account and send a welcome email to the HR manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Company name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" placeholder="Acme Corp" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Contact name */}
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Contact name</Label>
            <Input id="contact_name" placeholder="Jane Smith" {...register("contact_name")} />
            {errors.contact_name && <p className="text-xs text-red-600">{errors.contact_name.message}</p>}
          </div>

          {/* Contact email */}
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">Contact email</Label>
            <Input id="contact_email" type="email" placeholder="hr@acmecorp.com" {...register("contact_email")} />
            {errors.contact_email && <p className="text-xs text-red-600">{errors.contact_email.message}</p>}
          </div>

          {/* Headcount */}
          <div className="space-y-1.5">
            <Label htmlFor="headcount">Employee headcount</Label>
            <Input id="headcount" type="number" min={1} max={50} placeholder="25" {...register("headcount")} />
            {errors.headcount && <p className="text-xs text-red-600">{errors.headcount.message}</p>}
            <p className="text-xs text-zinc-500">Starter plan: up to 20 (£49/mo) · Growth plan: up to 50 (£89/mo)</p>
          </div>

          {/* Default cake type */}
          <div className="space-y-1.5">
            <Label htmlFor="default_cake_type">Default cake type</Label>
            <Input id="default_cake_type" placeholder="Vanilla Sponge" {...register("default_cake_type")} />
            {errors.default_cake_type && <p className="text-xs text-red-600">{errors.default_cake_type.message}</p>}
          </div>

          {/* Default delivery notes */}
          <div className="space-y-1.5">
            <Label htmlFor="default_delivery_notes">Default delivery notes <span className="text-zinc-400">(optional)</span></Label>
            <Textarea
              id="default_delivery_notes"
              placeholder="Leave at reception. Ring bell."
              rows={2}
              {...register("default_delivery_notes")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="coral" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                "Create client"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
