import { useEffect, useState, useRef } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import ArcadePage from '../modules/arcade/pages/ArcadePage'
import CardGamePage from '../modules/arcade/pages/CardGamePage'
import RouletaPage from '../modules/arcade/pages/RouletaPage'
import BombaPage from '../modules/arcade/pages/BombaPage'
import DedoLlagaLobby from '../modules/arcade/pages/DedoLlagaLobby'
import CodigoSecretoLobby from '../modules/arcade/pages/CodigoSecretoLobby'
import FrenteLobby from '../modules/arcade/pages/FrenteLobby'
import ImpostorGameHub from '../modules/arcade/pages/ImpostorGameHub'
import TableroPage from '../modules/tablero/pages/TableroPage'
import HistorialPage from '../modules/tablero/pages/HistorialPage'
import MuralPage from '../modules/mural/pages/MuralPage'
import HomePage from '../modules/home/pages/Home'
import NotFound from '../pages/NotFound'
import RegistroPage from '../pages/RegistroPage'
import ProfilePage from '../modules/profile/pages/ProfilePage'
import AdminPage from '../pages/AdminPage'
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
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'arcade', element: <ArcadePage /> },
      { path: 'tablero', element: <TableroPage /> },
      { path: 'mural', element: <MuralPage /> },
      { path: 'perfil', element: <ProfilePage /> },
      { path: 'historial', element: <HistorialPage /> },
      { path: 'admin', element: <AdminPage /> },
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
        <DedoLlagaLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/rouleta',
    element: (
      <ProtectedRoute>
        <RouletaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/bomba',
    element: (
      <ProtectedRoute>
        <BombaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/codigo-secreto',
    element: (
      <ProtectedRoute>
        <CodigoSecretoLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/arcade/frente-a-frente',
    element: (
      <ProtectedRoute>
        <FrenteLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/registro/:id',
    element: (
      <ProtectedRoute>
        <RegistroPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
