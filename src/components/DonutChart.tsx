interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, size = 200, strokeWidth = 28, centerLabel, centerValue }: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e8dcb8"
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null;
          const fraction = seg.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const dashOffset = offset * circumference;
          offset += fraction;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-dashOffset}
              style={{
                transition: 'stroke-dasharray 1s cubic-bezier(0.65,0,0.35,1), stroke-dashoffset 1s cubic-bezier(0.65,0,0.35,1)',
              }}
            />
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="font-display text-2xl font-bold text-charcoal-800">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-charcoal-700/60 mt-0.5">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
