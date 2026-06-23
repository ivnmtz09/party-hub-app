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
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Estadisticas
      </h3>
      {miembros.map((m) => {
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
