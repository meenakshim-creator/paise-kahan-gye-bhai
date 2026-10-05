import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Lightbulb, ShieldCheck, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES, getCategoryMeta, type CategoryId, type Transaction } from '@/types';
import {
  formatCurrency, formatCurrencyShort, getHealthScore, getMoneyLeaks, getSavingSuggestions,
  getMonthExpenses, getMonthIncome, getMonthlySavings, getSavingsRate,
  getCategoryTotals, getTopCategory, isThisMonth, isThisYear, isWeekend,
} from '@/utils';
import { ProgressRing } from '@/components/ProgressRing';
import { ProgressBar } from '@/components/ProgressBar';
import { DonutChart } from '@/components/DonutChart';
import { Modal } from '@/components/Modal';

type ReportRange = 'week' | 'month' | 'year';

export function Insights() {
  const { state, addSubscription, deleteSubscription } = useStore();
  const [showSubForm, setShowSubForm] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subIcon, setSubIcon] = useState('📺');
  const [showLeakSuggestions, setShowLeakSuggestions] = useState(false);
  const [reportRange, setReportRange] = useState<ReportRange>('month');

  const health = useMemo(() => getHealthScore(state), [state]);
  const leaks = useMemo(() => getMoneyLeaks(state), [state]);
  const suggestions = useMemo(() => getSavingSuggestions(state), [state]);

  const income = useMemo(() => getMonthIncome(state.transactions, state.monthlyIncome), [state.transactions, state.monthlyIncome]);
  const expenses = useMemo(() => getMonthExpenses(state.transactions), [state.transactions]);
  const savings = useMemo(() => getMonthlySavings(income, expenses), [income, expenses]);
  const savingsRate = getSavingsRate(income, expenses);

  const subTotal = state.subscriptions.reduce((s, sub) => s + sub.amount, 0);

  // Report data
  const reportTransactions = useMemo(() => {
    return state.transactions.filter((t) => {
      if (reportRange === 'week') {
        const d = new Date(t.date);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return d >= weekAgo;
      }
      if (reportRange === 'month') return isThisMonth(t.date);
      if (reportRange === 'year') return isThisYear(t.date);
      return true;
    });
  }, [state.transactions, reportRange]);

  const reportExpenses = reportTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const reportIncome = reportTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const reportSavings = Math.max(0, reportIncome - reportExpenses);
  const reportSavingsRate = reportIncome > 0 ? (reportSavings / reportIncome) * 100 : 0;
  const reportCatTotals: Record<string, number> = {};
  for (const t of reportTransactions) {
    if (t.type !== 'expense') continue;
    reportCatTotals[t.category] = (reportCatTotals[t.category] ?? 0) + t.amount;
  }
  const reportTopCat = Object.entries(reportCatTotals).sort(([, a], [, b]) => b - a)[0] ?? null;
  const reportBiggest = reportTransactions.filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0] ?? null;
  const reportDonut = Object.entries(reportCatTotals)
    .map(([id, value]) => {
      const meta = getCategoryMeta(id as CategoryId);
      return { label: meta.label, value, color: meta.color };
    })
    .sort((a, b) => b.value - a.value);

  // Weekly chart data for the month
  const weeklyData = useMemo(() => {
    const weeks = [0, 0, 0, 0, 0];
    for (const t of state.transactions) {
      if (t.type !== 'expense' || !isThisMonth(t.date)) continue;
      const day = new Date(t.date).getDate();
      const weekIdx = Math.min(4, Math.floor((day - 1) / 7));
      weeks[weekIdx] += t.amount;
    }
    return weeks;
  }, [state.transactions]);
  const maxWeekly = Math.max(...weeklyData, 1);

  // Day-of-week pattern
  const dayPattern = useMemo(() => {
    const days = [0, 0, 0, 0, 0, 0, 0];
    for (const t of state.transactions) {
      if (t.type !== 'expense' || !isThisMonth(t.date)) continue;
      days[new Date(t.date).getDay()] += t.amount;
    }
    return days;
  }, [state.transactions]);
  const maxDay = Math.max(...dayPattern, 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function handleAddSub() {
    const amt = parseFloat(subAmount);
    if (!subName.trim() || isNaN(amt) || amt <= 0) return;
    addSubscription({ name: subName.trim(), amount: amt, icon: subIcon });
    setSubName('');
    setSubAmount('');
    setSubIcon('📺');
    setShowSubForm(false);
  }

  const healthBars = [
    { label: 'Savings', value: health.savings, color: '#047857' },
    { label: 'Budget Discipline', value: health.budget, color: '#d4a017' },
    { label: 'Spending Control', value: health.spending, color: '#3b82f6' },
    { label: 'Emergency Fund', value: health.emergency, color: '#ec4899' },
  ];

  const SUB_ICONS = ['📺', '🎵', '📦', '📰', '🎮', '💻', '🏋️', '📚', '☁️', '🎨'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">Insights</h1>
        <p className="text-sm text-charcoal-700/60 mt-1">Paisa kahan leak ho raha hai? Pata karo. 🕵️</p>
      </div>

      {/* Financial Health Score */}
      <div className="card-receipt rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={20} className="text-emerald-700" />
          <h2 className="font-display text-lg font-bold text-charcoal-800">Financial Health</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <ProgressRing
              progress={health.total}
              size={140}
              strokeWidth={12}
              color={health.total >= 70 ? '#047857' : health.total >= 40 ? '#d4a017' : '#ef4444'}
              label={`${health.total}`}
              sublabel="/ 100"
            />
          </div>
          <div className="flex-1 w-full space-y-3">
            {healthBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-charcoal-700/70">{bar.label}</span>
                  <span className="font-semibold text-charcoal-800">{bar.value}</span>
                </div>
                <ProgressBar progress={bar.value} color={bar.color} height={6} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-600/15">
          <p className="text-sm text-emerald-800 font-medium">{health.message}</p>
        </div>
      </div>

      {/* Money Leak Detector */}
      <div className="card-receipt rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-danger-500" />
          <h2 className="font-display text-lg font-bold text-charcoal-800">Money Leak Detector 🕵️‍♂️</h2>
        </div>

        <div className="space-y-2">
          {leaks.map((leak, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-danger-500/5 border border-danger-500/15">
              <span className="text-xl shrink-0">{leak.icon}</span>
              <div>
                <p className="text-sm font-medium text-charcoal-800">{leak.title}</p>
                <p className="text-xs text-charcoal-700/50 mt-0.5">{leak.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowLeakSuggestions(!showLeakSuggestions)}
            className="w-full py-3 rounded-xl bg-danger-500 text-white font-semibold hover:bg-danger-600 transition-colors flex items-center justify-center gap-2"
          >
            {showLeakSuggestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Mera Paisa Bachao
          </button>

          {showLeakSuggestions && (
            <div className="mt-3 space-y-2 animate-slide-up">
              <p className="text-sm font-bold text-charcoal-800 mb-2">Bachat ka Jugaad 💡</p>
              {suggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
                  <span className="text-xl shrink-0">{sug.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-charcoal-800">{sug.title}</p>
                    <p className="text-xs text-charcoal-700/50 mt-0.5">{sug.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Saving Suggestions section */}
      <div className="card-receipt rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-gold-500" />
          <h2 className="font-display text-lg font-bold text-charcoal-800">Bachat Ka Jugaad 💡</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((sug, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-cream-200/40 border border-cream-400/30">
              <span className="text-2xl shrink-0">{sug.icon}</span>
              <div>
                <p className="text-sm font-medium text-charcoal-800">{sug.title}</p>
                <p className="text-xs text-charcoal-700/50 mt-0.5">{sug.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="card-receipt rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-charcoal-800">
              Subscriptions Jo Chupke-Chupke Paisa Kha Rahe Hain 👀
            </h2>
          </div>
          <button
            onClick={() => setShowSubForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800 text-cream-50 text-sm font-medium hover:bg-emerald-900 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {state.subscriptions.length === 0 ? (
            <p className="text-sm text-charcoal-700/50 text-center py-4">Koi subscription nahi. Bhai tu toh clean hai!</p>
          ) : (
            state.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream-200/40 group hover:bg-cream-200/60 transition-colors">
                <span className="text-2xl">{sub.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-charcoal-800">{sub.name}</p>
                  <p className="text-xs text-charcoal-700/50">{formatCurrency(sub.amount)}/month</p>
                </div>
                <span className="font-display font-bold text-sm text-charcoal-800">{formatCurrency(sub.amount * 12)}/yr</span>
                <button
                  onClick={() => deleteSubscription(sub.id)}
                  className="p-1.5 rounded-lg hover:bg-danger-500/10 text-charcoal-700/40 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {state.subscriptions.length > 0 && (
          <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-charcoal-700/70">Total monthly subscriptions</span>
              <span className="font-display text-xl font-bold text-gold-600">{formatCurrency(subTotal)}</span>
            </div>
            <p className="text-sm text-charcoal-700/60 font-medium">
              {formatCurrency(subTotal * 12)}/year sirf subscriptions mein. Soch bhai. 🤔
            </p>
          </div>
        )}
      </div>

      {/* Monthly Report */}
      <div className="card-receipt rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-emerald-700" />
            <h2 className="font-display text-lg font-bold text-charcoal-800">Monthly Report</h2>
          </div>
          <div className="flex gap-1 p-1 bg-cream-200 rounded-xl">
            {(['week', 'month', 'year'] as ReportRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setReportRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  reportRange === r ? 'bg-emerald-800 text-cream-50 shadow-sm' : 'text-charcoal-700/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Income', value: reportIncome, color: 'text-emerald-600' },
            { label: 'Expenses', value: reportExpenses, color: 'text-danger-500' },
            { label: 'Savings', value: reportSavings, color: 'text-gold-600' },
            { label: 'Savings Rate', value: null, display: `${reportSavingsRate.toFixed(0)}%`, color: 'text-emerald-700' },
            { label: 'Transactions', value: null, display: `${reportTransactions.length}`, color: 'text-charcoal-800' },
            { label: 'Avg / Transaction', value: reportTransactions.length > 0 ? reportExpenses / reportTransactions.filter(t => t.type === 'expense').length : 0, color: 'text-charcoal-800' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-cream-200/40">
              <p className="text-xs text-charcoal-700/50">{stat.label}</p>
              <p className={`font-display text-lg font-bold ${stat.color} mt-0.5`}>
                {stat.display ?? formatCurrency(stat.value ?? 0)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {reportTopCat && (
            <div className="p-3 rounded-xl bg-cream-200/40">
              <p className="text-xs text-charcoal-700/50">Highest Category</p>
              <p className="font-display font-bold text-charcoal-800 mt-0.5">
                {getCategoryMeta(reportTopCat[0] as CategoryId).icon} {getCategoryMeta(reportTopCat[0] as CategoryId).label}
              </p>
            </div>
          )}
          {reportBiggest && (
            <div className="p-3 rounded-xl bg-cream-200/40">
              <p className="text-xs text-charcoal-700/50">Biggest Expense</p>
              <p className="font-display font-bold text-charcoal-800 mt-0.5">
                {reportBiggest.merchant} — {formatCurrency(reportBiggest.amount)}
              </p>
            </div>
          )}
        </div>

        {/* Donut + bars */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <DonutChart
            segments={reportDonut}
            size={150}
            strokeWidth={20}
            centerValue={formatCurrencyShort(reportExpenses)}
            centerLabel={reportRange}
          />
          <div className="flex-1 w-full space-y-2">
            {reportDonut.slice(0, 6).map((seg) => {
              const pct = reportExpenses > 0 ? (seg.value / reportExpenses) * 100 : 0;
              return (
                <div key={seg.label}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-charcoal-700/70">{seg.label}</span>
                    <span className="font-semibold text-charcoal-800">{formatCurrency(seg.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div className="progress-fill h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly spending bar chart */}
        <div className="mb-6">
          <p className="text-sm font-bold text-charcoal-800 mb-3">Weekly Spending (This Month)</p>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[60px] rounded-t-lg bg-gradient-to-t from-emerald-800 to-emerald-500 progress-fill"
                    style={{ height: `${(val / maxWeekly) * 100}%` }}
                    title={formatCurrency(val)}
                  />
                </div>
                <span className="text-[10px] text-charcoal-700/50">W{i + 1}</span>
                <span className="text-[10px] font-semibold text-charcoal-800">{formatCurrencyShort(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-week pattern */}
        <div>
          <p className="text-sm font-bold text-charcoal-800 mb-3">Spending by Day of Week</p>
          <div className="flex items-end justify-between gap-1 h-24">
            {dayPattern.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={`w-full max-w-[40px] rounded-t-md progress-fill ${isWeekend(new Date(Date.now() - i * 0).toISOString()) && (i === 0 || i === 6) ? 'bg-gold-500' : 'bg-emerald-600'}`}
                    style={{ height: `${(val / maxDay) * 100}%` }}
                    title={formatCurrency(val)}
                  />
                </div>
                <span className="text-[10px] text-charcoal-700/50">{dayNames[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      <Modal
        open={showSubForm}
        onClose={() => setShowSubForm(false)}
        title="Add Subscription"
        subtitle="Aur kitne chupke-chupke paisa kha rahe hain?"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {SUB_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setSubIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-all ${
                    subIcon === ic ? 'border-emerald-600 bg-emerald-50 scale-110' : 'border-cream-400/50 bg-cream-100 hover:bg-cream-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Name</label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. Netflix, Spotify"
              className="w-full px-4 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm text-charcoal-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Monthly Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-800">₹</span>
              <input
                type="number"
                value={subAmount}
                onChange={(e) => setSubAmount(e.target.value)}
                placeholder="649"
                className="w-full pl-8 pr-3 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm font-semibold text-charcoal-800"
              />
            </div>
          </div>
          <button
            onClick={handleAddSub}
            className="w-full py-3 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            Add Subscription
          </button>
        </div>
      </Modal>
    </div>
  );
}
