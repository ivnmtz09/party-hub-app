import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUp,
  ArrowDown,
  Banknote,
  Droplet,
  Hamburger,
  Moon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts'
import type { Timestamp } from 'firebase/firestore'
import { useAuth } from '../../../context/AuthContext'
import {
  observarGruposDelUsuario,
  observarEventosMural,
  registrarEventoMural,
  type Grupo,
  type MuralEvent,
} from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import { playClickSound, playSuccessSound } from '../../../utils/audio'

const SUCESOS = [
  { type: 'subi_peso', label: 'SUBÍ DE PESO', icon: ArrowUp, bg: 'bg-red-500 dark:bg-red-600 text-white' },
  { type: 'baje_peso', label: 'BAJÉ DE PESO', icon: ArrowDown, bg: 'bg-green-400 dark:bg-green-500 text-black dark:text-gray-900' },
  { type: 'comi_chatarra', label: 'COMÍ CHATARRA', icon: Hamburger, bg: 'bg-orange-400 dark:bg-orange-500 text-black dark:text-gray-900' },
  { type: 'gaste_plata', label: 'GASTÉ PLATA', icon: Banknote, bg: 'bg-yellow-300 dark:bg-yellow-500 text-black' },
  { type: 'dormi_bien', label: 'DORMÍ BIEN', icon: Moon, bg: 'bg-cyan-300 dark:bg-cyan-500 text-black dark:text-gray-900' },
] as const

const SUCESO_LABEL: Record<string, string> = {
  agua: 'VASO DE AGUA',
  subi_peso: 'SUBÍ DE PESO',
  baje_peso: 'BAJÉ DE PESO',
  comi_chatarra: 'COMÍ CHATARRA',
  gaste_plata: 'GASTÉ PLATA',
  dormi_bien: 'DORMÍ BIEN',
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

export default function MuralPage() {
  const { user, userProfile } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [groupId, setGroupId] = useState<string | null>(null)
  const [eventos, setEventos] = useState<MuralEvent[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      setGroupId((prev) => {
        if (prev && lista.find((g) => g.id === prev)) return prev
        return lista.length > 0 ? lista[0]!.id : null
      })
      setInitialized(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    const unsub = observarEventosMural(groupId, (lista) => {
      setEventos(lista)
      setLoading(false)
    })
    return unsub
  }, [groupId])

  const handleAgua = async () => {
    if (!user || !groupId) return
    const nombre = userProfile?.nickname || user.displayName?.split(' ')[0] || 'Alguien'
    playClickSound()
    try {
      await registrarEventoMural(groupId, user.uid, nombre, 'agua', 200)
      playSuccessSound()
    } catch {
      /* error silencioso */
    }
  }

  const handleSuceso = async (type: string) => {
    if (!user || !groupId) return
    const nombre = userProfile?.nickname || user.displayName?.split(' ')[0] || 'Alguien'
    playClickSound()
    try {
      await registrarEventoMural(groupId, user.uid, nombre, type)
      playSuccessSound()
    } catch {
      /* error silencioso */
    }
  }

  const aguaChartData = useMemo(() => {
    const ahora = new Date()
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0)
    const porUsuario = new Map<string, number>()
    for (const ev of eventos) {
      if (ev.type !== 'agua' || !ev.createdAt) continue
      const fecha = ev.createdAt.toDate()
      if (fecha < inicioHoy || fecha > ahora) continue
      porUsuario.set(ev.userName, (porUsuario.get(ev.userName) || 0) + (ev.value ?? 200))
    }
    return Array.from(porUsuario.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
  }, [eventos])

  const feedEventos = useMemo(
    () => eventos.filter((ev) => ev.type !== 'agua'),
    [eventos],
  )

  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <Skeleton variant="card" count={2} />
      </div>
    )
  }

  if (grupos.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6">
        <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400">
          No tienes grupos activos para usar el mural.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Mural
      </h2>

      <section className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Hidratación Diaria
        </h3>
        <button
          onClick={handleAgua}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-blue-400 dark:bg-blue-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-1 active:shadow-none transition-all"
        >
          <Droplet size={20} strokeWidth={2.5} />
          +1 VASO DE AGUA (200ml)
        </button>

        <div className="mt-4">
          {loading ? (
            <Skeleton variant="card" count={1} />
          ) : aguaChartData.length === 0 ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center py-4">
              Aun no hay vasos de agua hoy
            </p>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Agua tomada hoy (ml)
              </p>
              <ResponsiveContainer width="100%" height={Math.max(160, aguaChartData.length * 56)}>
                <BarChart
                  data={aguaChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    axisLine={{ stroke: '#000' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                    axisLine={false}
                    tickLine={false}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={4} textAnchor="end" className="fill-black dark:fill-white font-bold" style={{ fontSize: 11 }}>
                          {payload.value}
                        </text>
                      </g>
                    )}
                  />
                  <CartesianGrid horizontal={false} vertical={true} strokeDasharray="4 4" stroke="#9ca3af" opacity={0.6} />
                  <Bar dataKey="total" fill="#3b82f6" stroke="#000" strokeWidth={2} radius={[0, 0, 0, 0]}>
                    <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey="total" offset={10} position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Sucesos Rápidos
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {SUCESOS.map((suceso, index) => {
            const Icon = suceso.icon
            return (
              <button
                key={suceso.type}
                onClick={() => handleSuceso(suceso.type)}
                className={`flex items-center justify-center gap-2 py-4 px-3 border-4 border-black ${suceso.bg} font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-1 active:shadow-none transition-all ${index === SUCESOS.length - 1 ? 'col-span-2' : ''}`}
              >
                <Icon size={18} strokeWidth={2.5} />
                {suceso.label}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Feed del Mural
        </h3>
        <div className="flex flex-col gap-3">
          {loading ? (
            <Skeleton variant="listItem" count={5} />
          ) : feedEventos.length === 0 ? (
            <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                Aun no hay sucesos
              </p>
            </div>
          ) : (
            feedEventos.slice(0, 30).map((ev) => (
              <div
                key={ev.id}
                className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <p className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                  {ev.userName} registró: {SUCESO_LABEL[ev.type] || ev.type}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-0.5">
                  {tiempoRelativo(ev.createdAt as Timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}