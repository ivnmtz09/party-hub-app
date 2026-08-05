import { useEffect, useState } from 'react'
import { Check, Copy, FolderPlus, Loader2, LogIn, Settings, Users } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'
import {
  observarGruposDelUsuario,
  observarMiembros,
  unirseGrupo,
  type Grupo,
  type Miembro,
} from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import MembersList from '../../tablero/components/MembersList'
import CreateGroupModal from '../../tablero/components/CreateGroupModal'
import GroupSettingsModal from '../../tablero/components/GroupSettingsModal'
import { playOpenSound, playClickSound, playCloseSound, playCopySound, playSuccessSound } from '../../../utils/audio'
export default function Home() {
  const { user } = useAuth()
  const { activeGroupId, setActiveGroupId } = useNotification()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [isJoinDropdownOpen, setIsJoinDropdownOpen] = useState(false)
  const [joinCodigo, setJoinCodigo] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      setInitialized(true)
      if (!activeGroupId || !lista.find((g) => g.id === activeGroupId)) {
        if (lista.length > 0) setActiveGroupId(lista[0]!.id)
      }
    })
    return unsub
  }, [user, activeGroupId, setActiveGroupId])

  useEffect(() => {
    if (!activeGroupId) return
    setLoadingMembers(true)
    const unsub = observarMiembros(activeGroupId, (list) => {
      setMiembros(list)
      setLoadingMembers(false)
    })
    return unsub
  }, [activeGroupId])

  const activeGroup = grupos.find((g) => g.id === activeGroupId)

  const handleCopyCode = () => {
    if (!activeGroup) return
    playCopySound()
    navigator.clipboard.writeText(activeGroup.codigoInvitacion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoin = async () => {
    if (!user || joinCodigo.trim().length !== 6) return
    setJoinLoading(true)
    setJoinError('')
    try {
      await unirseGrupo(joinCodigo.trim().toUpperCase(), user)
      playSuccessSound()
      setJoinCodigo('')
      setIsJoinDropdownOpen(false)
    } catch {
      setJoinError('Codigo no encontrado')
    } finally {
      setJoinLoading(false)
    }
  }

  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <Skeleton variant="card" count={2} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Home
      </h2>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Administra tus grupos y elige el activo
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => { playOpenSound(); setShowCreateGroup(true) }}
          className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <FolderPlus size={22} strokeWidth={2.5} />
          Crear Nuevo Grupo
        </button>
        <button
          onClick={() => { playClickSound(); setIsJoinDropdownOpen((prev) => !prev) }}
          className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-blue-300 dark:bg-blue-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <LogIn size={22} strokeWidth={2.5} />
          Unirse a un Grupo
        </button>

        {isJoinDropdownOpen && (
          <div className="w-full bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-4 mt-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
            <input
              type="text"
              value={joinCodigo}
              onChange={(e) => setJoinCodigo(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="Codigo de 6 caracteres"
              maxLength={6}
              className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-900 text-black dark:text-white p-3 font-black uppercase placeholder:text-gray-400 focus:outline-none"
            />
            {joinError && (
              <p className="text-red-600 font-black text-sm uppercase tracking-wider">
                {joinError}
              </p>
            )}
            <button
              onClick={handleJoin}
              disabled={joinLoading || joinCodigo.trim().length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 dark:bg-yellow-500 border-4 border-black dark:border-white font-black uppercase p-3 hover:translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joinLoading ? (
                <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <LogIn size={18} strokeWidth={2.5} />
              )}
              Unirme
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Tus Grupos
        </h3>
        {grupos.length === 0 ? (
          <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
              No tienes grupos. Crea uno o unete.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {grupos.map((g) => {
              const isActive = g.id === activeGroupId
              return (
                <button
                  key={g.id}
                  onClick={() => { playClickSound(); setActiveGroupId(g.id) }}
                  className={`flex items-center justify-between gap-3 w-full py-4 px-4 border-4 border-black dark:border-white font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                    isActive
                      ? 'bg-yellow-300 dark:bg-yellow-500 text-black'
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                  }`}
                >
                  <span className="truncate text-sm">{g.nombre}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {g.miembrosIds.length}
                    <span className="flex items-center gap-1 text-[10px]">
                      <Users size={14} strokeWidth={2.5} />
                    </span>
                    {isActive && <Check size={18} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {activeGroup && (
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Grupo Activo
              </span>
              <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white truncate max-w-[140px]">
                {activeGroup.nombre}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { playCopySound(); handleCopyCode() }}
                className="flex items-center gap-1.5 py-2 px-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                {copied ? (
                  <>
                    <Check size={12} strokeWidth={2.5} />
                    {activeGroup.codigoInvitacion}
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={2.5} />
                    Codigo
                  </>
                )}
              </button>
              <button
                onClick={() => { playOpenSound(); setShowSettings(true) }}
                className="p-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Settings size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

      <div className="mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Miembros ({miembros.length})
        </h3>
      </div>
      {loadingMembers ? (
        <Skeleton variant="listItem" count={3} />
      ) : (
        <MembersList miembros={miembros} activeGroup={activeGroup ?? undefined} />
      )}
    </div>
  )}

      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => { playCloseSound(); setShowCreateGroup(false) }}
      />
      {activeGroup && (
        <GroupSettingsModal
          open={showSettings}
          onClose={() => { playCloseSound(); setShowSettings(false) }}
          group={activeGroup}
          miembros={miembros}
          userId={user?.uid ?? ''}
        />
      )}
    </div>
  )
}