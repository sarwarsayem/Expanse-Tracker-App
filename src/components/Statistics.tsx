import { useState, useMemo } from 'react';
import { Transaction, CATEGORIES } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, TrendingUp, ChevronDown, Calendar, X } from 'lucide-react';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  subDays,
  format,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';

type Period = 'Weekly' | 'Monthly' | 'Custom';

interface StatisticsProps {
  transactions: Transaction[];
  currency: string;
}

export default function Statistics({ transactions, currency }: StatisticsProps) {
  const [period, setPeriod] = useState<Period>('Weekly');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const statsInterval = useMemo(() => {
    const now = new Date();
    if (period === 'Weekly') {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (period === 'Monthly') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else {
      return { start: new Date(customRange.start), end: new Date(customRange.end) };
    }
  }, [period, customRange]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.type === 'expense' && 
      isWithinInterval(new Date(t.date), statsInterval)
    );
  }, [transactions, statsInterval]);

  // Line chart data based on interval
  const chartData = useMemo(() => {
    const days = eachDayOfInterval(statsInterval);
    // If too many days, we might want to group, but let's stick to days for now
    return days.map(day => {
      const amount = filteredTransactions
        .filter(t => isSameDay(new Date(t.date), day))
        .reduce((sum, t) => sum + t.amount, 0);
      return { 
        name: format(day, days.length > 7 ? 'dd MMM' : 'EEE'), 
        amount,
        fullDate: format(day, 'PP')
      };
    });
  }, [filteredTransactions, statsInterval]);

  // Pie chart data
  const expenseData = useMemo(() => {
    return CATEGORIES.filter(c => {
      return filteredTransactions.some(t => t.categoryId === c.id);
    }).map(c => {
      const amount = filteredTransactions
        .filter(t => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: c.name, value: amount, color: c.color };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => 
    expenseData.reduce((sum, item) => sum + item.value, 0), 
  [expenseData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex justify-between items-center relative">
        <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
        <div className="relative">
          <button 
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-[#5D5FEF] transition-all active:scale-95"
          >
            {period} <ChevronDown size={16} className={cn("transition-transform", showPeriodMenu && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {showPeriodMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]"
              >
                {(['Weekly', 'Monthly', 'Custom'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setShowPeriodMenu(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-bold transition-colors",
                      period === p ? "text-[#5D5FEF] bg-[#5D5FEF]/5" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      <AnimatePresence>
        {period === 'Custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm grid grid-cols-2 gap-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl overflow-hidden">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <input 
                  type="date" 
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-transparent text-xs font-bold outline-none w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</label>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl overflow-hidden">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <input 
                  type="date" 
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-transparent text-xs font-bold outline-none w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm space-y-1"
        >
          <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mb-1">
            <LayoutGrid size={16} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Avg Daily</p>
          <p className="font-bold text-lg tracking-tight pl-1">
            {formatCurrency(totalExpense / (chartData.length || 1), currency)}
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm space-y-1"
        >
          <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center mb-1">
            <TrendingUp size={16} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Highest</p>
          <p className="font-bold text-lg tracking-tight pl-1">
            {formatCurrency(Math.max(...chartData.map(d => d.amount), 0), currency)}
          </p>
        </motion.div>
      </div>

      {/* Spending Trend */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Spending Trend</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(totalExpense, currency)}</h3>
          </div>
          <div className="flex items-center gap-1 text-[#34C759] bg-[#34C759]/10 px-2 py-1 rounded-lg text-xs font-bold">
            <TrendingUp size={12} /> {period === 'Weekly' ? 'Trend' : 'Stats'}
          </div>
        </div>
        
        <div className="h-64 w-full -ml-4 bg-white/50 rounded-[32px] p-4 pt-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                dy={10}
                interval={chartData.length > 7 ? 'preserveStartEnd' : 0}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1A1C1E' }}
                itemStyle={{ color: '#5D5FEF', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: number) => [formatCurrency(value, currency), 'Spent']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#5D5FEF" 
                strokeWidth={5} 
                dot={{ r: 4, strokeWidth: 0, fill: '#5D5FEF' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#5D5FEF' }}
                animationDuration={1500}
                label={{ 
                  position: 'top', 
                  fontSize: 10, 
                  fontWeight: 'bold', 
                  fill: '#1A1C1E',
                  formatter: (val: number) => val > 0 ? `$${val}` : ''
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Expense by Category */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold tracking-tight">Expense by Category</h2>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          {expenseData.length > 0 ? (
            <>
              <div className="w-full h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total</span>
                  <span className="text-xl font-bold tracking-tight">{formatCurrency(totalExpense, currency)}</span>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                {expenseData.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div 
                      className="w-11 h-11 rounded-[16px] flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <LayoutGrid size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm tracking-tight truncate">{item.name}</p>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / totalExpense) * 100}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm tracking-tight">{formatCurrency(item.value, currency)}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight">{Math.round((item.value / totalExpense) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 italic font-medium">
              No expenses for the selected period
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
