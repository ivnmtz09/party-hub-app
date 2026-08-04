import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Copy,
  Check,
  Filter,
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
  playCloseSound,
  playCopySound,
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
  const [copied, setCopied] = useState(false)
  const [timeFilter, setTimeFilter] = useState<'este_mes' | 'mes_pasado' | 'esta_semana' | 'hoy'>('este_mes')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleCopyCode = async () => {
    if (!activeGroup) return
    playCopySound()
    navigator.clipboard.writeText(activeGroup.codigoInvitacion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const filteredEventos = useMemo(() => {
    const ahora = new Date()

    return eventos.filter((e) => {
      let fechaEvento: Date | null = null
      if (e.timestamp) {
        const ts = e.timestamp as { toDate?: () => Date } | unknown
        if (ts && typeof (ts as { toDate?: unknown }).toDate === 'function') {
          fechaEvento = (ts as { toDate: () => Date }).toDate()
        } else {
          const d = new Date(e.timestamp as unknown as string)
          if (!isNaN(d.getTime())) fechaEvento = d
        }
      }
      if (!fechaEvento) return false

      switch (timeFilter) {
        case 'hoy':
          return fechaEvento.getFullYear() === ahora.getFullYear() &&
                 fechaEvento.getMonth() === ahora.getMonth() &&
                 fechaEvento.getDate() === ahora.getDate()
        case 'esta_semana': {
          const dayOfWeek = ahora.getDay()
          const inicioSemana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ((dayOfWeek + 6) % 7))
          inicioSemana.setHours(0, 0, 0, 0)
          return fechaEvento >= inicioSemana && fechaEvento <= ahora
        }
        case 'mes_pasado': {
          const mesAnterior = ahora.getMonth() - 1
          const indiceMes = mesAnterior < 0 ? 11 : mesAnterior
          const añoMesAnterior = mesAnterior < 0 ? ahora.getFullYear() - 1 : ahora.getFullYear()
          return fechaEvento.getMonth() === indiceMes && fechaEvento.getFullYear() === añoMesAnterior
        }
        case 'este_mes':
        default:
          return fechaEvento.getMonth() === ahora.getMonth() &&
                 fechaEvento.getFullYear() === ahora.getFullYear()
      }
    })
  }, [eventos, timeFilter])

  const NOMBRES_MESES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ]

  const filterLabel = useMemo(() => {
    const now = new Date()
    switch (timeFilter) {
      case 'hoy': return 'HOY'
      case 'esta_semana': return 'ESTA SEMANA'
      case 'mes_pasado': {
        const lastMonth = now.getMonth() - 1
        const year = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
        const monthIndex = lastMonth < 0 ? 11 : lastMonth
        return `${NOMBRES_MESES[monthIndex]} ${year}`
      }
      case 'este_mes':
      default: return `${NOMBRES_MESES[now.getMonth()]} ${now.getFullYear()}`
    }
  }, [timeFilter])

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
          className="w-full flex items-center justify-center gap-3 py-4 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-y-1 active:shadow-none transition-all"
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

      <div className="flex gap-2">
        <button
          onClick={handleCopyCode}
          className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              {activeGroup!.codigoInvitacion}
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={2.5} />
              Codigo de Invitacion
            </>
          )}
        </button>
        <Link
          to="/miembros"
          className="flex items-center justify-center py-2 px-3 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black text-xs uppercase tracking-wider shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Miembros
        </Link>
      </div>

      {errorMsg && (
        <p className="text-red-600 font-black text-sm text-center uppercase tracking-wider bg-red-100 dark:bg-red-900/30 border-2 border-red-600 py-2 px-4">
          {errorMsg}
        </p>
      )}

      {contentLoading ? (
        <Skeleton variant="listItem" count={5} />
      ) : (
        <StatsChart miembros={miembros} eventos={filteredEventos} filterLabel={filterLabel} />
      )}

      <button
        onClick={() => { playOpenSound(); setShowInlineForm(!showInlineForm) }}
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg ${showInlineForm ? 'border-b-0 rounded-b-none' : ''}`}
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
      />

      <div className="relative w-full mb-4 z-10">
        <button
          onClick={() => { playOpenSound(); setIsFilterMenuOpen(!isFilterMenuOpen) }}
          className="w-full flex items-center justify-between gap-2 py-3 px-4 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <span>Filtro: {timeFilter.replace('_', ' ').toUpperCase()}</span>
          <Filter size={20} strokeWidth={2.5} />
        </button>
        {isFilterMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsFilterMenuOpen(false)}
            />
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-brutal-sm dark:shadow-brutal-sm-dark mt-2 flex flex-col z-20">
              {(['este_mes', 'mes_pasado', 'esta_semana', 'hoy'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    playCloseSound()
                    setTimeFilter(f)
                    setIsFilterMenuOpen(false)
                  }}
                  className={`w-full text-left py-3 px-4 font-bold uppercase tracking-wider text-sm border-b-2 border-black dark:border-white last:border-b-0 transition-colors ${
                    timeFilter === f
                      ? 'bg-yellow-200 dark:bg-yellow-400 text-black'
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {f === 'este_mes' && 'ESTE MES'}
                  {f === 'mes_pasado' && 'MES PASADO'}
                  {f === 'esta_semana' && 'ESTA SEMANA'}
                  {f === 'hoy' && 'HOY'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Link
        to="/historial"
        className="w-full flex items-center justify-center py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        VER HISTORIAL COMPLETO
      </Link>

      <Link
        to="/mural"
        className="w-full flex items-center justify-center py-3 px-4 border-4 border-black dark:border-white bg-cyan-300 dark:bg-cyan-400 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        IR AL MURAL
      </Link>
    </div>
  )
}
