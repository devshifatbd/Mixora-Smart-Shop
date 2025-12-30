import React, { useState } from 'react';
import { CartItem } from '../types';
import { db } from '../firebase';
import { collection, setDoc, doc, Timestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CheckoutProps {
  cartItems: CartItem[];
  clearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, clearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka City',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{id: string, total: number} | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = formData.city === 'Dhaka City' ? 70 : 120;
  const total = subtotal + shipping;

  const generateOrderId = async () => {
    const now = new Date();
    
    // Get last 2 digits of year (YY)
    const yearShort = now.getFullYear().toString().slice(-2); 
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Format: YYMMDD (e.g., 231027)
    const datePrefix = `${yearShort}${month}${day}`;
    
    let newSequence = '01';

    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const lastOrderId = querySnapshot.docs[0].id;
            // Check based on new prefix length (6 chars: YYMMDD)
            if (lastOrderId && lastOrderId.startsWith(datePrefix)) {
                const currentSeqStr = lastOrderId.substring(6);
                const currentSeq = parseInt(currentSeqStr, 10);
                if (!isNaN(currentSeq)) {
                    newSequence = (currentSeq + 1).toString().padStart(2, '0');
                }
            }
        }
    } catch (error) {
        console.error("Error generating ID", error);
        newSequence = Math.floor(Math.random() * 90 + 10).toString();
    }
    return `${datePrefix}${newSequence}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customOrderId = await generateOrderId();

      // Use setDoc with custom ID
      await setDoc(doc(db, 'orders', customOrderId), {
        id: customOrderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: `${formData.address}, ${formData.city}`,
        items: cartItems,
        totalAmount: total,
        shippingCost: shipping,
        status: 'Pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now()
      });

      setOrderSuccess({ id: customOrderId, total: total });
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
    setLoading(false);
  };

  if (cartItems.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  if (orderSuccess) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-green-500 animate-fade-in-up">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">অর্ডার কনফার্ম!</h2>
                  <p className="text-gray-600 mb-6">আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
                      <p className="text-sm text-gray-500">অর্ডার আইডি:</p>
                      <p className="text-2xl font-mono font-bold text-primary mb-2 tracking-widest">#{orderSuccess.id}</p>
                      <p className="text-sm text-gray-500">সর্বমোট বিল:</p>
                      <p className="text-xl font-bold text-gray-800">৳ {orderSuccess.total}</p>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।</p>

                  <button 
                      onClick={() => navigate('/')}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                  >
                      হোম পেজে ফিরে যান
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">শিপিং তথ্য</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">আপনার নাম</label>
                  <input required type="text" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:outline-none focus:border-secondary" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="নাম লিখুন" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">মোবাইল নাম্বার</label>
                  <input required type="tel" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:outline-none focus:border-secondary" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="017xxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">সম্পূর্ণ ঠিকানা</label>
                  <textarea required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:outline-none focus:border-secondary" rows={3}
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="বাসা, রোড, থানা, জেলা" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">শহর (ডেলিভারি এরিয়া)</label>
                   <select className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:outline-none focus:border-secondary font-medium" 
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                      <option value="Dhaka City">Dhaka City (৳ ৭০)</option>
                      <option value="Outside Dhaka">Outside Dhaka (৳ ১২০)</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">পেমেন্ট মেথড</h2>
               <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-4 border border-secondary/30 rounded-lg cursor-pointer bg-secondary/5">
                     <input type="radio" name="payment" value="cod" checked readOnly className="text-secondary focus:ring-secondary w-5 h-5" />
                     <span className="font-bold text-gray-800">ক্যাশ অন ডেলিভারি (COD)</span>
                  </label>
               </div>
            </div>
          </div>

          <div className="md:col-span-1">
             <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2 text-gray-800">অর্ডার সারাংশ</h2>
                <div className="space-y-3 mb-4 text-sm max-h-60 overflow-y-auto custom-scrollbar">
                   {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-start">
                         <span className="text-gray-600 w-2/3">{item.name} <span className="text-gray-400 text-xs">x {item.quantity}</span></span>
                         <span className="font-medium text-gray-900">৳ {item.price * item.quantity}</span>
                      </div>
                   ))}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                   <div className="flex justify-between text-gray-700 mb-2">
                      <span>সাবটোটাল</span>
                      <span>৳ {subtotal}</span>
                   </div>
                   <div className="flex justify-between text-gray-700 mb-2">
                      <span>ডেলিভারি</span>
                      <span className="text-red-500 font-bold">+ ৳ {shipping}</span>
                   </div>
                   <div className="flex justify-between font-extrabold text-xl text-primary pt-2 border-t border-gray-200 mt-2">
                      <span>সর্বমোট</span>
                      <span>৳ {total}</span>
                   </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-secondary text-white py-4 rounded-xl mt-6 font-bold text-lg hover:bg-[#b0936a] transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <>অর্ডার কনফার্ম করুন <ArrowRight className="h-5 w-5" /></>}
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;