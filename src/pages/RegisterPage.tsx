import { useMemo, useState, type FormEvent } from 'react'
import { APP_NAME, FAMILY_MEMBERS } from '../constants'
import { useAuth } from '../context/useAuth'
import type { Side } from '../types'

type RegisterPageProps = {
  onSwitchToLogin: () => void
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMember = useMemo(
    () => FAMILY_MEMBERS.find((member) => member.email === email),
    [email],
  )

  const selectedSide = (selectedMember?.side ?? 'groom') as Side

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await register(email, password, selectedSide)
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-900 to-indigo-900 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl sm:p-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-purple-700">Create Access</p>
        <h1 className="mt-2 text-center text-3xl font-extrabold text-slate-900">{APP_NAME}</h1>
        <p className="mt-1 text-center text-sm text-slate-600">Registration is restricted to 6 approved family accounts</p>

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <label className="block text-sm font-medium text-slate-700">
            Family email
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            >
              <option value="">Select your account</option>
              {FAMILY_MEMBERS.map((member) => (
                <option key={member.id} value={member.email}>
                  {member.name} ({member.side})
                </option>
              ))}
            </select>
          </label>

          {selectedMember ? (
            <p className="rounded-xl bg-purple-50 px-3 py-2 text-sm text-purple-700">
              You will be assigned to <span className="font-semibold capitalize">{selectedMember.side}</span> side.
            </p>
          ) : null}

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create password"
              autoComplete="new-password"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </label>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          {authError ? <p className="text-sm font-medium text-rose-700">{authError}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{' '}
          <button className="font-semibold text-purple-700 underline" onClick={onSwitchToLogin} type="button">
            Back to login
          </button>
        </p>
      </div>
    </div>
  )
}

