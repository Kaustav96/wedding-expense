# BandBajaBudget

Responsive React + TypeScript app for tracking shared wedding expenses across 6 family members in real time.

## Features

- Login and registration pages powered by Firebase Authentication
- Access restricted to 6 approved family email accounts
- Bride-side and groom-side expense split with separate side budgets
- Context API shared state with live sync via Firebase Realtime Database
- Quick Glance dashboard cards for total budget, amount spent, and remaining balance
- Searchable expense table (item, category, amount, paid by)
- Mobile-first layout and touch-friendly controls
- GitHub Pages deployment scripts included

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Firebase Realtime Database
- gh-pages for deployment

## 1) Install dependencies

```bash
npm install
```

## 2) Connect Firebase configuration

1. Create a Firebase project in the Firebase console.
2. Enable **Authentication** -> **Email/Password** sign-in method.
3. Enable **Realtime Database** and start in test mode (or locked mode if you already have auth/rules).
4. In Firebase project settings, create a **Web App** and copy the config values.
5. Copy `.env.example` to `.env` and paste your values.

```bash
cp .env.example .env
```

Required env vars:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_BASE_PATH` (for GitHub Pages, use `/<repo-name>/`)

## 3) Run locally

```bash
npm run dev
```

Open the local URL printed by Vite. Share this URL with family only for local testing on your network.

## 4) Build production output

```bash
npm run build
```

## 5) Deploy to GitHub Pages

Before deploying:

1. Push this project to a GitHub repository.
2. Set the correct `VITE_BASE_PATH` in `.env` to match your repo (example: `/wedding-expense/`).
3. Ensure the repository is not private (or confirm your plan supports private Pages hosting).

Deploy command:

```bash
npm run deploy
```

This script builds the app and publishes `dist/` to the `gh-pages` branch.

## Approved family emails

Only these six emails can register/login:

- `harsh@bandbajabudget.com`
- `kavya@bandbajabudget.com`
- `ma@bandbajabudget.com`
- `baba@bandbajabudget.com`
- `didi@bandbajabudget.com`
- `jiju@bandbajabudget.com`

## Firebase data shape

Expenses are stored at `hkWeddingExpenses` as:

```json
{
  "bandBajaBudget": {
    "expenses": {
    "-FirebaseKey": {
      "itemName": "Saree",
      "category": "Clothing",
      "amount": 8500,
      "paidBy": "Kavya",
      "side": "bride",
      "createdAt": 1761000000000
    }
    }
  }
}
```

## Notes

- Update family member names in `src/constants.ts`.
- For production security, configure Realtime Database rules before sharing widely.
- Do not commit `.env` to git.

