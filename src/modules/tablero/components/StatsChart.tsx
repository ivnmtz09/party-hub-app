import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Miembro } from '../../../firebase/services'

interface Props {
  miembros: Miembro[]
}

export default function StatsChart({ miembros }: Props) {
  const data = miembros.map((m) => ({
    name: m.displayName,
    Deposiciones: m.deposiciones,
    'Actos Sexuales': m.actosSexuales,
  }))

  if (data.length === 0) return null

  return (
    <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
        Estadisticas por miembro
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={{ stroke: '#000' }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 700 }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: '2px solid black',
              borderRadius: 0,
              boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
              fontSize: 12,
              fontWeight: 700,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, fontWeight: 700 }}
          />
          <Bar
            dataKey="Deposiciones"
            fill="#FF0000"
            stroke="#000"
            strokeWidth={2}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Actos Sexuales"
            fill="#00FFFF"
            stroke="#000"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
