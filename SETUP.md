# BandBajaBudget — Firebase Setup & Member Seeding

## Step 1: Update Firebase Security Rules

1. Go to **Firebase Console → Realtime Database**
2. Click **Rules** tab
3. Paste the contents of `FIREBASE_RULES.json` from this project
4. Click **Publish**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid"
      }
    },
    "bandBajaBudget": {
      "system": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "expenses": {
        "$side": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      },
      "sideBudgets": {
        "$side": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

## Step 2: Seed All 6 Family Members (One-time Setup)

### Option A: Use Browser Console (Easy)

1. Run the dev server:
```bash
npm run dev
```

2. Open browser at `http://localhost:5173`

3. Open **DevTools → Console**

4. Paste this code:
```javascript
import { seedAllMembers } from './src/scripts/seedMembers.ts'
await seedAllMembers()
```

Or access it directly:
```javascript
// In browser console after app loads:
window.seedAllMembers?.()
```

### Option B: Use Node Script (Alternative)

```bash
node -e "
const { seedAllMembers } = require('./src/scripts/seedMembers.ts');
seedAllMembers().then(() => console.log('Done!'));
"
```

### Expected Output

```
🔄 Starting member seeding...
✅ himasree@bandbajabudget.com (bride) - Created
✅ pinki@bandbajabudget.com (bride) - Created
✅ himadree@bandbajabudget.com (bride) - Created
✅ kb@bandbajabudget.com (groom) - Created
✅ anshu@bandbajabudget.com (groom) - Created
✅ kaustav@bandbajabudget.com (groom) - Created

✨ Seeding complete:
   Created: 6
   Existing: 0
   Failed: 0
```

## Step 3: Verify in Firebase Console

1. Go to **Firebase Console → Realtime Database**
2. Expand `users/` — you should see 6 accounts with profiles:
   ```
   users/
     [uid1]/
       email: "himasree@bandbajabudget.com"
       name: "Himasree Dam"
       side: "bride"
       createdAt: [timestamp]
     ...
   ```

## Step 4: Test Login

1. App at `http://localhost:5173`
2. Email: `kb@bandbajabudget.com`
3. Password: `Test@123`
4. Dashboard should load

## Credentials Summary

All 6 members use the same password: **`Test@123`**

| Name | Email | Side |
|------|-------|------|
| Himasree Dam | himasree@bandbajabudget.com | Bride |
| Pinki Dam | pinki@bandbajabudget.com | Bride |
| Himadree Dam | himadree@bandbajabudget.com | Bride |
| Krishnendu Banerjee | kb@bandbajabudget.com | Groom |
| Anshu Banerjee | anshu@bandbajabudget.com | Groom |
| Kaustav Banerjee | kaustav@bandbajabudget.com | Groom |

## Notes

- Seeding is **one-time only** — rerunning won't duplicate accounts
- Each side (bride/groom) sees only their own expenses
- Budgets are shared within each side
- All 6 members can login and edit shared side data

