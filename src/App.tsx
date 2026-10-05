import { useState } from 'react';
import { StoreProvider } from '@/store';
import { Navbar, BottomNav, type Page } from '@/components/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { Expenses } from '@/pages/Expenses';
import { Budgets } from '@/pages/Budgets';
import { Savings } from '@/pages/Savings';
import { Insights } from '@/pages/Insights';

function App() {
  const [page, setPage] = useState<Page>('dashboard');

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <StoreProvider>
      <div className="min-h-screen bg-cream-100 rupee-watermark">
        <Navbar current={page} onNavigate={navigate} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
          <div key={page} className="animate-fade-in">
            {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
            {page === 'expenses' && <Expenses />}
            {page === 'budgets' && <Budgets />}
            {page === 'savings' && <Savings />}
            {page === 'insights' && <Insights />}
          </div>
        </main>
        <BottomNav current={page} onNavigate={navigate} />
      </div>
    </StoreProvider>
  );
}

export default App;
