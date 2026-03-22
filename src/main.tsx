import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { ExpenseProvider } from './context/ExpenseContext.tsx'
import { seedAllMembers } from './scripts/seedMembers.ts'

// Make seeder available in browser DevTools console
window.seedAllMembers = seedAllMembers

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ExpenseProvider>
        <App />
      </ExpenseProvider>
    </AuthProvider>
  </StrictMode>,
)
