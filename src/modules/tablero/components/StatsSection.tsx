import { useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Miembro, Evento } from '../../../firebase/services'

function tiempoDesde(ts: Timestamp | null): string {
  if (!ts) return '—'

  const ahora = Date.now()
  const segundos = Math.floor((ahora - ts.toMillis()) / 1000)

  if (segundos < 60) return 'hace segundos'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias}d`
  const meses = Math.floor(dias / 30)
  return `hace ${meses}mes`
}

interface Props {
  miembros: Miembro[]
  eventos: Evento[]
}

export default function StatsSection({ miembros, eventos }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <span>ESTADISTICAS</span>
        {isOpen ? (
          <ChevronUp size={20} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={20} strokeWidth={2.5} />
        )}
      </button>

      {isOpen && miembros.map((m) => {
        const eventosUsuario = eventos.filter((e) => e.userId === m.id)
        const ultimoEvento = eventosUsuario[0]

        return (
          <div
            key={m.id}
            className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-4 text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark"
          >
            <p className="font-black uppercase tracking-wider text-sm mb-2 text-black dark:text-white">
              {m.displayName}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-amber-600 dark:text-amber-400">
                  Ultima cagada:
                </span>{' '}
                {tiempoDesde(m.ultimaDeposicion)}
              </div>
              <div>
                <span className="text-pink-600 dark:text-pink-400">
                  Ultima culeada:
                </span>{' '}
                {tiempoDesde(m.ultimoActoSexual)}
              </div>
              <div>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Dumbbell size={14} strokeWidth={2.5} />
                  Ultimo gym:
                </span>{' '}
                {tiempoDesde(m.ultimoGym)}
              </div>
              {ultimoEvento && 'timestamp' in ultimoEvento && (
                <div className="col-span-2 text-gray-500 dark:text-gray-500 mt-1">
                  Ultimo registro:{' '}
                  {ultimoEvento.timestamp
                    ? tiempoDesde(ultimoEvento.timestamp as Timestamp)
                    : '—'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
