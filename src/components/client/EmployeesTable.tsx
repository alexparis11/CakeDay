"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatBirthday } from "@/lib/utils"
import type { Employee } from "@/types"
import { toast } from "@/hooks/useToast"

const editSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  birthday: z.string().regex(/^\d{2}-\d{2}$/, "Use MM-DD format"),
  delivery_address: z.string().min(1, "Required"),
})
type EditForm = z.infer<typeof editSchema>

interface EmployeesTableProps {
  employees: Employee[]
  companyId: string
}

export default function EmployeesTable({ employees, companyId }: EmployeesTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  })

  function startEdit(emp: Employee) {
    setEditingId(emp.id)
    reset({
      first_name: emp.first_name,
      last_name: emp.last_name,
      birthday: emp.birthday,
      delivery_address: emp.delivery_address,
    })
  }

  async function saveEdit(id: string, data: EditForm) {
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Update failed")
    setEditingId(null)
    router.refresh()
    toast({ title: "Employee updated" })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this employee? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      router.refresh()
      toast({ title: "Employee deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 border rounded-lg border-dashed border-zinc-300">
        <p className="font-medium">No employees yet</p>
        <p className="text-sm mt-1">Upload a CSV or add employees manually.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Name</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Birthday</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Delivery address</th>
            <th className="text-right px-4 py-3 font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {employees.map((emp) => (
            <tr key={emp.id} className={`hover:bg-zinc-50/50 transition-colors ${editingId === emp.id ? "bg-zinc-50" : ""}`}>
              {editingId === emp.id ? (
                // Edit row
                <>
                  <td className="px-4 py-2" colSpan={2}>
                    <form
                      id={`edit-${emp.id}`}
                      onSubmit={handleSubmit((d) => saveEdit(emp.id, d))}
                      className="flex gap-2"
                    >
                      <Input {...register("first_name")} placeholder="First name" className="h-8 text-xs" />
                      <Input {...register("last_name")} placeholder="Last name" className="h-8 text-xs" />
                      <Input {...register("birthday")} placeholder="MM-DD" className="h-8 text-xs w-24" />
                    </form>
                    {(errors.first_name || errors.last_name || errors.birthday) && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.first_name?.message || errors.last_name?.message || errors.birthday?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      {...register("delivery_address")}
                      placeholder="Delivery address"
                      className="h-8 text-xs"
                      form={`edit-${emp.id}`}
                    />
                    {errors.delivery_address && (
                      <p className="text-xs text-red-600">{errors.delivery_address.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="submit"
                        form={`edit-${emp.id}`}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-zinc-400"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </>
              ) : (
                // Display row
                <>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {emp.first_name} {emp.last_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{formatBirthday(emp.birthday)}</td>
                  <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{emp.delivery_address}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                        onClick={() => startEdit(emp)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600"
                        onClick={() => handleDelete(emp.id)}
                        disabled={deletingId === emp.id}
                      >
                        {deletingId === emp.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
