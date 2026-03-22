import { createContext } from 'react'
import type { Expense, ExpenseInput } from '../types'

export type ExpenseContextValue = {
  expenses: Expense[]
  loading: boolean
  error: string | null
  addExpense: (expense: ExpenseInput) => Promise<void>
}

export const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined)

