import { useState, useRef, ChangeEvent } from 'react';
import { 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  Crown,
  Camera,
  X,
  Check,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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

export default function Profile({ 
  name, 
  setName, 
  email, 
  setEmail, 
  profilePic, 
  setProfilePic, 
  currency, 
  setCurrency, 
  budget, 
  setBudget 
}: ProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencies = [
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHelpCenter = () => {
    window.open('https://www.facebook.com/sarwarsayem', '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
      {/* Header */}
      <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
      
      <div className="flex flex-col items-center">
        <div className="relative group">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="w-28 h-28 bg-[#5D5FEF]/10 rounded-[40px] flex items-center justify-center text-[#5D5FEF] border-4 border-white shadow-xl overflow-hidden relative"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={56} />
            )}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={24} className="text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </motion.div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#5D5FEF] text-white rounded-xl border-2 border-white flex items-center justify-center shadow-lg pointer-events-none">
            <Settings size={14} />
          </div>
        </div>

        <div className="mt-4 text-center space-y-2">
          {isEditingName ? (
            <div className="flex items-center justify-center gap-2">
              <input 
                autoFocus
                className="text-xl font-bold tracking-tight bg-gray-50 px-3 py-1 rounded-xl outline-none border border-[#5D5FEF]/20 text-center"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              />
              <button onClick={() => setIsEditingName(false)} className="text-[#34C759]"><Check size={20} /></button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              className="flex items-center justify-center gap-2 cursor-pointer group"
            >
              <h3 className="text-xl font-bold tracking-tight group-hover:text-[#5D5FEF] transition-colors text-gray-900">
                {name}
              </h3>
              <Pencil size={16} className="text-gray-300 group-hover:text-[#5D5FEF] transition-colors" />
            </div>
          )}
          
          {isEditingEmail ? (
            <div className="flex items-center justify-center gap-2">
              <input 
                autoFocus
                className="text-sm font-semibold tracking-tight bg-gray-50 px-3 py-1 rounded-xl outline-none border border-[#5D5FEF]/20 text-center text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setIsEditingEmail(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingEmail(false)}
              />
              <button onClick={() => setIsEditingEmail(false)} className="text-[#34C759]"><Check size={16} /></button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingEmail(true)}
              className="flex items-center justify-center gap-2 cursor-pointer group px-2"
            >
              <p className="text-gray-400 text-sm font-semibold opacity-70 group-hover:text-[#5D5FEF] transition-colors">
                {email}
              </p>
              <Pencil size={14} className="text-gray-300 opacity-50 group-hover:text-[#5D5FEF] group-hover:opacity-100 transition-all" />
            </div>
          )}
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">Account Settings</label>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {/* Monthly Budget */}
          <button 
            onClick={() => setIsEditingBudget(!isEditingBudget)}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <TrendingUp size={20} />
            </div>
            <span className="flex-1 text-left font-bold text-sm tracking-tight">Monthly Budget</span>
            {isEditingBudget ? (
              <input 
                autoFocus
                type="number"
                className="w-20 text-xs font-bold text-[#5D5FEF] bg-[#5D5FEF]/5 px-2 py-1 rounded-lg outline-none text-right"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                onBlur={() => setIsEditingBudget(false)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-xs font-bold text-[#5D5FEF] bg-[#5D5FEF]/5 px-2 py-1 rounded-lg">{currency} {budget.toLocaleString()}</span>
            )}
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          {/* Currency Selector */}
          <button 
            onClick={() => setShowCurrencyModal(true)}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <CreditCard size={20} />
            </div>
            <span className="flex-1 text-left font-bold text-sm tracking-tight">Currency</span>
            <span className="text-xs font-bold text-[#5D5FEF] bg-[#5D5FEF]/5 px-2 py-1 rounded-lg">{currency}</span>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          {/* Notifications */}
          <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <Bell size={20} />
            </div>
            <span className="flex-1 text-left font-bold text-sm tracking-tight">Notifications</span>
            <span className="text-xs font-bold text-[#5D5FEF] bg-[#5D5FEF]/5 px-2 py-1 rounded-lg">On</span>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          {/* Help Center */}
          <button 
            onClick={handleHelpCenter}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <HelpCircle size={20} />
            </div>
            <span className="flex-1 text-left font-bold text-sm tracking-tight">Help Center</span>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center gap-4 p-6 bg-rose-50 text-rose-500 rounded-[32px] group transition-all hover:bg-rose-100 mt-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <LogOut size={20} />
          </div>
          <span className="flex-1 text-left font-bold text-sm tracking-tight">Logout Address</span>
        </button>
      </div>

      {/* Currency Modal */}
      <AnimatePresence>
        {showCurrencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCurrencyModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg tracking-tight">Select Currency</h3>
                <button 
                  onClick={() => setShowCurrencyModal(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setShowCurrencyModal(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                      currency === c.code ? "bg-[#5D5FEF] text-white shadow-lg shadow-[#5D5FEF]/20" : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                        currency === c.code ? "bg-white/20" : "bg-gray-100"
                      )}>
                        {c.symbol}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm tracking-tight">{c.code}</p>
                        <p className={cn("text-[10px] font-medium opacity-70", currency === c.code ? "text-white" : "text-gray-400")}>{c.name}</p>
                      </div>
                    </div>
                    {currency === c.code && <Check size={20} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
