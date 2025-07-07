"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceDot } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart" // Assuming from shadcn/ui
import { formatCurrency } from "@/utils/currency" // Assuming formatCurrency is declared in a utils file

interface TrendProjectionChartProps {
  data: Array<{ name: string; historical?: number; projected?: number }> // 'name' is the quarter
  historicalKey: string // e.g., "VAT Pagado"
  projectedKey: string // e.g., "VAT Proyectado"
  yAxisLabel?: string
  strokeColorHistorical?: string
  strokeColorProjected?: string
  height?: number
}

const formatCurrencyForAxis = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k€`
  }
  return `${value.toFixed(0)}€`
}

export function TrendProjectionChart({
  data,
  historicalKey,
  projectedKey,
  yAxisLabel,
  strokeColorHistorical = "hsl(var(--chart-2))", // Muted color for historical
  strokeColorProjected = "hsl(var(--chart-1))", // Primary color for projection
  height = 250,
}: TrendProjectionChartProps) {
  const chartConfig = {
    [historicalKey]: {
      label: historicalKey,
      color: strokeColorHistorical,
    },
    [projectedKey]: {
      label: projectedKey,
      color: strokeColorProjected,
    },
  }

  // Combine historical and projected data for the line
  const lineData = data.map((item) => ({
    name: item.name,
    value: item.historical !== undefined ? item.historical : item.projected,
  }))

  const projectionPointIndex = data.findIndex((d) => d.projected !== undefined)

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={lineData}
          margin={{
            top: 5,
            right: 10,
            left: yAxisLabel ? -10 : -20, // Adjust left margin based on Y-axis label
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 6)} // Shorten quarter label e.g. "T1 202"
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatCurrencyForAxis}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 0, fontSize: 12, dy: 40 }
                : undefined
            }
            fontSize={12}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload
                  if (point?.name === data[projectionPointIndex]?.name) {
                    return `${projectedKey}: ${point?.name}`
                  }
                  return `${historicalKey}: ${point?.name}`
                }}
                formatter={(value, name, props) => (
                  <>
                    <span className="font-bold">{formatCurrency(value as number)}</span>
                  </>
                )}
              />
            }
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            dataKey="value"
            type="monotone"
            stroke={strokeColorHistorical}
            strokeWidth={2}
            dot={false}
            name={historicalKey} // Legend name for the main line
            connectNulls={false} // Don't connect if there's a gap before projection
          />
          {/* Dashed line for projection segment */}
          {projectionPointIndex > 0 && projectionPointIndex < data.length && (
            <Line
              dataKey="value"
              type="monotone"
              stroke={strokeColorProjected}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: strokeColorProjected, strokeWidth: 1, stroke: strokeColorProjected }}
              activeDot={{ r: 6 }}
              name={projectedKey}
              points={[{ x: 0, y: 0 }]} // This is a trick to make it appear in legend, actual data is from main line
              // Only draw this line from the last historical point to the projected point
              connectNulls={false}
              data={lineData.slice(projectionPointIndex - 1)} // Start from last historical to projection
            />
          )}
          {/* ReferenceDot for the projected value if it's a single point */}
          {projectionPointIndex !== -1 && (
            <ReferenceDot
              x={data[projectionPointIndex].name}
              y={data[projectionPointIndex].projected}
              r={5}
              fill={strokeColorProjected}
              stroke="white"
              strokeWidth={1}
              ifOverflow="extendDomain"
              isFront={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
