import { useState, useMemo } from 'react';
import { Transaction, CATEGORIES } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { LayoutGrid, Search, Filter, X, Calendar, Wallet, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isWithinInterval, startOfDay, endOfDay, isToday, isYesterday, format } from 'date-fns';
import AddExpense from './AddExpense';

interface HistoryProps {
  transactions: Transaction[];
  currency: string;
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
}

export default function TransactionHistory({ transactions, currency, onDelete, onUpdate }: HistoryProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const category = CATEGORIES.find(c => c.id === t.categoryId);
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory ? t.categoryId === selectedCategory : true;

      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        matchesDate = isWithinInterval(new Date(t.date), {
          start: startOfDay(new Date(dateRange.start)),
          end: endOfDay(new Date(dateRange.end))
        });
      } else if (dateRange.start) {
        matchesDate = new Date(t.date) >= startOfDay(new Date(dateRange.start));
      } else if (dateRange.end) {
        matchesDate = new Date(t.date) <= endOfDay(new Date(dateRange.end));
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [transactions, searchQuery, selectedCategory, dateRange]);

  // Group by date
  const grouped = filteredTransactions.reduce((groups: Record<string, Transaction[]>, t) => {
    const dateKey = startOfDay(new Date(t.date)).toISOString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(t);
    return groups;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <AnimatePresence mode="wait">
            {!isSearchOpen ? (
              <motion.h2 
                key="title"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-bold tracking-tight"
              >
                History
              </motion.h2>
            ) : (
              <motion.div 
                key="search"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 mr-4"
              >
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2.5 text-sm outline-none font-bold placeholder:text-gray-300"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isSearchOpen) setSearchQuery('');
              }}
              className={cn(
                "p-3 rounded-2xl transition-all active:scale-95",
                isSearchOpen ? "bg-[#5D5FEF] text-white shadow-lg shadow-[#5D5FEF]/20" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
              )}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-3 rounded-2xl transition-all active:scale-95",
                isFilterOpen || selectedCategory || dateRange.start || dateRange.end ? "bg-[#5D5FEF] text-white shadow-lg shadow-[#5D5FEF]/20" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
              )}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter Category Pills & Date Range */}
        <AnimatePresence>
          {(isFilterOpen || selectedCategory || dateRange.start || dateRange.end) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-sm space-y-4">
                {/* Date Range Picker */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</p>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl border border-transparent focus-within:border-[#5D5FEF]/20 transition-colors">
                      <Calendar size={14} className="text-gray-400" />
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-transparent text-[10px] font-bold outline-none w-full"
                      />
                      {dateRange.start && <button onClick={() => setDateRange(p => ({...p, start: ''}))}><X size={12} className="text-gray-400" /></button>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</p>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl border border-transparent focus-within:border-[#5D5FEF]/20 transition-colors">
                      <Calendar size={14} className="text-gray-400" />
                      <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-transparent text-[10px] font-bold outline-none w-full"
                      />
                      {dateRange.end && <button onClick={() => setDateRange(p => ({...p, end: ''}))}><X size={12} className="text-gray-400" /></button>}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                      selectedCategory === null ? "bg-[#5D5FEF] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                        selectedCategory === cat.id ? "bg-[#5D5FEF] text-white shadow-md shadow-[#5D5FEF]/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8">
        {sortedDates.map(dateStr => {
          const date = new Date(dateStr);
          const label = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'd MMMM, yyyy');
          
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={dateStr} 
              className="space-y-4"
            >
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">
                {label}
              </p>
              <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-2 space-y-1 overflow-hidden">
                {grouped[dateStr].map(t => {
                  const category = CATEGORIES.find(c => c.id === t.categoryId);
                  return (
                    <motion.div 
                      key={t.id} 
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                      className="flex items-center gap-4 p-3 rounded-[24px] group"
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                        style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                      >
                        <LayoutGrid size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm tracking-tight truncate">{category?.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5 font-medium truncate">{t.description}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <p className={cn(
                            "font-bold text-sm tracking-tight",
                            t.type === 'income' ? "text-[#34C759]" : "text-[#1A1C1E]"
                          )}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                          </p>
                        </div>
                        <div className="flex gap-1">
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
                                  Delete?
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="p-1 text-gray-400"
                                >
                                  <X size={14} />
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
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors shrink-0"
                                >
                                  <Pencil size={16} />
                                </motion.button>
                                <motion.button 
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(t.id);
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                                >
                                  <Trash2 size={16} />
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
            </motion.div>
          );
        })}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm border border-gray-50 flex items-center justify-center mx-auto text-[#5D5FEF]/20 mb-6">
              <Wallet size={48} strokeWidth={1.5} />
            </div>
            <p className="text-gray-900 font-bold text-lg tracking-tight">Empty Results</p>
            <p className="text-gray-400 text-sm mt-1 font-medium">We couldn't find any transactions for your current filter criteria.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setDateRange({ start: '', end: '' });
              }}
              className="mt-6 text-[#5D5FEF] font-bold text-sm bg-[#5D5FEF]/5 px-6 py-2 rounded-full hover:bg-[#5D5FEF]/10 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
