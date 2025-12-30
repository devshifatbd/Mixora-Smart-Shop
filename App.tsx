import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
import OrderTracking from './pages/OrderTracking';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import { Product, CartItem } from './types';
import { AuthProvider } from './contexts/AuthContext';
import './firebase'; 

// Layout Component receives addToCart to pass it to Navbar for Special Offer Modal
const Layout: React.FC<{ children: React.ReactNode, cartCount: number, addToCart: (product: Product) => void }> = ({ children, cartCount, addToCart }) => {
  const location = useLocation();
  // Check if current path is an admin path
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen relative">
      {!isAdminRoute && <Navbar cartCount={cartCount} addToCart={addToCart} />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      
      {/* WhatsApp Floating Button with Official Icon */}
      {!isAdminRoute && (
        <a 
          href="https://wa.me/8801711728660" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
          title="Chat on WhatsApp"
        >
          <div className="bg-[#25D366] p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
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

  useEffect(() => {
    const savedCart = localStorage.getItem('mixora-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mixora-cart', JSON.stringify(cart));
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
    alert(`${product.name} ঝুড়িতে যুক্ত করা হয়েছে!`);
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
        <Layout cartCount={cartCount} addToCart={addToCart}>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            
            {/* Category Page - Handles specific category and 'all' */}
            <Route path="/category/:categoryName" element={<CategoryPage addToCart={addToCart} />} />
            
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cartItems={cart} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                />
              } 
            />
            <Route 
              path="/checkout" 
              element={<Checkout cartItems={cart} clearCart={clearCart} />} 
            />
            {/* Order Tracking */}
            <Route path="/order-tracking" element={<OrderTracking />} />
            {/* Contact Page */}
            <Route path="/contact" element={<Contact />} />

            {/* Login Route (Generic for User & Admin) */}
            <Route path="/login" element={<AdminLogin />} />
            
            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;