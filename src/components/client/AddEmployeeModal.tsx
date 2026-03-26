"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/useToast"

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  birthday: z.string().regex(/^\d{2}-\d{2}$/, "Use MM-DD format (e.g. 03-25)"),
  delivery_address: z.string().min(5, "Delivery address is required"),
})
type FormData = z.infer<typeof schema>

interface AddEmployeeModalProps {
  companyId: string
}

export default function AddEmployeeModal({ companyId }: AddEmployeeModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, company_id: companyId }),
    })

    if (!res.ok) {
      toast({ title: "Error", description: "Failed to add employee.", variant: "destructive" })
      return
    }

    toast({ title: "Employee added", description: `${data.first_name} ${data.last_name} has been added.` })
    reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="coral" size="sm">
          <Plus className="h-4 w-4" />
          Add employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>Add a new employee to track birthday cake deliveries.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register("first_name")} placeholder="Jane" />
              {errors.first_name && <p className="text-xs text-red-600">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register("last_name")} placeholder="Smith" />
              {errors.last_name && <p className="text-xs text-red-600">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birthday">Birthday</Label>
            <Input id="birthday" {...register("birthday")} placeholder="MM-DD (e.g. 03-25)" />
            {errors.birthday && <p className="text-xs text-red-600">{errors.birthday.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delivery_address">Delivery address</Label>
            <Input id="delivery_address" {...register("delivery_address")} placeholder="123 Office Park, London" />
            {errors.delivery_address && <p className="text-xs text-red-600">{errors.delivery_address.message}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="coral" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</> : "Add employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
