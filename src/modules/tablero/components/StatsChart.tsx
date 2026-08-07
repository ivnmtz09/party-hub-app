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
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full sm:w-auto bg-yellow-400 border-4 border-black text-black font-black uppercase p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer text-xs select-none"
          >
            <option value="hoy" className="bg-white text-black font-black">HOY</option>
            <option value="semana" className="bg-white text-black font-black">ESTA SEMANA</option>
            <option value="mes_actual" className="bg-white text-black font-black">ESTE MES</option>
            {availableMonths.map((m) => {
              const parts = m.split('-')
              const month = parts[0] ?? '1'
              const year = parts[1] ?? '2026'
              const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1))
              const legible = `${NOMBRES_MESES[monthIndex]} ${year}`
              return (
                <option key={m} value={m} className="bg-white text-black font-black">
                  {legible}
                </option>
              )
            })}
            <option value="siempre" className="bg-white text-black font-black">HISTORIAL COMPLETO</option>
          </select>
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
