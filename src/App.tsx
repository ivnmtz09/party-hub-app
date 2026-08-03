import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { GameProvider } from './modules/arcade/context/GameContext'
import { NeoToastProvider } from './components/NeoToast'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <GameProvider>
            <NeoToastProvider>
              <RouterProvider router={router} />
            </NeoToastProvider>
          </GameProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
