import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { GameProvider } from './modules/arcade/context/GameContext'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
