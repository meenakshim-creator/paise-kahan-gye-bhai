import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-cream-50 px-6 pt-5 pb-4 border-b border-cream-400/40 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-800">{title}</h2>
              {subtitle && <p className="text-sm text-charcoal-700/60 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-cream-200 transition-colors text-charcoal-700/60"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
