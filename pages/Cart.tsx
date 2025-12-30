import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-medium text-gray-600 mb-2">আপনার কার্টে কোনো পণ্য নেই</h2>
        <Link to="/" className="text-primary border border-primary px-8 py-2 rounded-sm uppercase font-bold text-sm hover:bg-orange-50 transition">
          কেনাকাটা করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">শপিং কার্ট</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          
          <div className="lg:flex-1">
             <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center text-sm text-gray-600 font-medium border border-gray-100">
                <div>সব নির্বাচন করুন ({cartItems.length} টি পণ্য)</div>
                <button className="flex items-center text-gray-500 hover:text-red-500 transition"><Trash2 className="h-4 w-4 mr-1" /> সব মুছুন</button>
             </div>

            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-4 flex-1">
                     <img src={item.image} alt={item.name} className="w-20 h-20 object-cover border border-gray-200 rounded-md" />
                     <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-800 line-clamp-2 hover:text-primary cursor-pointer">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-end min-w-[150px]">
                     <div className="text-lg font-bold text-primary mb-2">৳ {item.price * item.quantity}</div>
                     <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-50 p-2 hover:bg-gray-100 text-gray-600 transition"><Minus className="h-4 w-4" /></button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-50 p-2 hover:bg-gray-100 text-gray-600 transition"><Plus className="h-4 w-4" /></button>
                     </div>
                     <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 mt-3 text-xs font-bold uppercase transition flex items-center">
                        <Trash2 className="h-3 w-3 mr-1" /> রিমুভ
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">অর্ডার সামারি</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600"><span>সাবটোটাল</span><span>৳ {subtotal}</span></div>
                <div className="flex justify-between text-gray-500 text-sm">
                    <span>শিপিং চার্জ</span>
                    <span className="italic">চেকআউটে যুক্ত হবে</span>
                </div>
              </div>
              <div className="flex justify-between items-center font-bold text-gray-800 mb-6 pt-2 border-t border-dashed">
                  <span>আনুমানিক মোট</span>
                  <span className="text-primary text-xl">৳ {subtotal}</span>
              </div>
              <button 
                  onClick={() => navigate('/checkout')} 
                  className="w-full bg-secondary text-white py-3.5 rounded-lg font-bold uppercase text-sm hover:bg-[#b0936a] shadow-lg transition flex items-center justify-center gap-2"
              >
                  চেকআউট করুন <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;