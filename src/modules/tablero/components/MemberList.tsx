import type { Miembro } from '../../../firebase/services'

interface Props {
  miembros: Miembro[]
}

export default function MemberList({ miembros }: Props) {
  if (miembros.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-bold uppercase tracking-wider">
        No hay miembros en el grupo
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {miembros.map((m) => (
        <div
          key={m.id}
          className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-4 flex items-center justify-between shadow-brutal-sm dark:shadow-brutal-sm-dark"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-300 dark:bg-yellow-400 border-2 border-black dark:border-white flex items-center justify-center text-sm font-black text-black dark:text-gray-900">
              {m.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white">
                {m.displayName}
              </p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {m.email || 'sin email'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                {m.deposiciones}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Depo
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-pink-600 dark:text-pink-400">
                {m.actosSexuales}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Sexo
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
