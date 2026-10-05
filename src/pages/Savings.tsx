import { useState } from 'react';
import { Plus, Target, Trash2, Sparkles, Check } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, uid } from '@/utils';
import { ProgressRing } from '@/components/ProgressRing';
import { Modal } from '@/components/Modal';
import { Confetti } from '@/components/Confetti';

const GOAL_ICONS = ['🎧', '✈️', '💻', '📱', '🚗', '🏠', '🎸', '⌚', '📷', '🎓', '💍', '🏝️', '🛵', '💰'];

export function Savings() {
  const { state, addGoal, deleteGoal, addToGoal } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [icon, setIcon] = useState('🎧');
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [confettiGoal, setConfettiGoal] = useState<string | null>(null);

  function handleAddGoal() {
    const t = parseFloat(target);
    const s = parseFloat(saved) || 0;
    if (!name.trim() || isNaN(t) || t <= 0) return;
    addGoal({ name: name.trim(), target: t, saved: Math.min(s, t), icon });
    handleClose();
  }

  function handleClose() {
    setShowAdd(false);
    setName('');
    setTarget('');
    setSaved('');
    setIcon('🎧');
  }

  function handleContribute() {
    if (!contribGoalId) return;
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) return;
    const goal = state.goals.find((g) => g.id === contribGoalId);
    if (!goal) return;
    const wasIncomplete = goal.saved < goal.target;
    addToGoal(contribGoalId, amt);
    if (wasIncomplete && goal.saved + amt >= goal.target) {
      setConfettiGoal(contribGoalId);
      setTimeout(() => setConfettiGoal(null), 2000);
    }
    setContribGoalId(null);
    setContribAmount('');
  }

  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      <Confetti trigger={confettiGoal !== null} />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">Sapne Bade Hain</h1>
          <p className="text-sm text-charcoal-700/60 mt-1">Savings bhi honi chahiye. 🐷</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Overall progress */}
      {state.goals.length > 0 && (
        <div className="rounded-3xl bg-emerald-900 text-cream-50 p-6 shadow-lg overflow-hidden relative rupee-watermark">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <div className="relative flex items-center gap-6">
            <ProgressRing
              progress={overallPercent}
              size={100}
              strokeWidth={10}
              color="#d4a017"
              trackColor="#064e3b"
              label={`${overallPercent.toFixed(0)}%`}
              sublabel="there"
            />
            <div>
              <p className="text-sm text-cream-50/60">Total Savings Progress</p>
              <p className="font-display text-3xl font-bold mt-1">{formatCurrency(totalSaved)}</p>
              <p className="text-sm text-cream-50/60 mt-0.5">of {formatCurrency(totalTarget)} target</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals grid */}
      {state.goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-charcoal-700/60 font-medium">Koi savings goal nahi hai.</p>
          <p className="text-sm text-charcoal-700/40 mt-1">Ek goal banao, paisa bachana shuru karo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.goals.map((g) => {
            const percent = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            const isComplete = g.saved >= g.target;
            return (
              <div
                key={g.id}
                className={`card-receipt rounded-3xl p-6 shadow-sm group hover:shadow-md transition-all relative overflow-hidden ${
                  isComplete ? 'ring-2 ring-gold-500 animate-pulse-gold' : ''
                }`}
              >
                {isComplete && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center gap-1">
                    <Sparkles size={12} /> Done!
                  </div>
                )}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{g.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-charcoal-800">{g.name}</h3>
                    <p className="text-xs text-charcoal-700/50 mt-0.5">Goal: {formatCurrency(g.target)}</p>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1.5 rounded-lg hover:bg-danger-500/10 text-charcoal-700/40 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <ProgressRing
                    progress={percent}
                    size={90}
                    strokeWidth={8}
                    color={isComplete ? '#d4a017' : '#047857'}
                    label={formatCurrency(g.saved).replace('₹', '')}
                    sublabel={`of ${formatCurrency(g.target)}`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-700/60">Saved</span>
                      <span className="font-semibold text-emerald-700">{formatCurrency(g.saved)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-700/60">Remaining</span>
                      <span className="font-semibold text-charcoal-800">{formatCurrency(Math.max(0, g.target - g.saved))}</span>
                    </div>
                    <button
                      onClick={() => setContribGoalId(g.id)}
                      disabled={isComplete}
                      className="w-full mt-2 py-2 rounded-lg bg-emerald-800/5 border border-emerald-800/10 text-emerald-800 font-medium text-sm hover:bg-emerald-800/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isComplete ? '🎉 Bhai ne kar dikhaya!' : '+ Add Savings'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal
        open={showAdd}
        onClose={handleClose}
        title="New Savings Goal"
        subtitle="Sapna bada ho, planning solid honi chahiye."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-all ${
                    icon === ic ? 'border-emerald-600 bg-emerald-50 scale-110' : 'border-cream-400/50 bg-cream-100 hover:bg-cream-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa Trip, New Laptop"
              className="w-full px-4 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm text-charcoal-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-800">₹</span>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="20000"
                  className="w-full pl-8 pr-3 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm font-semibold text-charcoal-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700/80 mb-1.5">Already Saved</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-800">₹</span>
                <input
                  type="number"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-sm font-semibold text-charcoal-800"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAddGoal}
            className="w-full py-3 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            Create Goal
          </button>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        open={contribGoalId !== null}
        onClose={() => { setContribGoalId(null); setContribAmount(''); }}
        title="Add to Savings"
        subtitle="Piggy bank mein daal bhai 🐷"
      >
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-800">₹</span>
            <input
              type="number"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              placeholder="500"
              autoFocus
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-cream-100 border border-cream-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-charcoal-800"
            />
          </div>
          <button
            onClick={handleContribute}
            className="w-full py-3 rounded-xl bg-emerald-800 text-cream-50 font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            Add to Goal
          </button>
        </div>
      </Modal>
    </div>
  );
}
