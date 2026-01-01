import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Search, User, Phone, LayoutDashboard, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesList } from '../data';
import { Product } from '../types';

interface NavbarProps {
  cartCount: number;
  addToCart: (product: Product) => void;
  onOpenLogin: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenLogin, onOpenTracking, onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isAdmin, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Fixed Header Container */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans transition-all duration-300 backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/60">
        
        {/* Top Notification Bar */}
        <div className="bg-gradient-to-r from-primary via-purple-900 to-primary text-white text-[10px] md:text-xs py-1.5 text-center font-bold tracking-wide">
          <p>🎉 মিক্সোরা সুপার শপ - এ প্রথম অর্ডারে ডেলিভারি চার্জ ফ্রি! কোড: <span className="text-yellow-300 font-black">NEW24</span></p>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* 1. Logo & Branding */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <img 
                src="https://iili.io/fhzYEP4.png" 
                alt="Mixora Logo" 
                className="h-8 md:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>

            {/* 2. Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-[400px] relative mx-auto">
              <form onSubmit={handleSearch} className="w-full relative group">
                 <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="পণ্য খুঁজুন (যেমন: পাঞ্জাবি, ঘড়ি)..." 
                  className="w-full pl-5 pr-12 py-2.5 bg-gray-100 border border-gray-200 focus:border-secondary focus:bg-white rounded-full text-xs font-bold text-gray-700 outline-none transition-all shadow-sm group-hover:shadow-md"
                />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-full hover:bg-gray-800 transition shadow-sm flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* 3. Actions Icons */}
            <div className="flex items-center gap-3 md:gap-6">
              
              {/* Order Tracking (Desktop) */}
              <button onClick={onOpenTracking} className="hidden lg:flex items-center gap-2 text-gray-600 hover:text-primary transition group bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 hover:border-secondary/30">
                 <Truck className="h-4 w-4 text-secondary" />
                 <span className="text-xs font-bold">অর্ডার ট্র্যাকিং</span>
              </button>

              {/* Phone (Desktop) */}
              <a href="tel:01711728660" className="hidden xl:flex items-center gap-2 text-gray-600 hover:text-primary transition group">
                 <div className="bg-primary/5 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors"><Phone className="h-4 w-4" /></div>
                 <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">হটলাইন</span>
                    <span className="text-xs font-black text-gray-800">01711-728660</span>
                 </div>
              </a>

              {/* Cart Button (Opens Modal) */}
              <button onClick={onOpenCart} className="relative cursor-pointer group">
                 <div className="p-2.5 bg-gray-50 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors border border-gray-100">
                    <ShoppingCart className="h-5 w-5" />
                 </div>
                 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm animate-pulse-slow">
                   {cartCount}
                 </span>
              </button>

              {/* User/Menu */}
              <div className="hidden md:block">
                  {currentUser ? (
                     <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2 cursor-pointer hover:text-primary transition">
                         <div className="p-2 bg-gray-50 rounded-full text-gray-700 hover:bg-primary hover:text-white transition border border-gray-100">
                            {isAdmin ? <LayoutDashboard size={20} /> : <User size={20} />}
                         </div>
                     </Link>
                  ) : (
                     <button onClick={onOpenLogin} className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gray-800 transition shadow-lg shadow-primary/20 flex items-center gap-2">
                        <User size={14} /> লগ ইন
                     </button>
                  )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 text-gray-800 focus:outline-none bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-100"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3 pb-1">
             <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="কি লাগবে আপনার?..." 
                  className="w-full pl-4 pr-10 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-secondary/50"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center">
                   <Search className="h-4 w-4" />
                </button>
             </form>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full z-40 shadow-2xl h-[calc(100vh-140px)] overflow-y-auto animate-fade-in-down">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <Link to="/" onClick={() => setIsOpen(false)} className="bg-gray-50 p-3 rounded-xl text-center font-bold text-gray-700 hover:bg-primary hover:text-white transition border border-gray-100">হোম</Link>
                 <Link to="/category/all" onClick={() => setIsOpen(false)} className="bg-gray-50 p-3 rounded-xl text-center font-bold text-gray-700 hover:bg-primary hover:text-white transition border border-gray-100">শপ</Link>
                 <button onClick={() => { onOpenTracking(); setIsOpen(false); }} className="bg-gray-50 p-3 rounded-xl text-center font-bold text-gray-700 hover:bg-primary hover:text-white transition border border-gray-100 col-span-2 flex items-center justify-center gap-2"><Truck size={16}/> অর্ডার ট্র্যাকিং</button>
              </div>
              
              <div className="pt-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">জনপ্রিয় ক্যাটাগরি</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categoriesList.map((cat, idx) => (
                        <Link 
                          key={idx} 
                          to={`/category/${cat}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-primary transition border border-gray-100"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                          {cat}
                        </Link>
                    ))}
                  </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                 {currentUser ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="bg-white p-2 rounded-full shadow-sm"><User size={20} /></div>
                          <div>
                             <p className="text-xs text-gray-500 font-bold">লগইন করা হয়েছে</p>
                             <p className="text-sm font-black text-gray-800 truncate w-48">{currentUser.email}</p>
                          </div>
                       </div>
                       <button onClick={logout} className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition">লগ আউট</button>
                    </div>
                 ) : (
                    <button onClick={() => { onOpenLogin(); setIsOpen(false); }} className="block w-full py-3 text-center bg-primary text-white rounded-xl font-bold shadow-lg">একাউন্টে লগ ইন করুন</button>
                 )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;