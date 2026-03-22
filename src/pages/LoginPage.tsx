import { useState, type FormEvent } from 'react'
import { APP_NAME } from '../constants'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { login, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-900 to-indigo-900 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl sm:p-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-purple-700">Welcome</p>
        <h1 className="mt-2 text-center text-3xl font-extrabold text-slate-900">{APP_NAME}</h1>
        <p className="mt-1 text-center text-sm text-slate-600">Family-only wedding expense dashboard</p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          {authError ? <p className="text-sm font-medium text-rose-700">{authError}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>


      </div>
    </div>
  )
}

