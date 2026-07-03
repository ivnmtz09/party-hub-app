import { useState } from 'react'
import { Crown, ChevronDown, ChevronUp, Dumbbell, Trash2, Flame } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Miembro } from '../../../firebase/services'

interface Props {
  miembros: Miembro[]
  adminId?: string
}

function tiempoRelativo(ts: Timestamp | null): string {
  if (!ts) return ''
  const segundos = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (segundos < 60) return 'ahora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias}d`
  return `hace ${Math.floor(dias / 30)}mes`
}

export default function MemberList({ miembros, adminId }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  if (miembros.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-bold uppercase tracking-wider">
        No hay miembros en el grupo
      </p>
    )
  }

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <span>MIEMBROS DEL GRUPO</span>
        {isOpen ? (
          <ChevronUp size={20} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={20} strokeWidth={2.5} />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 mt-3">
          {miembros.map((m) => {
            const ultimoGym = m.ultimoGym ? tiempoRelativo(m.ultimoGym as Timestamp) : ''
            const ultimaDepo = m.ultimaDeposicion ? tiempoRelativo(m.ultimaDeposicion as Timestamp) : ''
            const ultimoSexo = m.ultimoActoSexual ? tiempoRelativo(m.ultimoActoSexual as Timestamp) : ''

            return (
              <div
                key={m.id}
                className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal-sm dark:shadow-brutal-sm-dark"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center bg-yellow-300 dark:bg-yellow-400 border-2 border-black dark:border-white font-black text-xl text-black dark:text-gray-900">
                    {m.displayName.charAt(0).toUpperCase()}
                    {m.id === adminId && (
                      <div className="absolute -top-2 -right-2">
                        <Crown size={14} strokeWidth={2.5} className="text-yellow-600 dark:text-yellow-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white truncate">
                      {m.displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.id === adminId ? (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-1.5 py-0.5 border border-black dark:border-white">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-1.5 py-0.5 border border-black dark:border-white">
                          INVITADO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trash2 size={16} strokeWidth={2.5} className="text-amber-600 dark:text-amber-400" />
                      <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                        {m.deposiciones}
                      </p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      CAGADAS
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame size={16} strokeWidth={2.5} className="text-pink-600 dark:text-pink-400" />
                      <p className="text-lg font-black text-pink-600 dark:text-pink-400">
                        {m.actosSexuales}
                      </p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      CULEADAS
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Dumbbell size={16} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {m.gym || 0}
                      </p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      GYM
                    </p>
                  </div>
                </div>

                {(ultimoGym || ultimaDepo || ultimoSexo) && (
                  <div className="flex flex-col gap-1 mt-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {ultimaDepo && (
                      <span className="flex items-center gap-1">
                        <Trash2 size={14} strokeWidth={2.5} /> Ultima cagada: {ultimaDepo}
                      </span>
                    )}
                    {ultimoSexo && (
                      <span className="flex items-center gap-1">
                        <Flame size={14} strokeWidth={2.5} /> Ultima culeada: {ultimoSexo}
                      </span>
                    )}
                    {ultimoGym && (
                      <span className="flex items-center gap-1">
                        <Dumbbell size={14} strokeWidth={2.5} /> Ultimo dia de gym: {ultimoGym}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
