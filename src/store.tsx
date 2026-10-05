import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppState, Transaction, Budget, SavingsGoal, Subscription, CategoryId } from './types';
import { loadState, saveState, DEFAULT_STATE } from './data';
import { uid } from './utils';

interface StoreContextValue {
  state: AppState;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setMonthlyIncome: (amount: number) => void;
  setProfileName: (name: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (category: CategoryId, limit: number) => void;
  removeBudget: (category: CategoryId) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Omit<SavingsGoal, 'id'>>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTransaction: StoreContextValue['addTransaction'] = (tx) => {
    setState((s) => ({ ...s, transactions: [{ ...tx, id: uid() }, ...s.transactions] }));
  };

  const updateTransaction: StoreContextValue['updateTransaction'] = (id, tx) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...tx, id } : t)),
    }));
  };

  const deleteTransaction: StoreContextValue['deleteTransaction'] = (id) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  };

  const setMonthlyIncome: StoreContextValue['setMonthlyIncome'] = (amount) => {
    setState((s) => ({ ...s, monthlyIncome: amount }));
  };

  const setProfileName: StoreContextValue['setProfileName'] = (name) => {
    setState((s) => ({ ...s, profileName: name }));
  };

  const addBudget: StoreContextValue['addBudget'] = (budget) => {
    setState((s) => {
      const existing = s.budgets.filter((b) => b.category !== budget.category);
      return { ...s, budgets: [...existing, budget] };
    });
  };

  const updateBudget: StoreContextValue['updateBudget'] = (category, limit) => {
    setState((s) => ({
      ...s,
      budgets: s.budgets.map((b) => (b.category === category ? { ...b, limit } : b)),
    }));
  };

  const removeBudget: StoreContextValue['removeBudget'] = (category) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.category !== category) }));
  };

  const addGoal: StoreContextValue['addGoal'] = (goal) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...goal, id: uid() }] }));
  };

  const updateGoal: StoreContextValue['updateGoal'] = (id, goal) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
    }));
  };

  const deleteGoal: StoreContextValue['deleteGoal'] = (id) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  };

  const addToGoal: StoreContextValue['addToGoal'] = (id, amount) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)),
    }));
  };

  const addSubscription: StoreContextValue['addSubscription'] = (sub) => {
    setState((s) => ({ ...s, subscriptions: [...s.subscriptions, { ...sub, id: uid() }] }));
  };

  const deleteSubscription: StoreContextValue['deleteSubscription'] = (id) => {
    setState((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
  };

  const resetData: StoreContextValue['resetData'] = () => {
    setState(DEFAULT_STATE);
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setMonthlyIncome,
        setProfileName,
        addBudget,
        updateBudget,
        removeBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addToGoal,
        addSubscription,
        deleteSubscription,
        resetData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
