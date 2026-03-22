import { onValue, ref, set } from 'firebase/database'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  APP_NAME,
  EXPENSE_CATEGORIES,
} from '../constants'
import { useAuth } from '../context/useAuth'
import { useExpenses } from '../context/useExpenses'
import { db } from '../firebase'
import type { Category } from '../types'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { expenses, loading, error, addExpense } = useExpenses()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sideBudget, setSideBudget] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    itemName: '',
    category: EXPENSE_CATEGORIES[0] as Category,
    amount: '',
    side: user?.side ?? 'groom',
  })

  const amountSpent = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses])

  const remainingBalance = sideBudget - amountSpent

  useEffect(() => {
    if (!db || !user) {
      return
    }

    const budgetRef = ref(db, `bandBajaBudget/sideBudgets/${user.side}`)
    const unsubscribe = onValue(budgetRef, (snapshot) => {
      const remoteBudget = snapshot.val() as number | null
      if (typeof remoteBudget === 'number' && Number.isFinite(remoteBudget)) {
        setSideBudget(remoteBudget)
      }
    })

    return () => unsubscribe()
  }, [user])

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const searchable = `${expense.itemName} ${expense.category} ${expense.paidBy}`.toLowerCase()
        const matchesSearch = searchable.includes(searchTerm.toLowerCase())
        return matchesSearch
      }),
    [expenses, searchTerm],
  )

  async function handleBudgetSave() {
    if (!db || !user) {
      return
    }

    setIsSavingBudget(true)
    try {
      await set(ref(db, `bandBajaBudget/sideBudgets/${user.side}`), sideBudget)
    } finally {
      setIsSavingBudget(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!formData.itemName.trim()) {
      setFormError('Please enter an item name.')
      return
    }

    const amountValue = Number(formData.amount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Please enter a valid amount greater than zero.')
      return
    }

    if (!user) {
      setFormError('Please login again.')
      return
    }

    setIsSaving(true)

    try {
      await addExpense({
        itemName: formData.itemName.trim(),
        category: formData.category,
        amount: amountValue,
        paidBy: user.name,
        side: formData.side,
      })

      setFormData({
        itemName: '',
        category: EXPENSE_CATEGORIES[0],
        amount: '',
        side: user.side,
      })
      setIsModalOpen(false)
    } catch {
      setFormError('Unable to save this expense right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{APP_NAME}</h1>
            <p className="text-xs text-slate-500">Smart wedding expense tracker for both families</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs capitalize text-violet-600">{user?.side} side</p>
            </div>
            <button
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Add Expense
            </button>
            <button
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
              onClick={() => {
                void logout()
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 pb-10">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Quick Glance</h2>
            <p className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold capitalize text-violet-700">
              {user?.side} side only
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard title="Your Side Budget" value={currencyFormatter.format(sideBudget)} />
            <StatCard title="Your Side Spent" value={currencyFormatter.format(amountSpent)} />
            <StatCard
              title="Your Side Remaining"
              value={currencyFormatter.format(remainingBalance)}
              tone={remainingBalance < 0 ? 'danger' : 'default'}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Update Your Budget
              <input
                type="number"
                min={0}
                value={sideBudget}
                onChange={(event) => setSideBudget(Number(event.target.value) || 0)}
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-right"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                void handleBudgetSave()
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isSavingBudget}
            >
              {isSavingBudget ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900 capitalize">{user?.side} Side Expenses</h2>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search item, category, or paid by"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:max-w-sm"
            />
          </div>

          {loading ? <p className="py-4">Loading expenses...</p> : null}
          {error ? <p className="py-4 text-rose-700">{error}</p> : null}

          {!loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Paid By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm sm:text-base">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 font-medium">{expense.itemName}</td>
                      <td className="px-4 py-3">{expense.category}</td>
                      <td className="px-4 py-3">{currencyFormatter.format(expense.amount)}</td>
                      <td className="px-4 py-3">{expense.paidBy}</td>
                    </tr>
                  ))}

                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                        No expenses found for this side.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-4 sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add New Expense</h3>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium">
                Item Name
                <input
                  required
                  value={formData.itemName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, itemName: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-medium">
                Category
                <select
                  value={formData.category}
                  onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value as Category }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Side
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 capitalize"
                  value={user?.side ?? formData.side}
                  disabled
                />
              </label>

              <label className="block text-sm font-medium">
                Amount (INR)
                <input
                  required
                  min={1}
                  type="number"
                  value={formData.amount}
                  onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </label>

              <label className="block text-sm font-medium">
                Paid By
                <input className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3" value={user?.name ?? ''} disabled />
              </label>

              {formError ? <p className="text-sm text-rose-700">{formError}</p> : null}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  tone?: 'default' | 'danger'
}

function StatCard({ title, value, tone = 'default' }: StatCardProps) {
  const valueTone = tone === 'danger' ? 'text-rose-700' : 'text-violet-700'

  return (
    <article className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueTone}`}>{value}</p>
    </article>
  )
}





