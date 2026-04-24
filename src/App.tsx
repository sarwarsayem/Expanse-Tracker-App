/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { 
  Home, 
  History as HistoryIcon, 
  Plus, 
  BarChart3, 
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from './types';
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import AddExpense from './components/AddExpense';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { cn } from './lib/utils';

type Screen = 'home' | 'transactions' | 'add' | 'statistics' | 'profile';

interface ProfileProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  profilePic: string | null;
  setProfilePic: (pic: string | null) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>(() => {
    return (localStorage.getItem('activeScreen') as Screen) || 'home';
  });
  
  // Persistent States
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'BDT';
  });
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Your Name';
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || 'user@example.com';
  });

  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('profilePic');
  });
  
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? Number(saved) : 25000;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      } catch (e) {
        console.error('Failed to parse transactions', e);
        return [];
      }
    }
    return [];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('activeScreen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('userEmail', userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (profilePic) localStorage.setItem('profilePic', profilePic);
    else localStorage.removeItem('profilePic');
  }, [profilePic]);

  useEffect(() => {
    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setActiveScreen('home');
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <Dashboard 
            transactions={transactions} 
            totals={totals} 
            balance={balance} 
            onNavigate={setActiveScreen} 
            currency={currency}
            userName={userName}
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionHistory 
            transactions={transactions} 
            currency={currency} 
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
          />
        );
      case 'add':
        return <AddExpense onSave={handleAddTransaction} onCancel={() => setActiveScreen('home')} currency={currency} />;
      case 'statistics':
        return <Statistics transactions={transactions} currency={currency} />;
      case 'profile':
        return (
          <Profile 
            name={userName}
            setName={setUserName}
            email={userEmail}
            setEmail={setUserEmail}
            profilePic={profilePic}
            setProfilePic={setProfilePic}
            currency={currency}
            setCurrency={setCurrency}
            budget={monthlyBudget}
            setBudget={setMonthlyBudget}
          />
        );
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            totals={totals} 
            balance={balance} 
            onNavigate={setActiveScreen} 
            currency={currency}
            userName={userName}
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#1A1C1E] font-sans">
      <div className="mx-auto max-w-md bg-[#F8F9FE] min-h-screen relative flex flex-col">
        <main className="flex-1 px-6 pt-12 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <NavButton 
            active={activeScreen === 'home'} 
            onClick={() => setActiveScreen('home')} 
            icon={<Home size={activeScreen === 'home' ? 24 : 22} />} 
            label="Home"
          />
          <NavButton 
            active={activeScreen === 'transactions'} 
            onClick={() => setActiveScreen('transactions')} 
            icon={<HistoryIcon size={activeScreen === 'transactions' ? 24 : 22} />} 
            label="History"
          />
          
          <button 
            onClick={() => setActiveScreen('add')}
            className="bg-[#5D5FEF] text-white p-4 rounded-[22px] shadow-xl shadow-[#5D5FEF]/30 -mt-16 transition-all active:scale-95 hover:shadow-2xl hover:shadow-[#5D5FEF]/40"
          >
            <Plus size={28} />
          </button>

          <NavButton 
            active={activeScreen === 'statistics'} 
            onClick={() => setActiveScreen('statistics')} 
            icon={<BarChart3 size={activeScreen === 'statistics' ? 24 : 22} />} 
            label="Stats"
          />
          <NavButton 
            active={activeScreen === 'profile'} 
            onClick={() => setActiveScreen('profile')} 
            icon={<User size={activeScreen === 'profile' ? 24 : 22} />} 
            label="Profile"
          />
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-[#5D5FEF] translate-y-[-4px]" : "text-gray-400"
      )}
    >
      {icon}
      <span className={cn(
        "text-[10px] font-bold tracking-tight transition-opacity",
        active ? "opacity-100" : "opacity-0"
      )}>{label}</span>
    </button>
  );
}

