import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { CATEGORIES, PAYMENT_METHODS, getCategoryMeta, type CategoryId, type PaymentMethod, type Transaction, type TransactionType } from '@/types';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onDelete?: (id: string) => void;
  editing?: Transaction | null;
}

export function ExpenseForm({ open, onClose, onSave, onDelete, editing }: Props) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? 'expense');
  const [merchant, setMerchant] = useState(editing?.merchant ?? '');
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'food');
  const [amount, setAmount] = useState(editing?.amount.toString() ?? '');
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editing?.paymentMethod ?? 'UPI');
  const [note, setNote] = useState(editing?.note ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!merchant.trim()) { setError('Naam toh daal bhai'); return; }
    if (isNaN(amt) || amt <= 0) { setError('Sahi amount daal'); return; }
    setError('');
    onSave({
      type,
      merchant: merchant.trim(),
      category,
      amount: amt,
      date,
      paymentMethod,
      note: note.trim() || undefined,
    });
    handleClose();
  }

  function handleClose() {
    setMerchant('');
    setAmount('');
    setNote('');
    setError('');
    setType('expense');
    setCategory('food');
    setPaymentMethod('UPI');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  }

  const expenseCategories = CATEGORIES;
  const incomeCategory: CategoryId = 'other';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
      subtitle={editing ? 'Update the details below' : 'Paise kahan gaye? Bata de bhai.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-cream-200 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'expense' ? 'bg-danger-500 text-white shadow-sm' : 'text-charcoal-700/60'
            }`}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory(incomeCategory); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-charcoal-700/60'
            }`}
          >
            💰 Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-800">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800"
            />
          </div>
        </div>

        {/* Merchant */}
        <div>
          <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Merchant / Source</label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="e.g. Zomato, Salary, BigBasket"
            className="w-full px-4 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800 text-sm"
          />
        </div>

        {/* Category */}
        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    category === cat.id
                      ? 'border-emerald-600 bg-emerald-50 shadow-sm scale-105'
                      : 'border-cream-400/50 bg-cream-100 hover:bg-cream-200'
                  }`}
                  title={cat.label}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[9px] font-medium text-charcoal-700/70 leading-none">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date + Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Payment</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800 text-sm"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Note <span className="text-charcoal-700/40">(optional)</span></label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kya liya? Kyun liya?"
            className="w-full px-4 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800 text-sm"
          />
        </div>

        {error && <p className="text-sm text-danger-500 font-medium">{error}</p>}

        <div className="flex gap-3 pt-2">
          {editing && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(editing.id); handleClose(); }}
              className="px-4 py-3 rounded-xl bg-danger-500/10 text-danger-500 hover:bg-danger-500/20 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            {editing ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export { getCategoryMeta };
