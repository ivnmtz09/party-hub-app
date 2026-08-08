import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'
import {
  observarGruposDelUsuario,
  observarMiembros,
  registrarEvento,
  observarEventos,
  type Grupo,
  type Miembro,
  type Evento,
} from '../../../firebase/services'
import StatsChart from '../components/StatsChart'
import RecentActivity from '../components/RecentActivity'
import RecordInlineForm from '../components/RecordInlineForm'
import Skeleton from '../../../components/Skeleton'
import {
  playOpenSound,
  playSuccessSound,
} from '../../../utils/audio'
import GroupSelector from '../../../components/GroupSelector'

export default function TableroPage() {
  const { user } = useAuth()
  const { activeGroupId, setActiveGroupId } = useNotification()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInlineForm, setShowInlineForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [timeFilter, setTimeFilter] = useState<string>('mes_actual')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  useEffect(() => {
    if (eventos.length === 0) return
    const unique = new Set<string>()
    const d = new Date()
    const currentMonthStr = `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`

    eventos.forEach((e) => {
      if (!e.timestamp) return
      const date = typeof (e.timestamp as any).toDate === 'function'
        ? (e.timestamp as any).toDate()
        : new Date(e.timestamp as any)
      if (!isNaN(date.getTime())) {
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const y = date.getFullYear()
        const key = `${m}-${y}`
        if (key !== currentMonthStr) {
          unique.add(key)
        }
      }
    })
    const sorted = Array.from(unique).sort((a, b) => {
      const partsA = a.split('-').map(Number)
      const partsB = b.split('-').map(Number)
      const ma = partsA[0] ?? 1
      const ya = partsA[1] ?? 2026
      const mb = partsB[0] ?? 1
      const yb = partsB[1] ?? 2026
      return (yb * 12 + mb) - (ya * 12 + ma)
    })
    setAvailableMonths(sorted)
  }, [eventos])

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      setInitialized(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!activeGroupId || !user) return

    const unsubMiembros = observarMiembros(activeGroupId, (list) => {
      setMiembros(list)
      setContentLoading(false)
    })
    const unsubEventos = observarEventos(activeGroupId, setEventos)
    return () => {
      unsubMiembros()
      unsubEventos()
    }
  }, [activeGroupId, user])

  const activeGroup = grupos.find((g) => g.id === activeGroupId)

  const handleRecordSave = async (
    tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada',
    data: { rating: number; note: string; photoUrl: string },
  ) => {
    if (!user || !activeGroupId) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await registrarEvento(user.uid, tipo, data)
      playSuccessSound()
    } catch {
      setErrorMsg('Error al registrar el evento')
      setTimeout(() => setErrorMsg(''), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const chartEventos = useMemo(() => {
    const ahora = new Date()
    return eventos.filter((e) => {
      if (!e.timestamp) return false
      const date = typeof (e.timestamp as any).toDate === 'function'
        ? (e.timestamp as any).toDate()
        : new Date(e.timestamp as any)
      if (isNaN(date.getTime())) return false

      if (timeFilter === 'hoy') {
        return date.getFullYear() === ahora.getFullYear() &&
               date.getMonth() === ahora.getMonth() &&
               date.getDate() === ahora.getDate()
      }
      if (timeFilter === 'semana') {
        const dayOfWeek = ahora.getDay()
        const inicioSemana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ((dayOfWeek + 6) % 7))
        inicioSemana.setHours(0, 0, 0, 0)
        return date >= inicioSemana && date <= ahora
      }
      if (timeFilter === 'mes_actual') {
        return date.getMonth() === ahora.getMonth() &&
               date.getFullYear() === ahora.getFullYear()
      }
      if (timeFilter === 'siempre') {
        return true
      }
      // Formato MM-YYYY
      const parts = timeFilter.split('-')
      const targetMonth = parts[0]
      const targetYear = parts[1]
      const mStr = String(date.getMonth() + 1).padStart(2, '0')
      const yStr = String(date.getFullYear())
      return mStr === targetMonth && yStr === targetYear
    })
  }, [eventos, timeFilter])

  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in-up">
        <div className="h-10 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
          <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
          <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
        </div>
        <div className="h-48 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
        <Skeleton variant="listItem" count={3} />
      </div>
    )
  }

  if (!activeGroup) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-black uppercase tracking-wider text-center text-black dark:text-white">
          Tablero Social
        </h2>
        <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400">
          No tienes un grupo activo seleccionado.
        </p>
        <Link
          to="/home"
          className="w-full flex items-center justify-center gap-3 py-4 border-4 border-black dark:border-white bg-gradient-to-r from-yellow-300 to-amber-500 text-black font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-y-1 active:shadow-none transition-all"
        >
          IR A HOME PARA SELECCIONAR UN GRUPO
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Tablero
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 font-bold uppercase tracking-wider text-sm">
        REGISTRO DE ACTIVIDADES
      </p>

      <GroupSelector grupos={grupos} activeGroupId={activeGroupId} setActiveGroupId={setActiveGroupId} />

      {errorMsg && (
        <p className="text-red-600 font-black text-sm text-center uppercase tracking-wider bg-red-100 dark:bg-red-900/30 border-2 border-red-600 py-2 px-4">
          {errorMsg}
        </p>
      )}

      {contentLoading ? (
        <Skeleton variant="listItem" count={5} />
      ) : (
        <StatsChart
          miembros={miembros}
          eventos={chartEventos}
          timeFilter={timeFilter}
          availableMonths={availableMonths}
          onTimeFilterChange={setTimeFilter}
        />
      )}

      <button
        onClick={() => { playOpenSound(); setShowInlineForm(!showInlineForm) }}
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-gradient-to-r from-emerald-400 to-teal-600 text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg ${showInlineForm ? 'border-b-0 rounded-b-none' : ''}`}
      >
        {showInlineForm ? <X size={24} strokeWidth={2.5} /> : <Plus size={24} strokeWidth={2.5} />}
        {showInlineForm ? 'CERRAR' : 'CREAR NUEVO REGISTRO'}
      </button>

      {showInlineForm && (
        <RecordInlineForm
          groupId={activeGroupId ?? ''}
          userId={user?.uid ?? ''}
          onClose={() => setShowInlineForm(false)}
          onSave={handleRecordSave}
        />
      )}

      <RecentActivity
        miembros={miembros}
        userId={user?.uid ?? ''}
        groupId={activeGroupId ?? ''}
        totalEventosCount={eventos.length}
      />



      <Link
        to="/historial"
        className="w-full flex items-center justify-center py-3 px-4 border-4 border-black dark:border-white bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        {eventos.length >= 300 ? 'VER ÚLTIMOS 300 REGISTROS' : 'VER TODOS LOS REGISTROS'}
      </Link>
    </div>
  )
}
