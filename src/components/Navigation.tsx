import { Bell, Home, Receipt, Target, BarChart3, User } from 'lucide-react';
import { Logo } from './Logo';

export type Page = 'dashboard' | 'expenses' | 'budgets' | 'savings' | 'insights';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'savings', label: 'Savings' },
  { id: 'insights', label: 'Insights' },
];

export function Navbar({ current, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-400/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('dashboard')} className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  current === item.id
                    ? 'bg-emerald-800 text-cream-50 shadow-sm'
                    : 'text-charcoal-700/70 hover:bg-cream-200 hover:text-emerald-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex p-2.5 rounded-full hover:bg-cream-200 transition-colors text-charcoal-700/70 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500" />
            </button>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-emerald-800/5 border border-emerald-800/10 hover:bg-emerald-800/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-cream-50 text-xs font-bold">
                M
              </div>
              <span className="hidden sm:block text-sm font-medium text-emerald-900">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ current, onNavigate }: Props) {
  const items = [
    { id: 'dashboard' as const, label: 'Home', icon: Home },
    { id: 'expenses' as const, label: 'Expenses', icon: Receipt },
    { id: 'budgets' as const, label: 'Budgets', icon: Target },
    { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
    { id: 'savings' as const, label: 'Goals', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-cream-400/50 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                active ? 'text-emerald-800' : 'text-charcoal-700/50'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
