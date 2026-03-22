import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onValue, push, ref } from 'firebase/database'
import { db, firebaseInitError } from '../firebase'
import type { Expense, ExpenseInput } from '../types'
import { ExpenseContext } from './expenseContextState'
import { useAuth } from './useAuth'

const EXPENSES_PATH = 'bandBajaBudget/expenses'

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !db) {
      return
    }

    const expensesRef = ref(db, `${EXPENSES_PATH}/${user.side}`)

    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const payload = snapshot.val() as Record<string, Omit<Expense, 'id'>> | null

        if (!payload) {
          setExpenses([])
          setError(null)
          return
        }

        const incoming = Object.entries(payload)
          .map(([id, value]) => ({ id, ...value }))
          .sort((a, b) => b.createdAt - a.createdAt)

        setExpenses(incoming)
        setError(null)
      },
      (firebaseError) => {
        setError(firebaseError.message)
      },
    )

    return () => unsubscribe()
  }, [user])

  const addExpense = useCallback(async (expense: ExpenseInput) => {
    if (!db) {
      throw new Error(firebaseInitError ?? 'Firebase is not configured. Please update your .env file.')
    }

    if (!user) {
      throw new Error('You must be logged in to add an expense.')
    }

    setError(null)
    if (expense.side !== user.side) {
      throw new Error('You can only add expenses for your own side.')
    }

    const expensesRef = ref(db, `${EXPENSES_PATH}/${user.side}`)

    await push(expensesRef, {
      ...expense,
      createdAt: Date.now(),
    })
  }, [user])

  const value = useMemo(
    () => ({
      expenses: user ? expenses : [],
      loading: false,
      error: user ? (db ? error : firebaseInitError ?? 'Firebase is not configured.') : null,
      addExpense,
    }),
    [addExpense, error, expenses, user],
  )

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}


