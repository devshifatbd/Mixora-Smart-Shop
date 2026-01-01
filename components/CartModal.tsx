import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ArrowRight, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-[#F8F9FB] w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-gray-900 to-black p-6 flex justify-between items-center shrink-0">
            <div className="text-white flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <ShoppingBag size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tight">আপনার কার্ট</h2>
                    <p className="text-white/60 text-xs font-bold">{cartItems.length} টি পণ্য যুক্ত আছে</p>
                </div>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition backdrop-blur-sm">
                <X size={20} />
            </button>
        </div>

        {/* Cart Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#F4F7FF]">
            {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-500">কার্ট খালি!</h3>
                    <p className="text-sm text-gray-400 mt-2">এখনো কোনো পণ্য যোগ করা হয়নি</p>
                    <button onClick={onClose} className="mt-6 text-primary font-bold hover:underline">
                        শপিং চালিয়ে যান
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100 flex gap-3 relative overflow-hidden group">
                            {/* Image */}
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl shrink-0 border border-gray-100 p-1">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl mix-blend-multiply" />
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 py-1 pr-8">
                                <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                <p className="text-[10px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded-md inline-block mt-1">{item.category}</p>
                                
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-sm font-black text-primary">৳ {item.price * item.quantity}</div>
                                    
                                    {/* Quantity Control */}
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 rounded-l-lg transition"><Minus size={14} /></button>
                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 rounded-r-lg transition"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button 
                                onClick={() => removeFromCart(item.id)} 
                                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition p-1"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer / Checkout Section */}
        {cartItems.length > 0 && (
            <div className="bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-100 shrink-0 z-10 rounded-t-[24px]">
                
                <div className="flex justify-between items-center mb-2 text-sm text-gray-500 font-medium">
                    <span>সাবটোটাল</span>
                    <span className="font-bold text-gray-900">৳ {subtotal}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-sm text-gray-500 font-medium">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">চেকআউটে যুক্ত হবে</span>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition"
                    >
                        আরো কিনুন
                    </button>
                    <button 
                        onClick={handleCheckout} 
                        className="flex-[2] py-4 bg-gradient-to-r from-primary to-gray-800 text-white font-bold rounded-2xl shadow-xl shadow-gray-300 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        চেকআউট করুন <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;