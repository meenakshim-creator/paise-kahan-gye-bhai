import type { Transaction, CategoryId, AppState } from './types';
import { getCategoryMeta } from './types';

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `₹${formatted}`;
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isThisYear(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
}

export function getMonthExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense' && isThisMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthIncome(transactions: Transaction[], monthlyIncome: number): number {
  const explicitIncome = transactions
    .filter((t) => t.type === 'income' && isThisMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  return Math.max(explicitIncome, monthlyIncome);
}

export function getCategoryTotals(transactions: Transaction[], onlyThisMonth = true): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (onlyThisMonth && !isThisMonth(t.date)) continue;
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
  }
  return totals;
}

export function getTopCategory(transactions: Transaction[]): { id: CategoryId; amount: number } | null {
  const totals = getCategoryTotals(transactions);
  let topId: CategoryId | null = null;
  let topAmount = 0;
  for (const [id, amount] of Object.entries(totals)) {
    if (amount > topAmount) {
      topAmount = amount;
      topId = id as CategoryId;
    }
  }
  if (topId === null) return null;
  return { id: topId, amount: topAmount };
}

export function getMonthlySavings(income: number, expenses: number): number {
  return Math.max(0, income - expenses);
}

export function getSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.max(0, ((income - expenses) / income) * 100);
}

export function isWeekend(iso: string): boolean {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6;
}

export function getDayName(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' });
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function getFinanceStatus(
  spent: number,
  income: number,
  savings: number,
): { emoji: string; message: string; tone: 'good' | 'warning' | 'danger' | 'excellent' } {
  const spendRatio = income > 0 ? spent / income : 0;
  const savingsRate = income > 0 ? savings / income : 0;
  if (spendRatio > 0.8) return { emoji: '💀', message: 'PAISE KAHAN GYE BHAI?', tone: 'danger' };
  if (savingsRate > 0.4) return { emoji: '🐷', message: 'Warren Buffett ka rishtedaar spotted.', tone: 'excellent' };
  if (spendRatio < 0.4) return { emoji: '🤑', message: 'Bhai tu toh financially responsible nikla.', tone: 'good' };
  if (spendRatio < 0.6) return { emoji: '👀', message: 'Thoda control kar bhai… Swiggy suspicious lag raha hai.', tone: 'warning' };
  return { emoji: '😅', message: 'Bas thoda aur bachao bhai. Ho jayega.', tone: 'warning' };
}

export function getHealthScore(state: AppState): { total: number; savings: number; budget: number; spending: number; emergency: number; message: string } {
  const income = getMonthIncome(state.transactions, state.monthlyIncome);
  const expenses = getMonthExpenses(state.transactions);
  const savings = getMonthlySavings(income, expenses);
  const savingsRate = getSavingsRate(income, expenses);
  const savingsScore = Math.min(100, Math.round(savingsRate * 2));

  let budgetOver = 0;
  let budgetCount = 0;
  const catTotals = getCategoryTotals(state.transactions);
  for (const b of state.budgets) {
    const spent = catTotals[b.category] ?? 0;
    if (b.limit > 0) {
      budgetOver += Math.min(1, spent / b.limit);
      budgetCount++;
    }
  }
  const budgetScore = budgetCount > 0 ? Math.round((1 - budgetOver / budgetCount) * 100) : 60;
  const clampedBudget = Math.max(0, Math.min(100, budgetScore));

  const spendRatio = income > 0 ? expenses / income : 1;
  const spendingScore = Math.max(0, Math.min(100, Math.round((1 - spendRatio) * 100) + 20));

  const emergencyFund = state.goals.reduce((s, g) => s + g.saved, 0);
  const emergencyScore = Math.min(100, Math.round((emergencyFund / (income * 3)) * 100));

  const total = Math.round(savingsScore * 0.3 + clampedBudget * 0.3 + spendingScore * 0.25 + emergencyScore * 0.15);

  let message: string;
  if (total >= 80) message = 'Bhai, financial health mast hai. Bas online shopping se thoda distance bana.';
  else if (total >= 60) message = 'Bhai, financial health theek hai. Bas thoda aur bachao.';
  else if (total >= 40) message = 'Arre bhai, thoda control kar le. Paisa tree pe nahi ughta.';
  else message = 'Bhai… paise gayab ho rahe hain. Serious wali situation hai.';

  return { total, savings: savingsScore, budget: clampedBudget, spending: spendingScore, emergency: emergencyScore, message };
}

export function getMoneyLeaks(state: AppState): { title: string; detail: string; icon: string }[] {
  const leaks: { title: string; detail: string; icon: string }[] = [];
  const monthExpenses = state.transactions.filter((t) => t.type === 'expense' && isThisMonth(t.date));
  const catTotals = getCategoryTotals(state.transactions);

  const foodDelivery = monthExpenses
    .filter((t) => t.category === 'food' && ['Zomato', 'Swiggy'].includes(t.merchant))
    .reduce((s, t) => s + t.amount, 0);
  if (foodDelivery > 500) {
    leaks.push({
      title: `You spent ${formatCurrency(foodDelivery)} on food delivery this month.`,
      detail: 'Kitni baar Swiggy/Zomato order kiya bhai? Ghar ka khana bhi option hai.',
      icon: '🍽️',
    });
  }

  if (state.subscriptions.length >= 3) {
    const total = state.subscriptions.reduce((s, sub) => s + sub.amount, 0);
    leaks.push({
      title: `You have ${state.subscriptions.length} active subscriptions.`,
      detail: `Total ${formatCurrency(total)}/month — that's ${formatCurrency(total * 12)}/year. Soch bhai.`,
      icon: '💳',
    });
  }

  const weekendSpending = monthExpenses
    .filter((t) => isWeekend(t.date))
    .reduce((s, t) => s + t.amount, 0);
  const weekdaySpending = monthExpenses
    .filter((t) => !isWeekend(t.date))
    .reduce((s, t) => s + t.amount, 0);
  if (weekdaySpending > 0 && weekendSpending > 0) {
    const weekendAvg = weekendSpending / Math.max(1, new Set(monthExpenses.filter((t) => isWeekend(t.date)).map((t) => t.date)).size);
    const weekdayAvg = weekdaySpending / Math.max(1, new Set(monthExpenses.filter((t) => !isWeekend(t.date)).map((t) => t.date)).size);
    if (weekdayAvg > 0 && weekendAvg > weekdayAvg * 1.2) {
      const pct = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);
      leaks.push({
        title: `Weekend spending is ${pct}% higher than weekdays.`,
        detail: 'Weekend pe bhai paise chhorte hi kyun ho?',
        icon: '📅',
      });
    }
  }

  const smallExpenses = monthExpenses.filter((t) => t.amount < 500).reduce((s, t) => s + t.amount, 0);
  if (smallExpenses > 1000) {
    leaks.push({
      title: `Small expenses under ₹500 added up to ${formatCurrency(smallExpenses)}.`,
      detail: 'Chote-chote kharche bhi bada hissa ban jaate hain.',
      icon: '🪙',
    });
  }

  const top = getTopCategory(state.transactions);
  if (top) {
    const meta = getCategoryMeta(top.id);
    leaks.push({
      title: `${meta.icon} ${meta.label} is your biggest spending category at ${formatCurrency(top.amount)}.`,
      detail: `${meta.label} pe thoda control kar le bhai.`,
      icon: meta.icon,
    });
  }

  return leaks;
}

export function getSavingSuggestions(state: AppState): { title: string; detail: string; icon: string }[] {
  const suggestions: { title: string; detail: string; icon: string }[] = [];
  const catTotals = getCategoryTotals(state.transactions);

  const foodTotal = catTotals['food'] ?? 0;
  if (foodTotal > 1000) {
    const yearly = Math.round(foodTotal * 0.1 * 12);
    suggestions.push({
      title: `Food delivery ${formatCurrency(Math.round(foodTotal * 0.1))} kam kar do`,
      detail: `Toh ${formatCurrency(yearly)}/year save kar sakte ho. Ghar ka khana bhi kha le bhai.`,
      icon: '🍔',
    });
  }

  const shoppingTotal = catTotals['shopping'] ?? 0;
  if (shoppingTotal > 500) {
    suggestions.push({
      title: `Shopping budget ${formatCurrency(1000)} reduce karke`,
      detail: 'Goa fund mein daal sakte ho. Trip jaldi ho jayegi.',
      icon: '🛍️',
    });
  }

  const subTotal = state.subscriptions.reduce((s, sub) => s + sub.amount, 0);
  if (subTotal > 0) {
    suggestions.push({
      title: `Subscriptions cost ${formatCurrency(subTotal)}/month.`,
      detail: 'Ek cancel kar de toh monthly savings badh jayegi.',
      icon: '💳',
    });
  }

  const transportTotal = catTotals['transport'] ?? 0;
  if (transportTotal > 800) {
    const yearly = Math.round(transportTotal * 0.15 * 12);
    suggestions.push({
      title: `Transport pe ${formatCurrency(Math.round(transportTotal * 0.15))}/month bachao`,
      detail: `Public transport ya carpool try kar. ${formatCurrency(yearly)}/year bachega.`,
      icon: '🚕',
    });
  }

  const entertainmentTotal = catTotals['entertainment'] ?? 0;
  if (entertainmentTotal > 500) {
    suggestions.push({
      title: `Entertainment pe ${formatCurrency(Math.round(entertainmentTotal * 0.2))}/month reduce kar`,
      detail: 'Bas ek-do movie kam dekh le bhai. Naya subscription mat le.',
      icon: '🎬',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Sab sahi chal raha hai bhai!',
      detail: 'Tumhara spending under control hai. Bas aise hi savings badhata ja.',
      icon: '✅',
    });
  }

  return suggestions;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
