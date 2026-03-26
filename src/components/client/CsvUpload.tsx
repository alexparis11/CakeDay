"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { CsvEmployeeRow } from "@/types"
import { isValidBirthday } from "@/lib/utils"
import { toast } from "@/hooks/useToast"

interface CsvUploadProps {
  companyId: string
}

function parseCsvClient(text: string): { rows: CsvEmployeeRow[]; errors: string[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return { rows: [], errors: ["CSV file is empty"] }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const required = ["first_name", "last_name", "birthday", "delivery_address"]
  const missing = required.filter((r) => !headers.includes(r))

  if (missing.length > 0) {
    return { rows: [], errors: [`Missing columns: ${missing.join(", ")}`] }
  }

  const rows: CsvEmployeeRow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? "" })

    const csvRow: CsvEmployeeRow = {
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      birthday: row.birthday ?? "",
      delivery_address: row.delivery_address ?? "",
      _rowIndex: i,
    }

    if (!csvRow.first_name) csvRow._error = "Missing first_name"
    else if (!csvRow.last_name) csvRow._error = "Missing last_name"
    else if (!isValidBirthday(csvRow.birthday)) csvRow._error = `Invalid birthday "${csvRow.birthday}"`
    else if (!csvRow.delivery_address) csvRow._error = "Missing delivery_address"

    rows.push(csvRow)
    if (csvRow._error) errors.push(`Row ${i}: ${csvRow._error}`)
  }

  return { rows, errors }
}

export default function CsvUpload({ companyId }: CsvUploadProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<CsvEmployeeRow[] | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const { rows, errors } = parseCsvClient(text)
      setPreview(rows)
      setParseErrors(errors)
    }
    reader.readAsText(file)
  }

  function handleClear() {
    setPreview(null)
    setParseErrors([])
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleConfirm() {
    if (!preview) return
    const validRows = preview.filter((r) => !r._error)
    if (validRows.length === 0) {
      toast({ title: "No valid rows", description: "Fix the errors first.", variant: "destructive" })
      return
    }

    setUploading(true)
    try {
      const res = await fetch("/api/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, rows: validRows }),
      })

      if (!res.ok) throw new Error("Upload failed")
      const { inserted } = await res.json()

      toast({ title: `${inserted} employee${inserted !== 1 ? "s" : ""} added`, description: "Your employee list has been updated." })
      handleClear()
      router.refresh()
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const validCount = preview?.filter((r) => !r._error).length ?? 0
  const errorCount = preview?.filter((r) => r._error).length ?? 0

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!preview && (
        <div
          className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#FF6B4A]/50 hover:bg-[#FF6B4A]/5 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
          <p className="font-medium text-zinc-700">Click to upload a CSV file</p>
          <p className="text-xs text-zinc-500 mt-1">
            Required columns: first_name, last_name, birthday (MM-DD), delivery_address
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="approved">{validCount} valid rows</Badge>
            {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
            <button onClick={handleClear} className="ml-auto text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1">
              <X className="h-3 w-3" /> Clear
            </button>
          </div>

          {/* Error list */}
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fix these errors before importing</AlertTitle>
              <AlertDescription>
                <ul className="mt-1 space-y-0.5">
                  {parseErrors.map((e, i) => <li key={i} className="text-xs">{e}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Table preview */}
          <div className="overflow-x-auto rounded-lg border border-zinc-200 max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-zinc-500">#</th>
                  <th className="text-left px-3 py-2 font-medium text-zinc-500">Name</th>
                  <th className="text-left px-3 py-2 font-medium text-zinc-500">Birthday</th>
                  <th className="text-left px-3 py-2 font-medium text-zinc-500">Address</th>
                  <th className="text-left px-3 py-2 font-medium text-zinc-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {preview.map((row, i) => (
                  <tr key={i} className={row._error ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 text-zinc-400">{row._rowIndex}</td>
                    <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
                    <td className="px-3 py-2">{row.birthday}</td>
                    <td className="px-3 py-2 max-w-[160px] truncate">{row.delivery_address}</td>
                    <td className="px-3 py-2">
                      {row._error ? (
                        <span className="text-red-600 text-xs">{row._error}</span>
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>Cancel</Button>
            <Button
              variant="coral"
              size="sm"
              onClick={handleConfirm}
              disabled={uploading || validCount === 0}
            >
              {uploading ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Importing…</>
              ) : (
                `Import ${validCount} employee${validCount !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
