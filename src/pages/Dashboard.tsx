import { useState, useMemo } from 'react';
import { Plus, TrendingDown, TrendingUp, PiggyBank, Search, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES, getCategoryMeta, type Transaction } from '@/types';
import {
  formatCurrency, formatCurrencyShort, formatDate, getGreeting,
  getMonthExpenses, getMonthIncome, getMonthlySavings, getSavingsRate,
  getCategoryTotals, getTopCategory, getFinanceStatus,
} from '@/utils';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { DonutChart } from '@/components/DonutChart';
import { ProgressBar } from '@/components/ProgressBar';
import { ExpenseForm } from '@/components/ExpenseForm';
import { MoneyFlowModal } from '@/components/MoneyFlowModal';
import type { Page } from '@/components/Navigation';

interface Props {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: Props) {
  const { state, addTransaction, deleteTransaction } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showMoneyFlow, setShowMoneyFlow] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const income = useMemo(() => getMonthIncome(state.transactions, state.monthlyIncome), [state.transactions, state.monthlyIncome]);
  const expenses = useMemo(() => getMonthExpenses(state.transactions), [state.transactions]);
  const savings = useMemo(() => getMonthlySavings(income, expenses), [income, expenses]);
  const available = Math.max(0, income - expenses);
  const savingsRate = getSavingsRate(income, expenses);
  const status = getFinanceStatus(expenses, income, savings);

  const catTotals = useMemo(() => getCategoryTotals(state.transactions), [state.transactions]);
  const donutSegments = useMemo(() => {
    return Object.entries(catTotals)
      .map(([id, value]) => {
        const meta = getCategoryMeta(id as CategoryId);
        return { label: meta.label, value, color: meta.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [catTotals]);

  const topCategory = useMemo(() => getTopCategory(state.transactions), [state.transactions]);
  const topMeta = topCategory ? getCategoryMeta(topCategory.id) : null;

  const recentTransactions = useMemo(() => {
    return [...state.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [state.transactions]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups: { label: string; items: Transaction[] }[] = [];
    for (const t of recentTransactions) {
      const label = formatDate(t.date);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(t);
      else groups.push({ label, items: [t] });
    }
    return groups;
  }, [recentTransactions]);

  const spendPercent = income > 0 ? (expenses / income) * 100 : 0;
  const savePercent = income > 0 ? (savings / income) * 100 : 0;

  const statusTones: Record<string, string> = {
    good: 'bg-emerald-50 border-emerald-600/20 text-emerald-800',
    excellent: 'bg-gold-500/5 border-gold-500/20 text-gold-600',
    warning: 'bg-warning-500/5 border-warning-500/20 text-warning-600',
    danger: 'bg-danger-500/5 border-danger-500/20 text-danger-600',
  };

  return (
    <div className="space-y-6">
      {/* Greeting + Add button */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-charcoal-700/60">{getGreeting()},</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">
            {state.profileName} <span className="inline-block animate-wiggle">👋</span>
          </h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Hero Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main hero card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-emerald-900 text-cream-50 p-6 sm:p-8 shadow-lg rupee-watermark">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full -translate-y-20 translate-x-20 blur-2xl" />
          <div className="relative">
            <p className="text-sm text-cream-50/60 uppercase tracking-wider font-medium">This Month</p>
            <div className="mt-3 flex items-baseline gap-3">
              <AnimatedNumber amount={expenses} className="font-display text-4xl sm:text-5xl font-bold text-cream-50" />
              <span className="text-cream-50/60 text-lg">Spent</span>
            </div>

            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-cream-50/70">Monthly Income: {formatCurrency(income)}</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-emerald-950">
                  <div className="progress-fill bg-gold-500" style={{ width: `${Math.min(100, spendPercent)}%` }} />
                  <div className="progress-fill bg-emerald-400" style={{ width: `${Math.min(100 - spendPercent, savePercent)}%` }} />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-cream-50/60">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-500" />Spent {formatCurrencyShort(expenses)}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Saved {formatCurrencyShort(savings)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-emerald-950/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-cream-50/60 text-xs mb-1">
                  <TrendingUp size={14} /> Remaining
                </div>
                <AnimatedNumber amount={available} className="font-display text-2xl font-bold text-emerald-300" />
              </div>
              <div className="bg-emerald-950/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-cream-50/60 text-xs mb-1">
                  <PiggyBank size={14} /> Saved
                </div>
                <AnimatedNumber amount={savings} className="font-display text-2xl font-bold text-gold-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Status + Money Flow */}
        <div className="space-y-4">
          <div className={`rounded-3xl border-2 p-6 ${statusTones[status.tone]}`}>
            <div className="text-4xl mb-2">{status.emoji}</div>
            <p className="font-display text-lg font-bold leading-tight">{status.message}</p>
            <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
              <Sparkles size={12} />
              Savings rate: {savingsRate.toFixed(0)}%
            </div>
          </div>

          <button
            onClick={() => setShowMoneyFlow(true)}
            className="w-full rounded-3xl bg-cream-50 border border-cream-400/50 p-5 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-base font-bold text-charcoal-800">Mera Paisa Kahan Gaya?</p>
                <p className="text-xs text-charcoal-700/50 mt-0.5">Trace karte hain 💸</p>
              </div>
              <ChevronRight size={20} className="text-charcoal-700/40 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Breakdown + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Paise Kahan Gye breakdown */}
        <div className="card-receipt rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-charcoal-800">Paise Kahan Gye? 👀</h2>
            <button onClick={() => onNavigate('insights')} className="text-xs text-emerald-700 font-medium hover:underline">
              View all
            </button>
          </div>

          <div className="flex items-center gap-6">
            <DonutChart
              segments={donutSegments}
              size={160}
              strokeWidth={22}
              centerValue={formatCurrencyShort(expenses)}
              centerLabel="total"
            />
            <div className="flex-1 space-y-2">
              {donutSegments.slice(0, 5).map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-charcoal-700/70 flex-1">{seg.label}</span>
                  <span className="font-semibold text-charcoal-800">{formatCurrency(seg.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {topMeta && (
            <div className="mt-4 p-3 rounded-xl bg-cream-200/50 text-sm">
              <p className="text-charcoal-700/80">
                <span className="text-lg">{topMeta.icon}</span>{' '}
                <span className="font-semibold">{topMeta.label} is eating your money. Literally.</span>
              </p>
              <p className="text-xs text-charcoal-700/50 mt-0.5">
                You spent {formatCurrency(topCategory!.amount)} on {topMeta.label.toLowerCase()} this month.
              </p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card-receipt rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-charcoal-800">Recent Transactions</h2>
            <button onClick={() => onNavigate('expenses')} className="text-xs text-emerald-700 font-medium hover:underline">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-medium text-charcoal-700/40 uppercase tracking-wider mb-2">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((t) => {
                    const meta = getCategoryMeta(t.category);
                    const isIncome = t.type === 'income';
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-cream-200/50 transition-colors group cursor-pointer"
                        onClick={() => { setEditing(t); setShowAdd(true); }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: meta.bgColor }}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal-800 truncate">{t.merchant}</p>
                          <p className="text-xs text-charcoal-700/50">{meta.label} · {t.paymentMethod}</p>
                        </div>
                        <div className={`font-display font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-charcoal-800'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Budgets', icon: '🎯', page: 'budgets' as const, desc: 'Set limits' },
          { label: 'Savings', icon: '🐷', page: 'savings' as const, desc: 'Set goals' },
          { label: 'Insights', icon: '📊', page: 'insights' as const, desc: 'Health score' },
          { label: 'Leaks', icon: '🕵️', page: 'insights' as const, desc: 'Money leaks' },
        ].map((link) => (
          <button
            key={link.label}
            onClick={() => onNavigate(link.page)}
            className="card-receipt rounded-2xl p-4 text-left hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-1">{link.icon}</div>
            <p className="font-display font-bold text-sm text-charcoal-800">{link.label}</p>
            <p className="text-xs text-charcoal-700/50">{link.desc}</p>
          </button>
        ))}
      </div>

      <ExpenseForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(tx) => {
          if (editing) {
            deleteTransaction(editing.id);
          }
          addTransaction(tx);
        }}
        onDelete={deleteTransaction}
        editing={editing}
      />
      <MoneyFlowModal
        open={showMoneyFlow}
        onClose={() => setShowMoneyFlow(false)}
        income={income}
        expenses={expenses}
        savings={savings}
      />
    </div>
  );
}
