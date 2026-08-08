import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts'
import type { Miembro, Evento } from '../../../firebase/services'
import { useAppContent } from '../../../context/ContentContext'
import { playOpenSound, playClickSound } from '../../../utils/audio'

interface Props {
  miembros: Miembro[]
  eventos: Evento[]
  timeFilter: string
  availableMonths: string[]
  onTimeFilterChange: (val: string) => void
}

const CHART_FILLS: Record<string, string> = {
  deposicion: '#f97316',
  acto_sexual: '#ec4899',
  meada: '#facc15',
  gym: '#06b6d4',
}

export default function StatsChart({ miembros, eventos, timeFilter, availableMonths, onTimeFilterChange }: Props) {
  const { content } = useAppContent()
  const acts = content.actividades
  const [filterOpen, setFilterOpen] = useState(false)

  const data = miembros.map((m) => {
    const eventosUsuario = eventos.filter((e) => e.userId === m.id)
    const cagadas = eventosUsuario.filter((e) => e.tipo === 'deposicion').length
    const culeadas = eventosUsuario.filter((e) => e.tipo === 'acto_sexual').length
    const meadas = eventosUsuario.filter((e) => e.tipo === 'meada').length
    const gimnasio = eventosUsuario.filter((e) => e.tipo === 'gym').length

    return {
      name: m.nickname || m.displayName.split(' ')[0],
      deposicion: cagadas,
      acto_sexual: culeadas,
      meada: meadas,
      gym: gimnasio,
    }
  })

  if (data.length === 0) return null

  const NOMBRES_MESES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]

  const getFilterLabel = (val: string): string => {
    if (val === 'hoy') return 'HOY'
    if (val === 'semana') return 'ESTA SEMANA'
    if (val === 'mes_actual') return 'ESTE MES'
    if (val === 'siempre') return 'HISTORIAL COMPLETO'
    const parts = val.split('-')
    const month = parts[0] ?? '1'
    const year = parts[1] ?? '2026'
    const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1))
    return `${NOMBRES_MESES[monthIndex]} ${year}`
  }

  const FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: 'hoy', label: 'HOY' },
    { value: 'semana', label: 'ESTA SEMANA' },
    { value: 'mes_actual', label: 'ESTE MES' },
    ...availableMonths.map((m) => ({ value: m, label: getFilterLabel(m) })),
    { value: 'siempre', label: 'HISTORIAL COMPLETO' },
  ]

  const titulo = acts.length > 0
    ? acts.map((a) => a.labelPlural ?? a.label).join(' vs ')
    : 'Cagadas vs Culeadas vs Meadas vs Gym'

  return (
    <div
      className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark"
    >
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {titulo}
        </h3>
        
        {/* Selector de Mes/Tiempo Neobrutalista */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { playOpenSound(); setFilterOpen(!filterOpen) }}
            className="w-full flex items-center justify-between gap-2 py-2.5 px-3 border-4 border-black dark:border-white bg-gradient-to-r from-yellow-300 to-amber-500 text-black font-black uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="truncate">{getFilterLabel(timeFilter)}</span>
            <ChevronDown
              size={16}
              strokeWidth={2.5}
              className={`shrink-0 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 z-20 border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      playClickSound()
                      onTimeFilterChange(opt.value)
                      setFilterOpen(false)
                    }}
                    className={`w-full text-left py-2.5 px-3 border-b-2 border-black dark:border-white last:border-b-0 font-black uppercase text-xs tracking-wider transition-colors ${
                      timeFilter === opt.value
                        ? 'bg-yellow-300 dark:bg-yellow-500 text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
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
            width={55}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.split(' ')[0]}
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={4} textAnchor="end" className="fill-black dark:fill-white font-bold" style={{ fontSize: 11 }}>
                  {payload.value}
                </text>
              </g>
            )}
          />
          <CartesianGrid horizontal={false} vertical={true} strokeDasharray="4 4" stroke="#9ca3af" opacity={0.6} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontWeight: 700 }}
          />
          {acts.map((a) => (
            <Bar
              key={a.tipo}
              dataKey={a.tipo}
              name={a.labelPlural ?? a.label}
              fill={CHART_FILLS[a.tipo] ?? '#9ca3af'}
              stroke="#000"
              strokeWidth={2}
              radius={[0, 0, 0, 0]}
            >
              <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey={a.tipo} offset={10} position="right" />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
