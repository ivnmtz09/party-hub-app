import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Menu, Gamepad2, LayoutDashboard } from 'lucide-react'
import SideDrawer from '../components/SideDrawer'

const navItems = [
  { to: '/arcade', label: 'Arcade', icon: Gamepad2 },
  { to: '/tablero', label: 'Tablero', icon: LayoutDashboard },
]

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

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
          <h1 className="text-lg font-black uppercase tracking-wider text-black dark:text-gray-900">
            Party Hub
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-4 border-black dark:border-white flex justify-around items-center h-16 px-4 z-30">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'text-black dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
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
