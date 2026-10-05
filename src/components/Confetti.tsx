import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  left: number;
  delay: number;
  color: string;
  rotation: number;
  emoji: string;
}

const EMOJIS = ['🎉', '💰', '₹', '✨', '🎊', '🪙'];
const COLORS = ['#d4a017', '#047857', '#10b981', '#f59e0b', '#e0b341'];

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newPieces: Piece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i + Date.now(),
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      rotation: Math.random() * 360,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 2000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 text-2xl"
          style={{
            left: `${p.left}%`,
            animation: `confettiFall 1.5s ease-out ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
            color: p.color,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
