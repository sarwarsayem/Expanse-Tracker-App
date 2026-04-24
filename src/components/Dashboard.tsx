import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, Bell, Target, TrendingUp, LayoutGrid, X, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, CATEGORIES } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AddExpense from './AddExpense';

interface DashboardProps {
  transactions: Transaction[];
  totals: { income: number; expense: number };
  balance: number;
  onNavigate: (screen: any) => void;
  currency: string;
  userName: string;
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
}

export default function Dashboard({ transactions, totals, balance, onNavigate, currency, userName, onDelete, onUpdate }: DashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Prep data for Donut Chart
  const expenseData = CATEGORIES.filter(c => {
    return transactions.some(t => t.type === 'expense' && t.categoryId === c.id);
  }).map(c => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.categoryId === c.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: c.name, value: amount, color: c.color };
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  if (editingTransaction) {
    return (
      <AddExpense 
        onSave={(updated) => {
          onUpdate(updated);
          setEditingTransaction(null);
        }}
        onCancel={() => setEditingTransaction(null)}
        currency={currency}
        initialTransaction={editingTransaction}
      />
    );
  }

  return (
    <div className="space-y-8 pb-4 relative">
      {/* Top Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-center"
      >
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{today}</p>
          <h2 className="text-xl font-bold tracking-tight">Morning, {userName.split(' ')[0]}! 👋</h2>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-3 rounded-2xl border transition-all active:scale-95 shadow-sm",
              showNotifications ? "bg-[#5D5FEF] text-white border-[#5D5FEF]" : "bg-white border-gray-100 text-gray-400"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#FF2D55] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {/* Notification Panel Overlay */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40 bg-black/5"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-72 bg-white rounded-[32px] shadow-2xl border border-gray-50 p-5 z-50 space-y-4 shadow-[#5D5FEF]/10"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <h3 className="font-bold text-sm tracking-tight text-gray-900">Notifications</h3>
                       {unreadCount > 0 && (
                         <span className="bg-[#5D5FEF]/10 text-[#5D5FEF] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                           {unreadCount} New
                         </span>
                       )}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n.id)}
                          className={cn(
                            "flex gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group relative",
                            n.read ? "opacity-60 bg-transparent" : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          {!n.read && (
                            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#5D5FEF] rounded-full"></span>
                          )}
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            n.type === 'alert' ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                          )}>
                            {n.type === 'alert' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 leading-none mb-1">{n.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium leading-tight">{n.message}</p>
                            <p className="text-[8px] text-[#5D5FEF] font-bold mt-1.5 uppercase tracking-widest">{n.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-gray-50 rounded-2xl italic text-gray-300 text-xs font-medium">
                        No new updates
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className={cn(
                      "w-full py-3 text-[10px] font-bold rounded-xl transition-all",
                      unreadCount > 0 
                        ? "text-[#5D5FEF] bg-[#5D5FEF]/5 hover:bg-[#5D5FEF]/10" 
                        : "text-gray-300 bg-transparent cursor-not-allowed"
                    )}
                  >
                    Mark all as read
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5D5FEF]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#5D5FEF]/10 transition-colors"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Balance</p>
              <h1 className="text-4xl font-bold tracking-tight">{formatCurrency(balance, currency)}</h1>
            </div>
            <div className="w-12 h-12 bg-[#5D5FEF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5D5FEF]/30">
              <Wallet size={24} />
            </div>
          </div>
          
          <div className="h-px bg-gray-100 w-full"></div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Income</p>
                <p className="font-bold text-sm">{formatCurrency(totals.income, currency)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spent</p>
                <p className="font-bold text-sm text-rose-500">{formatCurrency(totals.expense, currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold tracking-tight">Monthly Overview</h2>
          <button 
            onClick={() => onNavigate('statistics')}
            className="text-[#5D5FEF] text-sm font-bold"
          >
            See More
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-32 h-32 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData.length > 0 ? expenseData : [{ value: 1, color: '#F3F4F6' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  {expenseData.length === 0 && <Cell fill="#F3F4F6" />}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Rate</span>
              <span className="text-base font-bold">
                {Math.round((totals.expense / (totals.income || 1)) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            {expenseData.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ring-4 ring-offset-0" style={{ backgroundColor: item.color, boxShadow: `0 0 0 4px ${item.color}15` }} />
                <span className="text-xs text-gray-500 font-bold tracking-tight truncate">{item.name}</span>
                <span className="text-xs font-bold ml-auto">{formatCurrency(item.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Recent Transactions */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
          <button 
            onClick={() => onNavigate('transactions')}
            className="text-[#5D5FEF] text-sm font-bold"
          >
            View History
          </button>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 3).map((t) => {
            const category = CATEGORIES.find(c => c.id === t.categoryId);
            return (
              <motion.div 
                key={t.id} 
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm transition-all hover:shadow-md"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                >
                  <LayoutGrid size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm tracking-tight truncate">{category?.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 font-medium truncate">{t.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-sm tracking-tight",
                      t.type === 'income' ? "text-[#34C759]" : "text-[#1A1C1E]"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </p>
                    <p className="text-gray-400 text-[9px] mt-0.5 font-bold uppercase tracking-widest">
                      {new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <AnimatePresence mode="wait">
                      {confirmDeleteId === t.id ? (
                        <motion.div 
                          key="confirm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl"
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(t.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[10px] font-bold text-rose-500 px-2 py-1"
                          >
                            Del?
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="p-1 text-gray-400"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="actions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex gap-1"
                        >
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTransaction(t);
                            }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </motion.button>
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(t.id);
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
