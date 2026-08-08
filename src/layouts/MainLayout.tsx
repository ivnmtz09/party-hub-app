import { useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, Gamepad2, LayoutDashboard, Zap, Home } from 'lucide-react'
import SideDrawer from '../components/SideDrawer'
import BrandLogo from '../components/BrandLogo'
import NotificationBell from '../components/NotificationBell'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { observarGruposDelUsuario, type Grupo } from '../firebase/services'

const navItems = [
  { to: '/home', label: 'INICIO', icon: Home, gradient: 'from-yellow-300 to-amber-500 text-black' },
  { to: '/tablero', label: 'TABLERO', icon: LayoutDashboard, gradient: 'from-emerald-400 to-teal-600 text-white', requiresGroup: true },
  { to: '/mural', label: 'MURAL', icon: Zap, gradient: 'from-cyan-400 to-blue-600 text-white', requiresGroup: true },
  { to: '/arcade', label: 'ARCADE', icon: Gamepad2, gradient: 'from-fuchsia-500 to-pink-600 text-white' },
]

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuth()
  const { activeGroupId } = useNotification()
  const [userGroups, setUserGroups] = useState<Grupo[]>([])

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, setUserGroups)
    return unsub
  }, [user])

  const hasActiveGroup = userGroups.length > 0 || Boolean(activeGroupId)

  const visibleNavItems = navItems.filter(
    (item) => !item.requiresGroup || hasActiveGroup,
  )

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <header className="sticky top-0 z-30 bg-yellow-300 dark:bg-yellow-400 border-b-4 border-black dark:border-white">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <BrandLogo size="sm" />
          <NotificationBell />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-4 border-black dark:border-white flex justify-around items-stretch h-16 px-0 z-30">
        {visibleNavItems.map(({ to, label, icon: Icon, gradient }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-black uppercase tracking-wider transition-all border-r-2 border-black dark:border-white last:border-r-0 ${
                isActive
                  ? `bg-gradient-to-t ${gradient} shadow-[inset_0_-4px_0_0_rgba(0,0,0,1)] dark:shadow-[inset_0_-4px_0_0_rgba(255,255,255,1)]`
                  : 'bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
