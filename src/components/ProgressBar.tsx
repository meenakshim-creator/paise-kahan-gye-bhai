interface Props {
  progress: number; // 0-100, can exceed 100 for overspending
  color?: string;
  trackColor?: string;
  height?: number;
  showOverflow?: boolean;
}

export function ProgressBar({ progress, color = '#047857', trackColor = '#f3ecd4', height = 8, showOverflow = false }: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  const isOver = progress > 100;
  const barColor = isOver ? '#ef4444' : color;

  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, backgroundColor: trackColor }}>
      <div
        className="progress-fill h-full rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundColor: barColor,
        }}
      />
      {showOverflow && isOver && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
          <span className="text-[10px] font-bold text-white">!</span>
        </div>
      )}
    </div>
  );
}
