import { useEffect, useState } from 'react'
import {
  Trash2,
  Flame,
  Loader2,
  Plus,
  LogIn,
  Copy,
  Check,
  ChevronDown,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
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
import StatsSection from '../components/StatsSection'
import StatsChart from '../components/StatsChart'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import GroupSettingsModal from '../components/GroupSettingsModal'
import { playTapSound } from '../../../utils/audio'

export default function TableroPage() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

    const unsubMiembros = observarMiembros(activeGroupId, setMiembros)
    const unsubEventos = observarEventos(activeGroupId, setEventos)
    return () => {
      unsubMiembros()
      unsubEventos()
    }
  }, [activeGroupId, user])

  const handleRegistrar = async (tipo: 'deposicion' | 'acto_sexual') => {
    if (!user || !activeGroupId || isSubmitting) return
    playTapSound()
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await registrarEvento(activeGroupId, user.uid, tipo)
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
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center py-12 gap-3">
        <Loader2
          size={28}
          className="animate-spin text-black dark:text-white"
          strokeWidth={2.5}
        />
        <p className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Cargando grupos...
        </p>
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
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-3 py-6 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-lg"
          >
            <Plus size={24} strokeWidth={2.5} />
            Crear Nuevo Grupo
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
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
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
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
            onClick={handleCopyCode}
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
            onClick={() => setShowSettingsModal(true)}
            className="p-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Settings size={18} strokeWidth={2.5} />
          </button>
        )}
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 border-2 border-black dark:border-white bg-emerald-200 dark:bg-emerald-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
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

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleRegistrar('deposicion')}
          disabled={isSubmitting}
          className="flex flex-col items-center gap-2 py-6 border-4 border-black dark:border-white bg-orange-800 text-white font-black uppercase tracking-tighter shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={28} strokeWidth={2.5} />
          <span className="text-xl">REGISTRAR CAGADA</span>
        </button>

        <button
          onClick={() => handleRegistrar('acto_sexual')}
          disabled={isSubmitting}
          className="flex flex-col items-center gap-2 py-6 border-4 border-black dark:border-white bg-rose-600 text-white font-black uppercase tracking-tighter shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Flame size={28} strokeWidth={2.5} />
          <span className="text-xl">REGISTRAR CULEADA</span>
        </button>
      </div>

      <StatsChart miembros={miembros} />

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Miembros del grupo
        </h3>
        <MemberList miembros={miembros} adminId={activeGroup?.adminId} />
      </section>

      <section>
        <StatsSection miembros={miembros} eventos={eventos} />
      </section>

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
    </div>
  )
}
