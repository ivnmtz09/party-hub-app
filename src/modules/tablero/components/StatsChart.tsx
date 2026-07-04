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

interface Props {
  miembros: Miembro[]
  eventos: Evento[]
}

export default function StatsChart({ miembros, eventos }: Props) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const eventosMesActual = eventos.filter((e) => {
    if (!e.timestamp) return false
    const date = typeof e.timestamp?.toDate === 'function' ? e.timestamp.toDate() : new Date(e.timestamp as any)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const data = miembros.map((m) => {
    const eventosUsuarioMes = eventosMesActual.filter((e) => e.userId === m.id)
    const cagadas = eventosUsuarioMes.filter((e) => e.tipo === 'deposicion').length
    const culeadas = eventosUsuarioMes.filter((e) => e.tipo === 'acto_sexual').length
    const gimnasio = eventosUsuarioMes.filter((e) => e.tipo === 'gym').length

    return {
      name: m.nickname || m.displayName.split(' ')[0],
      CAGADAS: cagadas,
      CULEADAS: culeadas,
      GYM: gimnasio,
    }
  })

  if (data.length === 0) return null

  const NOMBRES_MESES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]
  const nombreMesActual = NOMBRES_MESES[currentMonth] ?? ''

  return (
    <div
      className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Cagadas vs Culeadas vs Gym
        </h3>
        <div className="inline-block self-start bg-yellow-300 dark:bg-yellow-400 text-black border-2 border-black dark:border-white px-2.5 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ESTADÍSTICAS DE {nombreMesActual}
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
          <Bar
            dataKey="CAGADAS"
            fill="#f97316"
            stroke="#000"
            strokeWidth={2}
            radius={[0, 0, 0, 0]}
          >
            <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey="CAGADAS" offset={10} position="right" />
          </Bar>
          <Bar
            dataKey="CULEADAS"
            fill="#ec4899"
            stroke="#000"
            strokeWidth={2}
          >
            <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey="CULEADAS" offset={10} position="right" />
          </Bar>
          <Bar
            dataKey="GYM"
            fill="#06b6d4"
            stroke="#000"
            strokeWidth={2}
          >
            <LabelList className="fill-black dark:fill-white font-black text-sm" dataKey="GYM" offset={10} position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
