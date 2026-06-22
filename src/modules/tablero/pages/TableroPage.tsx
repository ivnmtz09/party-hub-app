import { useEffect, useState } from 'react'
import { ArrowDownFromLine, Heart, Loader2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import {
  asegurarGrupo,
  asegurarMiembro,
  observarMiembros,
  registrarEvento,
  observarEventos,
  type Miembro,
  type Evento,
} from '../../../firebase/services'
import MemberList from '../components/MemberList'
import StatsSection from '../components/StatsSection'

export default function TableroPage() {
  const { user } = useAuth()
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const unsubMiembros = observarMiembros((list) => {
      setMiembros(list)
      setInitialized(true)
    })
    const unsubEventos = observarEventos(setEventos)

    asegurarGrupo()
    asegurarMiembro(user)

    return () => {
      unsubMiembros()
      unsubEventos()
    }
  }, [user])

  const handleRegistrar = async (tipo: 'deposicion' | 'acto_sexual') => {
    if (!user || isSubmitting) return
    setIsSubmitting(true)
    try {
      await registrarEvento(user.uid, tipo)
    } catch {
      alert('Error al registrar el evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = !initialized

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Tablero
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleRegistrar('deposicion')}
          disabled={isSubmitting}
          className="flex flex-col items-center gap-2 py-6 border-4 border-black dark:border-white bg-amber-300 dark:bg-amber-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownFromLine size={28} strokeWidth={2.5} />
          <span className="text-sm">Registrar Deposicion</span>
        </button>

        <button
          onClick={() => handleRegistrar('acto_sexual')}
          disabled={isSubmitting}
          className="flex flex-col items-center gap-2 py-6 border-4 border-black dark:border-white bg-pink-300 dark:bg-pink-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart size={28} strokeWidth={2.5} />
          <span className="text-sm">Registrar Acto Sexual</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-black dark:text-white" strokeWidth={2.5} />
          <p className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Cargando miembros...
          </p>
        </div>
      ) : (
        <>
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
              Miembros del grupo
            </h3>
            <MemberList miembros={miembros} />
          </section>

          <section>
            <StatsSection miembros={miembros} eventos={eventos} />
          </section>
        </>
      )}
    </div>
  )
}
