import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  Droplet,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  X,
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
import { useNotification } from '../../../context/NotificationContext'
import {
  observarGruposDelUsuario,
  observarEventosMural,
  registrarEventoMural,
  actualizarEventoMural,
  eliminarEventoMural,
  type Grupo,
  type MuralEvent,
} from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import GroupSelector from '../../../components/GroupSelector'
import { useAppContent } from '../../../context/ContentContext'
import { Icono } from '../../../config/iconos'
import { AGUA_LABEL } from '../../../firebase/content'
import { playClickSound, playCloseSound, playDeleteSound, playSuccessSound } from '../../../utils/audio'

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
  const { activeGroupId, setActiveGroupId } = useNotification()
  const { content } = useAppContent()
  const sucesos = content.sucesos
  const sucesoLabels: Record<string, string> = useMemo(
    () => ({ ...content.sucesoLabel, agua: AGUA_LABEL }),
    [content.sucesoLabel],
  )
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [eventos, setEventos] = useState<MuralEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState<string>('')
  const [editingSaving, setEditingSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const activeGroup = grupos.find((g) => g.id === activeGroupId)
  const nombre = userProfile?.nickname || user?.displayName?.split(' ')[0] || 'Alguien'
  const isOwn = (ev: MuralEvent) => (user ? ev.userId === user.uid : false)

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      if (!activeGroupId || !lista.find((g) => g.id === activeGroupId)) {
        if (lista.length > 0) setActiveGroupId(lista[0]!.id)
      }
    })
    return unsub
  }, [user, activeGroupId, setActiveGroupId])

  useEffect(() => {
    if (!activeGroupId) {
      setEventos([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = observarEventosMural(
      activeGroupId,
      (lista) => {
        setEventos(lista)
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )
    return unsub
  }, [activeGroupId])

  const handleAgua = async () => {
    if (!user) return
    playClickSound()
    try {
      await registrarEventoMural(user.uid, nombre, 'agua', 200)
      playSuccessSound()
    } catch {
      /* error silencioso */
    }
  }

  const handleSuceso = async (type: string) => {
    if (!user) return
    playClickSound()
    try {
      await registrarEventoMural(user.uid, nombre, type)
      playSuccessSound()
    } catch {
      /* error silencioso */
    }
  }

  const handleEditar = (ev: MuralEvent) => {
    setEditingId(ev.id ?? null)
    setEditType(ev.type)
    playClickSound()
  }

  const handleGuardarEdicion = async () => {
    if (!editingId) return
    setEditingSaving(true)
    playClickSound()
    try {
      await actualizarEventoMural(editingId, editType)
      playSuccessSound()
    } catch {
      /* error silencioso */
    } finally {
      setEditingId(null)
      setEditingSaving(false)
    }
  }

  const handleCancelarEdicion = () => {
    setEditingId(null)
    setEditType('')
    playClickSound()
  }

  const handleEliminar = async (ev: MuralEvent) => {
    if (!ev.id) return
    playDeleteSound()
    try {
      await eliminarEventoMural(ev.id)
      playSuccessSound()
    } catch {
      /* error silencioso */
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirmarBorrado = (ev: MuralEvent) => {
    playClickSound()
    setDeletingId(ev.id ?? null)
  }

  const handleCancelarBorrado = () => {
    playCloseSound()
    setDeletingId(null)
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

   const feedEventos = useMemo(() => {
     const ahora = new Date()
     const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0)
     return eventos
       .filter((ev) => ev.createdAt)
       .map((ev) => ({ ev, ts: ev.createdAt!.toMillis() }))
       .filter((item) => item.ts >= inicioHoy.getTime() && item.ts <= ahora.getTime())
       .sort((a, b) => b.ts - a.ts)
       .map((item) => item.ev)
   }, [eventos])

  const leaderboard = useMemo(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0)
    const porUsuario = new Map<string, { name: string; xp: number }>()
    for (const ev of eventos) {
      if (!ev.createdAt) continue
      const fecha = ev.createdAt.toDate()
      if (fecha < inicioMes || fecha > ahora) continue
      const key = `${ev.userId}:${ev.userName}`
      const current = porUsuario.get(key) || { name: ev.userName, xp: 0 }
      current.xp += ev.xpValue ?? 0
      porUsuario.set(key, current)
    }
    return Array.from(porUsuario.values())
      .map((u) => ({ name: u.name, xp: Math.round((u.xp + Number.EPSILON) * 10) / 10 }))
      .sort((a, b) => b.xp - a.xp)
  }, [eventos])

  const xpTotal = useMemo(
    () =>
      leaderboard.find((u) => user && u.name === nombre)?.xp ?? 0,
    [leaderboard, nombre, user],
  )

  if (!activeGroup) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
          Mural
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 font-bold uppercase tracking-wider text-sm">
          CONTROL DE HÁBITOS
        </p>
        <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400">
          No tienes un grupo activo seleccionado.
        </p>
        <GroupSelector grupos={grupos} activeGroupId={activeGroupId} setActiveGroupId={setActiveGroupId} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Mural
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 font-bold uppercase tracking-wider text-sm">
        CONTROL DE HÁBITOS
      </p>

      <GroupSelector grupos={grupos} activeGroupId={activeGroupId} setActiveGroupId={setActiveGroupId} />

      <div className="border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
          TU XP MENSUAL
        </p>
        <p className={`text-3xl font-black uppercase tracking-wider ${xpTotal >= 0 ? 'text-black dark:text-gray-900' : 'text-red-500'}`}>
          {xpTotal >= 0 ? '+' : ''}{xpTotal}
        </p>
      </div>

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
                  <Bar dataKey="total" fill="#60a5fa" stroke="#000" strokeWidth={2} radius={[0, 0, 0, 0]}>
                    <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey="total" offset={10} position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </section>

      <section className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Líderes de XP (mes)
          </h3>
          <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black dark:text-white">
            <Award size={15} />
            <span className={xpTotal >= 0 ? 'text-green-600' : 'text-red-500'}>{xpTotal}</span>
          </div>
        </div>
        {loading ? (
          <Skeleton variant="listItem" count={4} />
        ) : leaderboard.length === 0 ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center py-4">
            AÚN NO HAY XP ESTE MES
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {leaderboard.map((u, i) => (
              <li
                key={u.name}
                className="border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    #{i + 1} {u.name}
                  </span>
                  <span className={u.xp >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {u.xp >= 0 ? '+' : ''}{u.xp} XP
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Sucesos Rápidos
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {sucesos.map((suceso) => {
            const Icon = Icono(suceso.icon)
            return (
              <button
                key={suceso.type}
                onClick={() => handleSuceso(suceso.type)}
                className={`flex items-center justify-center gap-2 py-4 px-3 border-4 border-black ${suceso.bg} font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-1 active:shadow-none transition-all`}
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
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                AUN NO HAY ACTIVIDAD HOY
              </p>
            </div>
          ) : (
            feedEventos.map((ev) => (
              <div
                key={ev.id}
                className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
<p className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                      {ev.userName} registró: {sucesoLabels[ev.type] || ev.type}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-0.5">
                      {tiempoRelativo(ev.createdAt as Timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound()
                      setExpandedId(expandedId === ev.id ? null : (ev.id ?? null))
                    }}
                    className="px-3 py-1.5 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    {expandedId === ev.id ? 'OCULTAR' : 'VER REGISTRO'}
                  </button>
                </div>

                {expandedId === ev.id && (
                  <div className="border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 p-3 mt-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {editingId === ev.id ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          EDITAR REGISTRO
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="flex-1 text-xs font-black uppercase tracking-wider border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white p-2"
                          >
                            <option key="agua" value="agua">
                              VASO DE AGUA
                            </option>
                            {sucesos.map((s) => (
                              <option key={s.type} value={s.type}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleGuardarEdicion}
                            disabled={editingSaving}
                            className="p-2 border-2 border-black bg-emerald-400 dark:bg-emerald-500 text-black font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                          >
                            {editingSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            className="p-2 border-2 border-black bg-pink-300 dark:bg-pink-500 text-black font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            INFORMACIÓN DEL REGISTRO
                          </p>
                          <p className="text-xs font-bold text-black dark:text-white mt-1">
                            XP: <span className="font-black">{ev.xpValue ?? 0} XP</span>
                          </p>
                        </div>

                        {isOwn(ev) && (
                          <div className="flex items-center gap-1.5">
                            {deletingId === ev.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                                  ¿ELIMINAR?:
                                </span>
                                <button
                                  onClick={() => handleEliminar(ev)}
                                  className="px-2 py-1 border-2 border-black bg-red-500 text-white font-black text-[10px] uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                                >
                                  SÍ
                                </button>
                                <button
                                  onClick={handleCancelarBorrado}
                                  className="px-2 py-1 border-2 border-black bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-black text-[10px] uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                                >
                                  NO
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditar(ev)}
                                  className="p-2 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 text-black font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                                >
                                  <Pencil size={12} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => handleConfirmarBorrado(ev)}
                                  className="p-2 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
                                >
                                  <Trash2 size={12} strokeWidth={2.5} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}