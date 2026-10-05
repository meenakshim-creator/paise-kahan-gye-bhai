import { useState, useMemo } from 'react';
import { Plus, Target, AlertTriangle, Check, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES, getCategoryMeta, type CategoryId, type Budget } from '@/types';
import { formatCurrency, getCategoryTotals } from '@/utils';
import { ProgressBar } from '@/components/ProgressBar';
import { Modal } from '@/components/Modal';

export function Budgets() {
  const { state, addBudget, updateBudget, removeBudget } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryId | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryId>('food');

  const catTotals = useMemo(() => getCategoryTotals(state.transactions), [state.transactions]);
  const totalBudget = state.budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = state.budgets.reduce((s, b) => s + (catTotals[b.category] ?? 0), 0);

  const availableCategories = CATEGORIES.filter((c) => !state.budgets.some((b) => b.category === c.id));

  function handleSaveBudget() {
    const limit = parseFloat(amount);
    if (isNaN(limit) || limit <= 0) return;
    const budget: Budget = { category: selectedCat, limit };
    if (editingCat) {
      updateBudget(editingCat, limit);
    } else {
      addBudget(budget);
    }
    handleClose();
  }

  function handleClose() {
    setShowAdd(false);
    setEditingCat(null);
    setAmount('');
    setSelectedCat('food');
  }

  function openEdit(cat: CategoryId, limit: number) {
    setEditingCat(cat);
    setSelectedCat(cat);
    setAmount(limit.toString());
    setShowAdd(true);
  }

  function openAdd() {
    setEditingCat(null);
    setAmount('');
    if (availableCategories.length > 0) setSelectedCat(availableCategories[0].id);
    setShowAdd(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">Budgets</h1>
          <p className="text-sm text-charcoal-700/60 mt-1">
            "Bhai, budget dekh le." Set limits, stay sane.
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={availableCategories.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Budget</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Overall budget summary */}
      <div className="rounded-3xl bg-emerald-900 text-cream-50 p-6 shadow-lg overflow-hidden relative rupee-watermark">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <div className="relative">
          <p className="text-sm text-cream-50/60 uppercase tracking-wider">Total Monthly Budget</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatCurrency(totalBudget)}</span>
            <span className="text-cream-50/60">spent {formatCurrency(totalSpent)}</span>
          </div>
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-emerald-950">
              <div className="progress-fill bg-gold-500" style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }} />
            </div>
            <p className="text-xs text-cream-50/60 mt-2">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : 'No budgets set yet'}
              {' · '}{formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining
            </p>
          </div>
        </div>
      </div>

      {/* Budget cards */}
      {state.budgets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-charcoal-700/60 font-medium">Koi budget nahi set kiya bhai.</p>
          <p className="text-sm text-charcoal-700/40 mt-1">Categories pe limits lagao, overspending roko.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.budgets.map((b) => {
            const meta = getCategoryMeta(b.category);
            const spent = catTotals[b.category] ?? 0;
            const remaining = b.limit - spent;
            const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            const isOver = spent > b.limit;
            return (
              <div key={b.category} className="card-receipt rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: meta.bgColor }}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold text-charcoal-800">{meta.label}</p>
                      <p className="text-xs text-charcoal-700/50">Budget: {formatCurrency(b.limit)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b.category, b.limit)} className="p-1.5 rounded-lg hover:bg-cream-200 text-charcoal-700/50 hover:text-emerald-700 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => removeBudget(b.category)} className="p-1.5 rounded-lg hover:bg-danger-500/10 text-charcoal-700/50 hover:text-danger-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <ProgressBar
                    progress={percent}
                    color={meta.color}
                    height={10}
                    showOverflow
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-700/60">
                      Spent <span className="font-semibold text-charcoal-800">{formatCurrency(spent)}</span>
                    </span>
                    {isOver ? (
                      <span className="text-danger-500 font-semibold flex items-center gap-1">
                        <AlertTriangle size={13} /> {formatCurrency(Math.abs(remaining))} over
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check size={13} /> {formatCurrency(remaining)} left
                      </span>
                    )}
                  </div>
                  {isOver && (
                    <div className="mt-2 p-2.5 rounded-xl bg-danger-500/5 border border-danger-500/20">
                      <p className="text-xs text-danger-600 font-medium">🚨 Bhai, budget cross ho gaya.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={handleClose}
        title={editingCat ? 'Edit Budget' : 'Add Budget'}
        subtitle={editingCat ? `Update ${getCategoryMeta(editingCat).label} limit` : 'Category limit set kar bhai'}
      >
        <div className="space-y-4">
          {!editingCat && availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Category</label>
              <div className="grid grid-cols-5 gap-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                      selectedCat === cat.id
                        ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                        : 'border-cream-400/50 bg-cream-100 hover:bg-cream-200'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[9px] font-medium text-charcoal-700/70">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-800">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800"
              />
            </div>
          </div>

          <button
            onClick={handleSaveBudget}
            className="w-full py-3 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            {editingCat ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
