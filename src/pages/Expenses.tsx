import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2, Edit3, TrendingDown, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';
import { CATEGORIES, getCategoryMeta, type Transaction, type CategoryId } from '@/types';
import { formatCurrency, formatDate, getMonthExpenses } from '@/utils';
import { ExpenseForm } from '@/components/ExpenseForm';

export function Expenses() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const monthExpenses = useMemo(() => getMonthExpenses(state.transactions), [state.transactions]);

  const filtered = useMemo(() => {
    return state.transactions
      .filter((t) => {
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!t.merchant.toLowerCase().includes(q) && !(t.note?.toLowerCase().includes(q) ?? false)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, filterCategory, filterType, search]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Transaction[] }[] = [];
    for (const t of filtered) {
      const label = formatDate(t.date);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(t);
      else groups.push({ label, items: [t] });
    }
    return groups;
  }, [filtered]);

  function handleSave(tx: Omit<Transaction, 'id'>) {
    if (editing) {
      updateTransaction(editing.id, tx);
    } else {
      addTransaction(tx);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">Expenses</h1>
          <p className="text-sm text-charcoal-700/60 mt-1">
            This month: <span className="font-semibold text-charcoal-800">{formatCurrency(monthExpenses)}</span> gone.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-700/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant ya note..."
            className="w-full pl-11 pr-4 py-2.5 bg-cream-50 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm text-charcoal-800"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'all' ? 'bg-emerald-800 text-cream-50' : 'bg-cream-50 border border-cream-400/50 text-charcoal-700/70'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'expense' ? 'bg-danger-500 text-white' : 'bg-cream-50 border border-cream-400/50 text-charcoal-700/70'
            }`}
          >
            💸 Expenses
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'income' ? 'bg-emerald-600 text-white' : 'bg-cream-50 border border-cream-400/50 text-charcoal-700/70'
            }`}
          >
            💰 Income
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            filterCategory === 'all' ? 'bg-charcoal-800 text-cream-50' : 'bg-cream-50 border border-cream-400/50 text-charcoal-700/70 hover:bg-cream-200'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              filterCategory === cat.id ? 'bg-charcoal-800 text-cream-50' : 'bg-cream-50 border border-cream-400/50 text-charcoal-700/70 hover:bg-cream-200'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-charcoal-700/60 font-medium">Koi transaction nahi mila bhai.</p>
          <p className="text-sm text-charcoal-700/40 mt-1">Try a different filter or search.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.label} className="card-receipt rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-cream-200/40 border-b border-cream-400/30 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-700/50 uppercase tracking-wider">{group.label}</span>
                <span className="text-xs text-charcoal-700/40">{group.items.length} transactions</span>
              </div>
              <div className="divide-y divide-cream-400/20">
                {group.items.map((t) => {
                  const meta = getCategoryMeta(t.category);
                  const isIncome = t.type === 'income';
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-100/50 transition-colors group"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: meta.bgColor }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-charcoal-800 truncate">{t.merchant}</p>
                        <div className="flex items-center gap-2 text-xs text-charcoal-700/50">
                          <span>{meta.label}</span>
                          <span>·</span>
                          <span>{t.paymentMethod}</span>
                          {t.note && (<><span>·</span><span className="truncate italic">{t.note}</span></>)}
                        </div>
                      </div>
                      <div className={`font-display font-bold text-sm shrink-0 ${isIncome ? 'text-emerald-600' : 'text-charcoal-800'}`}>
                        <span className="flex items-center gap-0.5">
                          {isIncome ? <TrendingUp size={12} className="text-emerald-600" /> : <TrendingDown size={12} className="text-charcoal-700/40" />}
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditing(t); setShowAdd(true); }}
                          className="p-1.5 rounded-lg hover:bg-cream-200 text-charcoal-700/50 hover:text-emerald-700 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-500/10 text-charcoal-700/50 hover:text-danger-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExpenseForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        onDelete={deleteTransaction}
        editing={editing}
      />
    </div>
  );
}
