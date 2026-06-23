import { useEffect, useState, useRef } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import ArcadePage from '../modules/arcade/pages/ArcadePage'
import CardGamePage from '../modules/arcade/pages/CardGamePage'
import GameLobbyPage from '../modules/game/pages/GameLobbyPage'
import ImpostorGameHub from '../modules/arcade/pages/ImpostorGameHub'
import TableroPage from '../modules/tablero/pages/TableroPage'
import LoginPage from '../components/LoginPage'
import SplashScreen from '../components/SplashScreen'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loading) {
      minTimer.current = setTimeout(() => {
        setShowSplash(false)
      }, 1500)
    }
    return () => {
      if (minTimer.current !== null) clearTimeout(minTimer.current)
    }
  }, [loading])

  if (showSplash || loading) {
    return <SplashScreen />
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/arcade" replace /> },
      { path: 'arcade', element: <ArcadePage /> },
      { path: 'tablero', element: <TableroPage /> },
    ],
  },
  {
    path: '/arcade/impostor',
    element: (
      <ProtectedRoute>
        <ImpostorGameHub />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/cartas/:deckId',
    element: (
      <ProtectedRoute>
        <CardGamePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/juego',
    element: (
      <ProtectedRoute>
        <GameLobbyPage />
      </ProtectedRoute>
    ),
  },
])
