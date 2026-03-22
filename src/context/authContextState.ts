import { createContext } from 'react'
import type { AppUser, Side } from '../types'

export type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, side: Side) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

