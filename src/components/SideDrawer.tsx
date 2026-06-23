import { useEffect, useRef } from 'react'
import { X, LogOut, Sun, Moon, Code, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SideDrawer({ open, onClose }: Props) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/70 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-gray-900 border-r-4 border-black dark:border-white transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400">
            <h2 className="text-lg font-black uppercase tracking-wider text-black dark:text-gray-900">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-1 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-6">
            <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800">
              <div className="w-10 h-10 bg-yellow-300 dark:bg-yellow-400 border-2 border-black dark:border-white flex items-center justify-center text-sm font-black text-black dark:text-gray-900">
                {(user?.displayName ?? user?.email ?? '?')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white truncate">
                  {user?.displayName ?? 'Invitado'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 font-black uppercase tracking-wider text-sm text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>

          <div className="p-4 border-t-4 border-black dark:border-white space-y-3">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-red-500 text-white font-black uppercase tracking-wider text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>Cerrar sesion</span>
            </button>

            <div className="border-t-4 border-black dark:border-white p-4 -mx-4 -mb-4 bg-gray-200 dark:bg-gray-800">
              <span className="block font-black uppercase text-sm text-black dark:text-white mb-1">
                Creado por:{' '}
                <a
                  href="https://www.instagram.com/ivjmm.0109/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-black dark:text-white hover:underline underline-offset-2"
                >
                  <ExternalLink size={14} strokeWidth={2.5} />
                  Ivn Mtz
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                <Code size={12} strokeWidth={2.5} />
                Version Beta 1.0.1
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
