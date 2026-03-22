import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from '../firebase'

const FAMILY_MEMBERS = [
  { name: 'Himasree Dam',       email: 'himasree@bandbajabudget.com', password: 'Test@123', side: 'bride' },
  { name: 'Pinki Dam',          email: 'pinki@bandbajabudget.com',    password: 'Test@123', side: 'bride' },
  { name: 'Himadree Dam',       email: 'himadree@bandbajabudget.com', password: 'Test@123', side: 'bride' },
  { name: 'Krishnendu Banerjee',email: 'kb@bandbajabudget.com',       password: 'Test@123', side: 'groom' },
  { name: 'Anshu Banerjee',     email: 'anshu@bandbajabudget.com',    password: 'Test@123', side: 'groom' },
  { name: 'Kaustav Banerjee',   email: 'kaustav@bandbajabudget.com',  password: 'Test@123', side: 'groom' },
]

async function seedAllMembers() {
  if (!auth || !db) {
    console.error('❌ Firebase not initialised. Check your .env file.')
    return
  }

  console.log('🔄 Starting member seeding...')

  const results = { created: 0, existing: 0, failed: 0 }

  for (const member of FAMILY_MEMBERS) {
    let uid: string | null = null

    try {
      const cred = await createUserWithEmailAndPassword(auth, member.email, member.password)
      uid = cred.user.uid
      console.log(`✅ ${member.email} (${member.side}) — Created`)
      results.created++
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''

      if (code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, member.email, member.password)
          uid = cred.user.uid
          console.log(`⏭️  ${member.email} — Already exists, syncing profile`)
          results.existing++
        } catch {
          console.error(`❌ ${member.email} — Password mismatch, skip`)
          results.failed++
          continue
        }
      } else {
        console.error(`❌ ${member.email} — ${code}`)
        results.failed++
        continue
      }
    }

    if (!uid) continue

    await set(ref(db, `users/${uid}`), {
      email: member.email,
      name: member.name,
      side: member.side,
      createdAt: Date.now(),
    })
  }

  await signOut(auth)

  console.log(`\n✨ Seeding complete:`)
  console.log(`   Created:  ${results.created}`)
  console.log(`   Existing: ${results.existing}`)
  console.log(`   Failed:   ${results.failed}`)
}

declare global {
  interface Window {
    seedAllMembers?: () => Promise<void>
  }
}

if (typeof window !== 'undefined') {
  window.seedAllMembers = seedAllMembers
}

export { seedAllMembers }
