import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

const rawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const inferredDatabaseURL =
  rawConfig.databaseURL ||
  (rawConfig.projectId ? `https://${rawConfig.projectId}-default-rtdb.firebaseio.com` : undefined)

const firebaseConfig = {
  ...rawConfig,
  databaseURL: inferredDatabaseURL,
}

const missingRequired = ['apiKey', 'projectId', 'appId'].filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig],
)

export let auth: Auth | null = null
export let db: Database | null = null
export let firebaseInitError: string | null = null

if (missingRequired.length > 0) {
  firebaseInitError =
    `Missing Firebase environment variable(s): ${missingRequired
      .map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (char) => `_${char}`).toUpperCase()}`)
      .join(', ')}`
} else {
  try {
    const app = initializeApp(firebaseConfig)
    const authInstance = getAuth(app)

    // Persist login across browser sessions and mobile app restarts
    void setPersistence(authInstance, browserLocalPersistence)

    auth = authInstance
    db = getDatabase(app, firebaseConfig.databaseURL)
  } catch (error) {
    firebaseInitError =
      error instanceof Error
        ? error.message
        : 'Unable to initialize Firebase. Check your .env configuration.'
  }
}
