"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

// Iconos personalizados
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  height?: number
  showValues?: boolean
  className?: string
}

export function BarChart({
  data,
  title,
  height = 300,
  showValues = true,
  className = "",
}: BarChartProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0))

  const maxValue = Math.max(...data.map(d => d.value))
  const padding = 60

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(d => d.value))
    }, 100)
    return () => clearTimeout(timer)
  }, [data])

  const getBarColor = (index: number, customColor?: string) => {
    if (customColor) return customColor
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
    ]
    return colors[index % colors.length]
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height }} className="w-full">
          <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
            {/* Ejes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={380}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />

            {/* Barras */}
            {data.map((item, index) => {
              const barWidth = (320 / data.length) * 0.8
              const barHeight = ((animatedValues[index] || 0) / maxValue) * (height - 2 * padding)
              const x = padding + (320 / data.length) * index + (320 / data.length) * 0.1
              const y = height - padding - barHeight

              return (
                <motion.rect
                  key={item.label}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={getBarColor(index, item.color)}
                  initial={{ height: 0, y: height - padding }}
                  animate={{ height: barHeight, y: y }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="hover:opacity-80 cursor-pointer"
                />
              )
            })}

            {/* Etiquetas del eje X */}
            {data.map((item, index) => {
              const x = padding + (320 / data.length) * index + (320 / data.length) * 0.5
              const y = height - padding + 20

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7280"
                  className="truncate"
                  style={{ maxWidth: '60px' }}
                >
                  {item.label.length > 8 ? `${item.label.substring(0, 8)}...` : item.label}
                </text>
              )
            })}

            {/* Valores sobre las barras */}
            {showValues && data.map((item, index) => {
              const barHeight = (animatedValues[index] || 0) / maxValue * (height - 2 * padding)
              const x = padding + (320 / data.length) * index + (320 / data.length) * 0.5
              const y = height - padding - barHeight - 10

              if (barHeight < 30) return null // No mostrar si la barra es muy pequeña

              return (
                <motion.text
                  key={`value-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#374151"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {item.value.toLocaleString()}
                </motion.text>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

interface LineChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  height?: number
  showPoints?: boolean
  showArea?: boolean
  className?: string
}

export function LineChart({
  data,
  title,
  height = 300,
  showPoints = true,
  showArea = false,
  className = "",
}: LineChartProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0))

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  const padding = 60

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(d => d.value))
    }, 100)
    return () => clearTimeout(timer)
  }, [data])

  const getPoint = (index: number) => {
    const x = padding + (320 / (data.length - 1)) * index
    const y = height - padding - ((animatedValues[index] ?? 0 - minValue) / range) * (height - 2 * padding)
    return { x, y }
  }

  const pathData = data.map((_, index) => {
    const point = getPoint(index)
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  const areaPathData = pathData + ` L ${getPoint(data.length - 1).x} ${height - padding} L ${getPoint(0).x} ${height - padding} Z`

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height }} className="w-full">
          <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
            {/* Ejes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={380}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />

            {/* Área bajo la línea */}
            {showArea && (
              <motion.path
                d={areaPathData}
                fill="url(#areaGradient)"
                fillOpacity="0.1"
                initial={{ d: '' }}
                animate={{ d: areaPathData }}
                transition={{ duration: 1 }}
              />
            )}

            {/* Gradiente para el área */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Línea */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Puntos */}
            {showPoints && data.map((item, index) => {
              const point = getPoint(index)
              return (
                <motion.circle
                  key={`point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="hover:r-6 cursor-pointer"
                />
              )
            })}

            {/* Etiquetas del eje X */}
            {data.map((item, index) => {
              const x = padding + (320 / (data.length - 1)) * index
              const y = height - padding + 20

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {item.label}
                </text>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

interface PieChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  size?: number
  showLabels?: boolean
  showLegend?: boolean
  className?: string
}

export function PieChart({
  data,
  title,
  size = 200,
  showLabels = true,
  showLegend = true,
  className = "",
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const [animatedAngles, setAnimatedAngles] = useState<number[]>(data.map(() => 0))

  useEffect(() => {
    const timer = setTimeout(() => {
      let currentAngle = 0
      const angles = data.map(item => {
        const angle = currentAngle
        currentAngle += (item.value / total) * 360
        return angle
      })
      setAnimatedAngles(angles)
    }, 100)
    return () => clearTimeout(timer)
  }, [data, total])

  const getSliceColor = (index: number, customColor?: string) => {
    if (customColor) return customColor
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
    ]
    return colors[index % colors.length]
  }

  const createSlice = (startAngle: number, endAngle: number, radius: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = Math.cos(startAngleRad) * radius
    const y1 = Math.sin(startAngleRad) * radius
    const x2 = Math.cos(endAngleRad) * radius
    const y2 = Math.sin(endAngleRad) * radius

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div style={{ width: size, height: size }} className="relative">
            <svg width={size} height={size} viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}>
              {data.map((item, index) => {
                const startAngle = animatedAngles[index] || 0
                const endAngle = startAngle + (item.value / total) * 360
                const path = createSlice(startAngle, endAngle, size / 2 - 10)

                return (
                  <motion.path
                    key={item.label}
                    d={path}
                    fill={getSliceColor(index, item.color)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="hover:opacity-80 cursor-pointer"
                  />
                )
              })}
            </svg>

            {/* Etiquetas */}
            {showLabels && data.map((item, index) => {
              const percentage = (item.value / total) * 100
              if (percentage < 5) return null // No mostrar etiquetas para slices muy pequeñas

              const angle = (animatedAngles[index] ?? 0) + (item.value / total) * 180
              const angleRad = (angle * Math.PI) / 180
              const radius = size / 2 - 30
              const x = Math.cos(angleRad) * radius
              const y = Math.sin(angleRad) * radius

              return (
                <motion.text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {Math.round(percentage)}%
                </motion.text>
              )
            })}
          </div>

          {/* Leyenda */}
          {showLegend && (
            <div className="flex flex-wrap justify-center gap-4">
              {data.map((item, index) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getSliceColor(index, item.color) }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.label} ({((item.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
