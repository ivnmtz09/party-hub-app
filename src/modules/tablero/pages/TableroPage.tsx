import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  LogIn,
  Copy,
  Check,
  ChevronDown,
  Settings,
  Filter,
  X,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'
import {
  observarGruposDelUsuario,
  observarMiembros,
  registrarEvento,
  observarEventos,
  asegurarMiembro,
  type Grupo,
  type Miembro,
  type Evento,
} from '../../../firebase/services'
import MemberList from '../components/MemberList'
import StatsChart from '../components/StatsChart'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import GroupSettingsModal from '../components/GroupSettingsModal'
import RecentActivity from '../components/RecentActivity'
import RecordInlineForm from '../components/RecordInlineForm'
import Skeleton from '../../../components/Skeleton'
import { playOpenSound, playCloseSound, playClickSound, playCopySound } from '../../../utils/audio'

export default function TableroPage() {
  const { user } = useAuth()
  const { setActiveGroupId: setNotificationGroupId } = useNotification()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeFilter, setTimeFilter] = useState<'este_mes' | 'mes_pasado' | 'esta_semana' | 'hoy'>('este_mes')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [showInlineForm, setShowInlineForm] = useState(false)

  const filteredEventos = useMemo(() => {
    const ahora = new Date()

    return eventos.filter((e) => {
      const fechaEvento = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp as any)

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
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
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

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      if (lista.length > 0) {
        setActiveGroupId((prev) => {
          const currentId = prev
          if (!currentId || !lista.find((g) => g.id === currentId)) {
            return lista[0]!.id
          }
          return currentId
        })
      } else {
        setActiveGroupId(null)
      }
      setInitialized(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!activeGroupId || !user) return

    asegurarMiembro(user, activeGroupId)

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

  useEffect(() => {
    setNotificationGroupId(activeGroupId)
  }, [activeGroupId, setNotificationGroupId])

  const handleRecordSave = async (tipo: 'deposicion' | 'acto_sexual' | 'gym', data: { rating: number; note: string; photoUrl: string }) => {
    if (!user || !activeGroupId) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await registrarEvento(activeGroupId, user.uid, tipo, data)
    } catch {
      setErrorMsg('Error al registrar el evento')
      setTimeout(() => setErrorMsg(''), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyCode = () => {
    const grupo = grupos.find((g) => g.id === activeGroupId)
    if (!grupo) return
    navigator.clipboard.writeText(grupo.codigoInvitacion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeGroup = grupos.find((g) => g.id === activeGroupId)

  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in-up">
        <div className="h-10 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
        <Skeleton variant="card" count={2} />
        <div className="h-8 w-40 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse" />
        <Skeleton variant="listItem" count={3} />
      </div>
    )
  }

  if (grupos.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white text-center">
          Tablero Social
        </h2>
        <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400">
          No tienes grupos activos. Crea uno nuevo o unete a uno existente.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => { playOpenSound(); setShowCreateModal(true) }}
            className="w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg"
          >
            <Plus size={24} strokeWidth={2.5} />
            Crear Nuevo Grupo
          </button>
          <button
            onClick={() => { playOpenSound(); setShowJoinModal(true) }}
            className="w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-blue-300 dark:bg-blue-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg"
          >
            <LogIn size={24} strokeWidth={2.5} />
            Unirse a un Grupo
          </button>
        </div>

        <CreateGroupModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
        <JoinGroupModal
          open={showJoinModal}
          onClose={() => setShowJoinModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      {contentLoading ? (
        <>
          <div className="h-10 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
            <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
            <div className="flex-1 h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
          </div>
          <div className="h-48 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark" />
          <Skeleton variant="listItem" count={3} />
        </>
      ) : (
      <>
      <div className="relative">
        <button
          onClick={() => { showDropdown ? playCloseSound() : playOpenSound(); setShowDropdown(!showDropdown) }}
          className="w-full flex items-center justify-between gap-2 py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <span className="truncate">
            {activeGroup?.nombre ?? 'Seleccionar grupo'}
          </span>
          <ChevronDown
            size={20}
            strokeWidth={2.5}
            className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 z-20 border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark overflow-hidden">
              {grupos.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    playClickSound()
                    setActiveGroupId(g.id)
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left py-3 px-4 font-bold uppercase tracking-wider text-sm border-b-2 border-black dark:border-white last:border-b-0 transition-colors ${
                    g.id === activeGroupId
                      ? 'bg-yellow-200 dark:bg-yellow-400 text-black'
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {g.nombre}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {activeGroup && (
          <button
            onClick={() => { playCopySound(); handleCopyCode() }}
            className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {copied ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                {activeGroup.codigoInvitacion}
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={2.5} />
                Codigo de Invitacion
              </>
            )}
          </button>
        )}
        {activeGroup && (
          <button
            onClick={() => { playOpenSound(); setShowSettingsModal(true) }}
            className="p-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Settings size={18} strokeWidth={2.5} />
          </button>
        )}
        <button
          onClick={() => { playOpenSound(); setShowCreateModal(true) }}
          className="p-2 border-2 border-black dark:border-white bg-emerald-200 dark:bg-emerald-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => { playOpenSound(); setShowJoinModal(true) }}
          className="p-2 border-2 border-black dark:border-white bg-blue-200 dark:bg-blue-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <LogIn size={18} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <p className="text-red-600 font-black text-sm text-center uppercase tracking-wider bg-red-100 dark:bg-red-900/30 border-2 border-red-600 py-2 px-4">
          {errorMsg}
        </p>
      )}

      <button
        onClick={() => { showInlineForm ? playCloseSound() : playOpenSound(); setShowInlineForm(!showInlineForm) }}
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg ${showInlineForm ? 'border-b-0 rounded-b-none' : ''}`}
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

      <div className="relative w-full mb-4 z-10">
        <button
          onClick={() => { isFilterMenuOpen ? playCloseSound() : playOpenSound(); setIsFilterMenuOpen(!isFilterMenuOpen) }}
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
                    playClickSound()
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

      <StatsChart miembros={miembros} eventos={filteredEventos} filterLabel={filterLabel} />

      <MemberList miembros={miembros} adminId={activeGroup?.adminId} />

      <RecentActivity
        eventos={eventos}
        miembros={miembros}
        userId={user?.uid ?? ''}
        groupId={activeGroupId ?? ''}
        loading={contentLoading}
      />

      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinGroupModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      {activeGroup && (
        <GroupSettingsModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          group={activeGroup}
          miembros={miembros}
          userId={user?.uid ?? ''}
        />
      )}

      </>
      )}
    </div>
  )
}
