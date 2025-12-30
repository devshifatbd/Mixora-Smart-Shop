import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Search, User, Phone, Mail, Heart, LayoutDashboard, ChevronDown, AlignLeft, Zap, Loader2, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesList } from '../data';
import { db } from '../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Product } from '../types';

interface NavbarProps {
  cartCount: number;
  addToCart: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, addToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  
  const { isAdmin, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  const handleSpecialOffers = async () => {
    setShowOfferModal(true);
    if (offerProducts.length > 0) return; // Already fetched

    setLoadingOffers(true);
    try {
        const q = query(collection(db, 'products'), limit(20));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const discounted = fetched.filter(p => p.originalPrice && p.originalPrice > p.price);
        setOfferProducts(discounted);
    } catch (error) {
        console.error("Error fetching offers", error);
    }
    setLoadingOffers(false);
  };

  return (
    <>
      <header className="w-full bg-white shadow-sm sticky top-0 z-50 font-sans">
        {/* 1. Top Bar - Light Gray */}
        <div className="bg-[#F5F5F5] text-gray-600 text-xs py-1.5 hidden md:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex space-x-6">
              <span className="flex items-center gap-1 hover:text-primary transition cursor-pointer"><Phone className="h-3 w-3" /> 01711-728660</span>
              <span className="flex items-center gap-1 hover:text-primary transition cursor-pointer"><Mail className="h-3 w-3" /> support@mixorasmartshop.com</span>
            </div>
            <div className="flex space-x-6 font-medium">
               <Link to="/order-tracking" className="hover:text-primary transition flex items-center gap-1">
                 <Truck className="h-3 w-3" /> অর্ডার ট্র্যাকিং
               </Link>
              {currentUser ? (
                 <button onClick={logout} className="hover:text-red-500 transition font-bold">লগ আউট</button>
              ) : (
                 <Link to="/login" className="hover:text-primary transition">লগ ইন / সাইন আপ</Link>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Header - White with Logo & Search */}
        <div className="bg-white py-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src="https://iili.io/fX9o8KP.md.png" 
                alt="Mixora Smart Shop" 
                className="h-10 md:h-12 object-contain" 
              />
            </Link>

            {/* Search Bar - Cartup Style (Center) */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-auto relative">
              <form onSubmit={handleSearch} className="flex w-full border-2 border-primary rounded-md overflow-hidden bg-white">
                 <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="কি খুঁজছেন? এখানে সার্চ করুন..." 
                  className="w-full px-4 py-2.5 focus:outline-none text-gray-700 text-sm bg-white"
                />
                <button type="submit" className="bg-primary text-white px-6 font-bold hover:bg-[#333333] transition flex items-center">
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Icons - Right Side */}
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="hidden md:flex flex-col items-center cursor-pointer hover:text-primary transition group relative">
                 <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition">
                    <Heart className="h-5 w-5" />
                 </div>
                 <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full font-bold">0</span>
              </div>
              
              <Link to="/cart" className="flex flex-col items-center cursor-pointer hover:text-primary transition group relative">
                 <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition">
                    <ShoppingCart className="h-5 w-5" />
                 </div>
                 <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full font-bold">
                   {cartCount}
                 </span>
              </Link>

              <Link to={currentUser ? (isAdmin ? "/admin/dashboard" : "/") : "/login"} className="hidden md:flex items-center gap-2 cursor-pointer hover:text-primary transition group">
                 <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition">
                    {isAdmin ? <LayoutDashboard className="h-5 w-5" /> : <User className="h-5 w-5" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs text-gray-500">হ্যালো,</span>
                    <span className="text-sm font-bold text-gray-800 leading-none">{currentUser ? "অ্যাকাউন্ট" : "লগইন"}</span>
                 </div>
              </Link>
              
              <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden text-gray-600 focus:outline-none"
                >
                  {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Menu Bar - Cartup Style */}
        <div className="hidden md:block bg-white border-b border-gray-200 shadow-[0_2px_5px_rgba(0,0,0,0.03)]">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              
              {/* Categories Dropdown Button */}
              <div className="relative group w-64 bg-primary text-white py-3 px-4 cursor-pointer flex items-center justify-between font-bold text-sm tracking-wide">
                 <div className="flex items-center gap-2">
                    <AlignLeft className="h-5 w-5" />
                    <span>সকল ক্যাটাগরি</span>
                 </div>
                 <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition duration-300" />
                 
                 {/* Dropdown Menu (Hover) */}
                 <div className="absolute top-full left-0 w-full bg-white text-gray-800 shadow-lg border-t-0 border border-gray-100 hidden group-hover:block z-50">
                    <ul className="py-2">
                       {categoriesList.slice(0, 8).map((cat, idx) => (
                          <li key={idx}>
                             <Link 
                               to={`/category/${cat}`}
                               className="px-4 py-2 hover:bg-gray-50 hover:text-primary cursor-pointer transition text-sm flex items-center justify-between"
                             >
                               {cat} <ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" />
                             </Link>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Nav Links */}
              <ul className="flex space-x-8 text-sm font-semibold text-gray-700 px-6">
                 <li className="cursor-pointer hover:text-primary transition"><Link to="/">হোম</Link></li>
                 <li className="cursor-pointer hover:text-primary transition"><Link to="/category/all">সকল পণ্য</Link></li>
                 <li className="cursor-pointer hover:text-primary transition"><Link to="/order-tracking">অর্ডার ট্র্যাকিং</Link></li>
              </ul>

              <div 
                onClick={handleSpecialOffers}
                className="ml-auto text-sm font-bold text-secondary flex items-center gap-2 cursor-pointer hover:text-yellow-600 animate-pulse"
              >
                 <Zap className="h-4 w-4" /> স্পেশাল অফার
              </div>
           </div>
        </div>

        {/* Mobile Search & Menu */}
        <div className="md:hidden bg-white pb-3 px-4 shadow-sm border-b border-gray-200">
           <form onSubmit={handleSearch} className="relative mt-2">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="পণ্য খুঁজুন..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-gray-800"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                 <Search className="h-4 w-4" />
              </button>
           </form>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full z-40 shadow-xl h-screen overflow-y-auto">
            <div className="p-4 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-800 bg-gray-50 rounded-lg hover:text-primary">হোম</Link>
              <Link to="/category/all" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-800 bg-gray-50 rounded-lg hover:text-primary">সকল পণ্য</Link>
              <Link to="/order-tracking" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-800 bg-gray-50 rounded-lg hover:text-primary">অর্ডার ট্র্যাকিং</Link>
              <div 
                  onClick={() => { setIsOpen(false); handleSpecialOffers(); }} 
                  className="block px-4 py-2 text-base font-medium text-secondary bg-yellow-50 rounded-lg"
              >
                  ⚡ স্পেশাল অফার
              </div>
              <div className="py-2 border-b border-gray-100">
                  <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">ক্যাটাগরি</p>
                  {categoriesList.map((cat, idx) => (
                      <Link 
                        key={idx} 
                        to={`/category/${cat}`}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-primary"
                      >
                        {cat}
                      </Link>
                  ))}
              </div>
              
              <div className="pt-4 mt-2">
                 {currentUser ? (
                    <>
                       <div className="px-4 text-sm text-gray-500 mb-2">লগইন করা হয়েছে: {currentUser.email}</div>
                       <Link to={isAdmin ? "/admin/dashboard" : "/"} className="block px-4 py-2 text-primary font-bold">
                          {isAdmin ? "ড্যাশবোর্ড" : "আমার প্রোফাইল"}
                       </Link>
                       <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-500 font-bold">লগ আউট</button>
                    </>
                 ) : (
                    <Link to="/login" className="block px-4 py-2 text-center bg-primary text-white rounded-lg font-bold">লগ ইন / রেজিস্টার</Link>
                 )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Special Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary to-gray-900 text-white p-5 flex justify-between items-center shrink-0">
                 <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                       <Zap className="fill-yellow-400 text-yellow-400" /> স্পেশাল ডিসকাউন্ট অফার
                    </h2>
                    <p className="text-sm text-gray-300 opacity-90">সীমিত সময়ের জন্য সেরা ডিলগুলো লুফে নিন!</p>
                 </div>
                 <button 
                    onClick={() => setShowOfferModal(false)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white"
                 >
                    <X className="h-6 w-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                 {loadingOffers ? (
                    <div className="flex flex-col items-center justify-center h-60">
                        <Loader2 className="animate-spin h-10 w-10 text-primary mb-2" />
                        <span className="text-gray-500 font-medium">অফার লোড হচ্ছে...</span>
                    </div>
                 ) : offerProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                       {offerProducts.map(product => {
                           const discount = product.originalPrice 
                            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                            : 0;
                           
                           return (
                               <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                   <div className="relative aspect-square p-2">
                                       <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                       <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                          {discount}% OFF
                                       </span>
                                   </div>
                                   <div className="p-3">
                                       <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                                       <div className="flex items-baseline gap-2 mb-3">
                                          <span className="font-bold text-primary">৳ {product.price}</span>
                                          <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice}</span>
                                       </div>
                                       <button 
                                          onClick={() => {
                                            addToCart(product);
                                            setShowOfferModal(false);
                                          }}
                                          className="w-full bg-secondary text-white text-xs font-bold py-2 rounded hover:bg-[#b0936a] transition"
                                       >
                                          অর্ডার করুন
                                       </button>
                                   </div>
                               </div>
                           );
                       })}
                    </div>
                 ) : (
                    <div className="text-center py-20">
                        <div className="bg-white p-4 rounded-full inline-block mb-3 shadow-sm">
                           <Zap className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">এই মুহূর্তে কোনো অফার নেই</h3>
                        <p className="text-gray-400 text-sm">আমাদের সাথে থাকার জন্য ধন্যবাদ। শীঘ্রই নতুন অফার আসবে।</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;