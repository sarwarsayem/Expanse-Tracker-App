import { useState, useMemo } from 'react';
import { X, Calendar, LayoutGrid, Check, Info } from 'lucide-react';
import { Transaction, CATEGORIES, TransactionType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddExpenseProps {
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
  currency: string;
  initialTransaction?: Transaction;
}

export default function AddExpense({ onSave, onCancel, currency, initialTransaction }: AddExpenseProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type || 'expense');
  const [amount, setAmount] = useState(initialTransaction?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(initialTransaction?.categoryId || CATEGORIES[0].id);
  const [description, setDescription] = useState(initialTransaction?.description || '');
  const [date, setDate] = useState(
    initialTransaction 
      ? new Date(initialTransaction.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );

  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0).replace(/[0-9.,]/g, '').trim();
    } catch {
      return '$';
    }
  }, [currency]);

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const transaction: Transaction = {
      id: initialTransaction?.id || Math.random().toString(36).substr(2, 9),
      type,
      categoryId,
      amount: parseFloat(amount),
      description: description || CATEGORIES.find(c => c.id === categoryId)?.name || '',
      date: new Date(date),
    };

    onSave(transaction);
  };

  return (
    <div className="space-y-8 pb-8 animate-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={onCancel} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-gray-600 transition-all active:scale-95">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-center flex-1">
          {initialTransaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>
        <div className="w-[44px]"></div>
      </div>

      {/* Toggle */}
      <div className="p-1.5 bg-white border border-gray-100 shadow-sm rounded-[24px] flex relative">
        <motion.div
           layoutId="active-toggle"
           className="absolute inset-1.5 w-[calc(50%-6px)] bg-[#5D5FEF] rounded-[18px] shadow-lg shadow-[#5D5FEF]/20"
           initial={false}
           animate={{ x: type === 'expense' ? 0 : '100%' }}
           transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
        <button 
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-3.5 text-sm font-bold z-10 transition-colors duration-300",
            type === 'expense' ? "text-white" : "text-gray-400"
          )}
        >
          Expense
        </button>
        <button 
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-3.5 text-sm font-bold z-10 transition-colors duration-300",
            type === 'income' ? "text-white" : "text-gray-400"
          )}
        >
          Income
        </button>
      </div>

      {/* Amount Input */}
      <div className="text-center py-4">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-3">Amount Required</p>
        <div className="flex items-center justify-center gap-1 group">
          <span className="text-4xl font-bold text-[#5D5FEF] mb-2">{currencySymbol}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="text-7xl font-bold bg-transparent border-none outline-none w-auto max-w-[280px] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-100"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Select Category</p>
          <Info size={14} className="text-gray-300" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div 
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative overflow-hidden",
                  categoryId === cat.id ? "scale-110 shadow-xl" : "opacity-40 hover:opacity-100"
                )}
                style={{ 
                  backgroundColor: categoryId === cat.id ? cat.color : `${cat.color}15`, 
                  color: categoryId === cat.id ? 'white' : cat.color,
                  boxShadow: categoryId === cat.id ? `0 10px 25px -10px ${cat.color}` : 'none'
                }}
              >
                <LayoutGrid size={22} />
                <AnimatePresence>
                  {categoryId === cat.id && (
                    <motion.div 
                      layoutId="category-selection"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute inset-0 bg-black/10 flex items-center justify-center pt-8"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider transition-colors",
                categoryId === cat.id ? "text-gray-900" : "text-gray-400"
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Details Form Card */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm p-6 space-y-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <Calendar size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-0.5">Date</p>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent font-bold text-sm outline-none w-full border-b border-transparent focus:border-[#5D5FEF]/20 transition-colors" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
             <LayoutGrid size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-0.5">Description</p>
            <input 
              type="text" 
              placeholder="What did you pay for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent font-bold text-sm outline-none w-full border-b border-transparent focus:border-[#5D5FEF]/20 transition-colors placeholder:text-gray-300" 
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={!amount}
        className={cn(
          "w-full py-5 rounded-[28px] font-bold text-lg shadow-xl transition-all active:scale-95 duration-300",
          amount 
            ? "bg-[#5D5FEF] text-white shadow-[#5D5FEF]/30 hover:shadow-2xl hover:shadow-[#5D5FEF]/40" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        Save Transaction
      </button>
    </div>
  );
}
