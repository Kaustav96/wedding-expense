import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { get, ref, set } from 'firebase/database'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ALLOWED_EMAILS, FAMILY_MEMBERS } from '../constants'
import { auth, db, firebaseInitError } from '../firebase'
import type { AppUser, Side, UserProfile } from '../types'
import { AuthContext } from './authContextState'

function findMemberByEmail(email: string) {
  return FAMILY_MEMBERS.find((member) => member.email.toLowerCase() === email.toLowerCase())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth || !db) {
      setError(firebaseInitError ?? 'Firebase is not configured. Please update your .env file.')
      setLoading(false)
      return
    }

    let unsubscribe: () => void = () => {}

    const firebaseAuth = auth
    const database = db

    unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.email) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const profileRef = ref(database, `users/${firebaseUser.uid}`)
        const snapshot = await get(profileRef)
        const profile = snapshot.val() as UserProfile | null
        const knownMember = findMemberByEmail(firebaseUser.email)

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile?.name ?? knownMember?.name ?? firebaseUser.email,
          side: profile?.side ?? knownMember?.side ?? 'groom',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load user profile.')
      } finally {
        setLoading(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error(firebaseInitError ?? 'Firebase authentication is not configured.')
    }

    const firebaseAuth = auth

    if (!ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
      throw new Error('This email is not authorized for BandBajaBudget.')
    }

    setError(null)
    await signInWithEmailAndPassword(firebaseAuth, email.trim().toLowerCase(), password)
  }, [])

  const register = useCallback(async (email: string, password: string, side: Side) => {
    if (!auth || !db) {
      throw new Error(firebaseInitError ?? 'Firebase authentication is not configured.')
    }

    const firebaseAuth = auth
    const database = db

    const normalizedEmail = email.trim().toLowerCase()

    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      throw new Error('Registration is limited to the 6 approved family accounts.')
    }

    const knownMember = findMemberByEmail(normalizedEmail)
    if (!knownMember) {
      throw new Error('Please pick one of the six approved family emails.')
    }

    setError(null)

    const cred = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password)
    const profileRef = ref(database, `users/${cred.user.uid}`)

    await set(profileRef, {
      email: normalizedEmail,
      name: knownMember.name,
      side,
      createdAt: Date.now(),
    } satisfies UserProfile)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) {
      throw new Error(firebaseInitError ?? 'Firebase authentication is not configured.')
    }

    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
    }),
    [error, loading, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


