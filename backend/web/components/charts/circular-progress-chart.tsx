import type React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface CircularProgressChartProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
  description?: string
  color?: string
}

const CircularProgressChart: React.FC<CircularProgressChartProps> = ({
  percentage,
  size = 100,
  strokeWidth = 10,
  label,
  description,
  color = "#8884d8",
}) => {
  const data = [
    { name: "Progress", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]

  const COLORS = [color, "#ddd"]

  return (
    <ResponsiveContainer width={size} height={size}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size / 2 - strokeWidth}
          outerRadius={size / 2}
          startAngle={90}
          endAngle={-270}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ payload }) => {
            if (payload && payload.length) {
              const currentPayload = payload.find((p) => p.name === "Progress")
              if (currentPayload) {
                return (
                  <div className="bg-background border border-border shadow-lg rounded-md p-2 text-sm">
                    <p className="font-semibold text-foreground">
                      {label || "Progreso"}: {Number(currentPayload.value).toFixed(1)}%
                    </p>
                    {description && <p className="text-muted-foreground text-xs">{description}</p>}
                  </div>
                )
              }
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CircularProgressChart
