interface SparklineProps {
  data: number[]
  /** Stroke color. */
  color?: string
  width?: number
  height?: number
  className?: string
}

/**
 * Minimal inline sparkline. Renders a smooth-ish polyline of the
 * given series with a soft area fill. Purely decorative — the exact
 * numbers live in the stat tiles, so no axes/labels here.
 */
export default function Sparkline({
  data,
  color = "#FF6B4A",
  width = 96,
  height = 28,
  className,
}: SparklineProps) {
  if (data.length < 2 || data.every((d) => d === 0)) {
    // Flat baseline for empty/no-revenue series.
    return (
      <svg
        width={width}
        height={height}
        className={className}
        aria-hidden="true"
        role="presentation"
      >
        <line
          x1={0}
          y1={height - 2}
          x2={width}
          y2={height - 2}
          stroke="currentColor"
          className="text-zinc-200"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pad = 2

  const points = data.map((value, i) => {
    const x = i * stepX
    const y = pad + (1 - (value - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x},${y}`).join(" ")
  const area = `${points[0][0]},${height} ${line} ${points[points.length - 1][0]},${height}`
  const gradId = `spark-${color.replace("#", "")}`

  return (
    <svg
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
