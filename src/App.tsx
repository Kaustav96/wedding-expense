import { useAuth } from './context/useAuth'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <p className="text-lg font-semibold">Loading BandBajaBudget...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <DashboardPage />
}

export default App
