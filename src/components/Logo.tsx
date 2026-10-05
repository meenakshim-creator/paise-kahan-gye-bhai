import { Wallet } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: Props) {
  const sizes = {
    sm: { icon: 18, text: 'text-sm', rupee: 'text-base' },
    md: { icon: 24, text: 'text-base', rupee: 'text-xl' },
    lg: { icon: 32, text: 'text-xl', rupee: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative">
        <div className="flex items-center justify-center rounded-xl bg-emerald-800 text-gold-500 border border-gold-500/30 shadow-sm" style={{ width: s.icon + 12, height: s.icon + 12 }}>
          <span className={`font-display font-bold ${s.rupee}`}>₹</span>
        </div>
        <Wallet size={s.icon - 6} className="absolute -bottom-1 -right-1 text-cream-50 bg-emerald-700 rounded-full p-0.5 border border-gold-500/30" />
      </div>
      <div className="leading-tight">
        <span className={`font-display font-bold text-emerald-900 ${s.text}`}>
          Paise Kahan Gye Bhai?
        </span>
      </div>
    </div>
  );
}
