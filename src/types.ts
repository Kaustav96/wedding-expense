import type { EXPENSE_CATEGORIES, FAMILY_MEMBERS, SIDES } from './constants'

export type Category = (typeof EXPENSE_CATEGORIES)[number]
export type Side = (typeof SIDES)[number]
export type FamilyMember = (typeof FAMILY_MEMBERS)[number]

export type AppUser = {
  uid: string
  email: string
  name: string
  side: Side
}

export type Expense = {
  id: string
  itemName: string
  category: Category
  amount: number
  paidBy: string
  side: Side
  createdAt: number
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>

export type UserProfile = {
  email: string
  name: string
  side: Side
  createdAt: number
}

