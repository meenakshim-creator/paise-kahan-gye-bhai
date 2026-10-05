import type { AppState } from './types';

export const STORAGE_KEY = 'pkgb_app_state_v1';

export const DEFAULT_STATE: AppState = {
  profileName: 'Meenakshi',
  monthlyIncome: 50000,
  transactions: [
    { id: 't1', type: 'expense', merchant: 'Zomato', category: 'food', amount: 420, date: today(0), paymentMethod: 'UPI', note: 'Dinner' },
    { id: 't2', type: 'expense', merchant: 'PVR Cinemas', category: 'entertainment', amount: 650, date: today(0), paymentMethod: 'Debit Card', note: 'Movie night' },
    { id: 't3', type: 'expense', merchant: 'Uber', category: 'transport', amount: 280, date: today(0), paymentMethod: 'UPI', note: 'Ride home' },
    { id: 't4', type: 'expense', merchant: 'Starbucks', category: 'food', amount: 350, date: today(0), paymentMethod: 'Cash', note: 'Coffee' },
    { id: 't5', type: 'expense', merchant: 'BigBasket', category: 'food', amount: 1240, date: today(-1), paymentMethod: 'UPI', note: 'Groceries' },
    { id: 't6', type: 'expense', merchant: 'Myntra', category: 'shopping', amount: 2100, date: today(-2), paymentMethod: 'Credit Card', note: 'Kurta' },
    { id: 't7', type: 'expense', merchant: 'Swiggy', category: 'food', amount: 380, date: today(-2), paymentMethod: 'UPI', note: 'Lunch' },
    { id: 't8', type: 'expense', merchant: 'Amazon', category: 'shopping', amount: 1100, date: today(-3), paymentMethod: 'Credit Card', note: 'Books' },
    { id: 't9', type: 'expense', merchant: 'BookMyShow', category: 'entertainment', amount: 1200, date: today(-4), paymentMethod: 'UPI', note: 'Concert tickets' },
    { id: 't10', type: 'expense', merchant: 'Electricity Bill', category: 'bills', amount: 1800, date: today(-5), paymentMethod: 'Bank Transfer', note: 'Monthly bill' },
    { id: 't11', type: 'expense', merchant: 'BookMyShow', category: 'entertainment', amount: 650, date: today(-6), paymentMethod: 'Debit Card', note: 'Movie' },
    { id: 't12', type: 'expense', merchant: 'Metro Card', category: 'transport', amount: 500, date: today(-7), paymentMethod: 'UPI', note: 'Top up' },
    { id: 't13', type: 'expense', merchant: 'Swiggy', category: 'food', amount: 240, date: today(-8), paymentMethod: 'UPI', note: 'Snacks' },
    { id: 't14', type: 'expense', merchant: 'Netflix', category: 'subscriptions', amount: 649, date: today(-9), paymentMethod: 'Credit Card', note: 'Monthly' },
    { id: 't15', type: 'expense', merchant: 'Spotify', category: 'subscriptions', amount: 119, date: today(-10), paymentMethod: 'UPI', note: 'Monthly' },
    { id: 't16', type: 'expense', merchant: 'Amazon Prime', category: 'subscriptions', amount: 299, date: today(-11), paymentMethod: 'Credit Card', note: 'Monthly' },
    { id: 't17', type: 'expense', merchant: 'Zomato', category: 'food', amount: 520, date: today(-12), paymentMethod: 'UPI', note: 'Dinner' },
    { id: 't18', type: 'expense', merchant: 'Apollo Pharmacy', category: 'health', amount: 450, date: today(-14), paymentMethod: 'Cash', note: 'Medicines' },
    { id: 't19', type: 'expense', merchant: 'Swiggy', category: 'food', amount: 310, date: today(-15), paymentMethod: 'UPI', note: 'Breakfast' },
    { id: 't20', type: 'expense', merchant: 'Flat Rent', category: 'rent', amount: 12000, date: today(-16), paymentMethod: 'Bank Transfer', note: 'Monthly rent' },
    { id: 't21', type: 'expense', merchant: 'BookMyShow', category: 'entertainment', amount: 400, date: today(-18), paymentMethod: 'UPI', note: 'Movie' },
    { id: 't22', type: 'expense', merchant: 'Swiggy', category: 'food', amount: 290, date: today(-20), paymentMethod: 'UPI', note: 'Late night order' },
    { id: 't23', type: 'income', merchant: 'Salary', category: 'other', amount: 50000, date: today(-25), paymentMethod: 'Bank Transfer', note: 'Monthly salary' },
    { id: 't24', type: 'expense', merchant: 'Mobile Recharge', category: 'bills', amount: 399, date: today(-22), paymentMethod: 'UPI', note: 'Jio recharge' },
    { id: 't25', type: 'expense', merchant: 'Dental Checkup', category: 'health', amount: 800, date: today(-23), paymentMethod: 'Cash', note: 'Clinic visit' },
    { id: 't26', type: 'expense', merchant: 'Myntra', category: 'shopping', amount: 1100, date: today(-26), paymentMethod: 'Credit Card', note: 'Shoes' },
  ],
  budgets: [
    { category: 'food', limit: 6000 },
    { category: 'shopping', limit: 4000 },
    { category: 'transport', limit: 3000 },
    { category: 'entertainment', limit: 3000 },
    { category: 'bills', limit: 5000 },
    { category: 'subscriptions', limit: 1500 },
    { category: 'health', limit: 2000 },
    { category: 'rent', limit: 12000 },
  ],
  goals: [
    { id: 'g1', name: 'New Headphones', icon: '🎧', target: 8000, saved: 5600 },
    { id: 'g2', name: 'Goa Trip', icon: '✈️', target: 20000, saved: 12500 },
    { id: 'g3', name: 'New Laptop', icon: '💻', target: 70000, saved: 24000 },
  ],
  subscriptions: [
    { id: 's1', name: 'Netflix', amount: 649, icon: '🎬' },
    { id: 's2', name: 'Spotify', amount: 119, icon: '🎵' },
    { id: 's3', name: 'Amazon Prime', amount: 299, icon: '📦' },
  ],
};

function today(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
