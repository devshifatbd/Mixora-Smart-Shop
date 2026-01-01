import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
// Cart Page removed - Replaced by Modal
import Checkout from './pages/Checkout';
// AdminLogin removed from customer routes
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
// OrderTracking Page removed - Replaced by Modal
import Contact from './pages/Contact';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import TrackingModal from './components/TrackingModal';
import CartModal from './components/CartModal';
import { Product, CartItem } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { Home as HomeIcon, Grid, ShoppingCart, User, Heart } from 'lucide-react';
import './firebase'; 

// Customer Mobile Bottom Navigation
const MobileBottomNav: React.FC<{ 
  cartCount: number; 
  onOpenLogin: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
}> = ({ cartCount, onOpenLogin, onOpenTracking, onOpenCart }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe rounded-t-2xl">
      <Link to="/" className={`flex flex-col items-center transition-colors duration-300 ${isActive('/') ? 'text-primary' : 'text-gray-400'}`}>
         <HomeIcon size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
         <span className="text-[10px] font-bold mt-1">হোম</span>
      </Link>
      <Link to="/category/all" className={`flex flex-col items-center transition-colors duration-300 ${isActive('/category/all') ? 'text-primary' : 'text-gray-400'}`}>
         <Grid size={22} strokeWidth={isActive('/category/all') ? 2.5 : 2} />
         <span className="text-[10px] font-bold mt-1">শপ</span>
      </Link>
      <button onClick={onOpenCart} className="flex flex-col items-center relative group">
         <div className={`p-3 rounded-full -mt-8 border-4 border-[#F1F2F4] shadow-lg transition-transform active:scale-95 bg-primary text-white`}>
            <ShoppingCart size={24} fill="white" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold animate-bounce">
                {cartCount}
              </span>
            )}
         </div>
      </button>
      <button onClick={onOpenTracking} className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors duration-300">
         <Heart size={22} />
         <span className="text-[10px] font-bold mt-1">ট্র্যাকিং</span>
      </button>
      <button onClick={onOpenLogin} className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors duration-300">
         <User size={22} />
         <span className="text-[10px] font-bold mt-1">অ্যাকাউন্ট</span>
      </button>
    </div>
  );
};

// Layout Component receives props to pass to Navbar
const Layout: React.FC<{ 
  children: React.ReactNode; 
  cartCount: number; 
  addToCart: (product: Product) => void;
  onOpenLogin: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
}> = ({ children, cartCount, addToCart, onOpenLogin, onOpenTracking, onOpenCart }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Scroll to Top on Route Change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen relative bg-[#F1F2F4]">
      {!isAdminRoute && (
        <Navbar 
          cartCount={cartCount} 
          addToCart={addToCart} 
          onOpenLogin={onOpenLogin}
          onOpenTracking={onOpenTracking}
          onOpenCart={onOpenCart}
        />
      )}
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && (
        <MobileBottomNav 
          cartCount={cartCount} 
          onOpenLogin={onOpenLogin} 
          onOpenTracking={onOpenTracking} 
          onOpenCart={onOpenCart}
        />
      )}
      
      {!isAdminRoute && (
        <a 
          href="https://wa.me/8801711728660" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 transition-transform duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
          title="Chat on WhatsApp"
        >
          <div className="bg-[#25D366] p-3 md:p-4 rounded-full shadow-[0_4px_15px_rgba(37,211,102,0.4)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </a>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('mixora-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from local storage", error);
      localStorage.removeItem('mixora-cart');
    }
  }, []);

  useEffect(() => {
    try {
      const cleanCart = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        category: item.category,
        quantity: item.quantity,
        stock: item.stock
      }));
      localStorage.setItem('mixora-cart', JSON.stringify(cleanCart));
    } catch (error) {
      console.error("Failed to save cart to local storage", error);
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Optional: Open cart when item is added
    // setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AuthProvider>
      <HashRouter>
        <Layout 
          cartCount={cartCount} 
          addToCart={addToCart}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenTracking={() => setIsTrackingOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
        >
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/category/:categoryName" element={<CategoryPage addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            {/* Cart, Tracking, and Login Routes are removed as they are now Modals */}
            <Route 
              path="/checkout" 
              element={<Checkout cartItems={cart} clearCart={clearCart} />} 
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Layout>
        
        {/* Global Modals */}
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <TrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />
        <CartModal 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cartItems={cart} 
            updateQuantity={updateQuantity} 
            removeFromCart={removeFromCart} 
        />

      </HashRouter>
    </AuthProvider>
  );
};

export default App;