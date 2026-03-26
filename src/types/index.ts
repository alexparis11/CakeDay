import type { Database, UserRole, SubscriptionStatus, OrderStatus } from "./database"

export type { UserRole, SubscriptionStatus, OrderStatus }

export type Company = Database["public"]["Tables"]["companies"]["Row"]
export type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"]
export type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"]

export type User = Database["public"]["Tables"]["users"]["Row"]

export type Employee = Database["public"]["Tables"]["employees"]["Row"]
export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"]
export type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"]

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]

// Joined types used across pages
export type OrderWithEmployee = Order & {
  employees: Pick<Employee, "first_name" | "last_name" | "birthday"> | null
}

export type OrderWithCompany = Order & {
  companies: Pick<Company, "name"> | null
  employees: Pick<Employee, "first_name" | "last_name"> | null
}

export type CompanyWithOrderCount = Company & {
  upcoming_orders_count?: number
}

// CSV row shape for employee upload
export type CsvEmployeeRow = {
  first_name: string
  last_name: string
  birthday: string
  delivery_address: string
  _rowIndex?: number
  _error?: string
}

// Session user shape (augmented auth user)
export type SessionUser = {
  id: string
  email: string
  role: UserRole
  company_id: string | null
  company_name?: string
}
