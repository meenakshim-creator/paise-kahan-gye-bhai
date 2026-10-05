import { useState } from 'react';
import { Modal } from './Modal';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCurrency } from '@/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  income: number;
  expenses: number;
  savings: number;
}

export function MoneyFlowModal({ open, onClose, income, expenses, savings }: Props) {
  const [step, setStep] = useState(0);
  const available = Math.max(0, income - expenses - savings);

  const steps = [
    { label: 'Paisa aaya', amount: income, emoji: '💰', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Kharch ho gaya', amount: expenses, emoji: '💸', color: 'text-danger-500', bg: 'bg-danger-500/5' },
    { label: 'Bach gaya', amount: savings, emoji: '🐷', color: 'text-gold-600', bg: 'bg-gold-500/5' },
    { label: 'Abhi zinda hai', amount: available, emoji: '✨', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  function handleOpen() {
    setStep(0);
    const timers: number[] = [];
    steps.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i + 1), (i + 1) * 700));
    });
    return () => timers.forEach(clearTimeout);
  }

  // Reset when opened
  if (open && step === 0) {
    setTimeout(() => {
      if (step === 0) setStep(1);
      setTimeout(() => { setStep(2) }, 700);
      setTimeout(() => { setStep(3) }, 1400);
      setTimeout(() => { setStep(4) }, 2100);
    }, 100);
  }

  return (
    <Modal open={open} onClose={onClose} title="Mera Paisa Kahan Gaya? 💸" subtitle="Chal, trace karte hain.">
      <div className="space-y-3">
        {steps.map((s, i) => {
          const visible = step > i;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${s.bg} border-cream-400/40`}
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="flex-1">
                <p className="text-sm text-charcoal-700/60">{s.label}</p>
                <p className={`font-display text-2xl font-bold ${s.color}`}>
                  {visible ? <AnimatedNumber amount={s.amount} /> : formatCurrency(0)}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`text-2xl transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>↓</div>
              )}
            </div>
          );
        })}

        {step >= 4 && (
          <div className="text-center pt-4 animate-bounce-in">
            <p className="text-lg font-display font-bold text-emerald-800">
              Congratulations. Tumhara paisa abhi completely extinct nahi hua. 🎉
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors"
            >
              Nice, bhai.
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
