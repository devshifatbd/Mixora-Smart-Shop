import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Loader2, MapPin, Calendar, X, Truck, CheckCircle2, Package } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const docRef = doc(db, 'orders', orderId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('কোনো অর্ডার পাওয়া যায়নি। সঠিক আইডি দিন।');
      }
    } catch (err) {
      console.error(err);
      setError('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
    setLoading(false);
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Order Confirmed', 'Order Shipped', 'Delivered'];
    if (status === 'Order Placed') status = 'Pending';
    return steps.indexOf(status);
  };

  const currentStep = orderData ? getStatusStep(orderData.status) : -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-[#F8F9FB] rounded-[2rem] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 flex justify-between items-center shrink-0">
            <div className="text-white">
                <h2 className="text-2xl font-black flex items-center gap-2"><Truck /> অর্ডার ট্র্যাকিং</h2>
                <p className="text-white/80 text-xs font-medium">সহজেই আপনার অর্ডারের অবস্থান জানুন</p>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition backdrop-blur-sm">
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* Search Box */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Search size={20} />
                </div>
                <form onSubmit={handleTrack} className="flex-1 flex gap-2">
                    <input 
                        type="text" 
                        placeholder="অর্ডার আইডি (যেমন: 24102701)" 
                        className="flex-1 bg-transparent outline-none font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition text-sm disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'ট্র্যাক'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold text-sm mb-4 animate-pulse border border-red-100">
                    {error}
                </div>
            )}

            {!orderData && !loading && !error && (
                <div className="text-center py-10 opacity-50">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold">ট্র্যাক করতে অর্ডার আইডি দিয়ে সার্চ করুন</p>
                </div>
            )}

            {orderData && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">অর্ডার আইডি</p>
                                <h3 className="text-xl font-black text-gray-800 tracking-wider">#{orderData.id}</h3>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                orderData.status === 'Cancelled' || orderData.status === 'Order Canceled' ? 'bg-red-100 text-red-600' :
                                orderData.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {orderData.status}
                            </span>
                        </div>

                        {/* Visual Timeline */}
                        {orderData.status !== 'Cancelled' && orderData.status !== 'Order Canceled' && (
                            <div className="relative px-2">
                                <div className="absolute top-4 left-0 w-full h-1.5 bg-gray-100 rounded-full"></div>
                                <div 
                                    className="absolute top-4 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${(currentStep / 3) * 100}%` }}
                                ></div>
                                <div className="flex justify-between relative z-10">
                                    {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                        const isCompleted = idx <= currentStep;
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-3 w-1/4">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-all shadow-sm ${isCompleted ? 'border-blue-500 bg-white text-blue-500 scale-110' : 'border-white bg-gray-200 text-gray-300'}`}>
                                                    {isCompleted ? <CheckCircle2 size={16} fill="currentColor" className="text-white" /> : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                                                </div>
                                                <p className={`text-[10px] font-bold uppercase text-center ${isCompleted ? 'text-blue-600' : 'text-gray-300'}`}>{step}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100">
                             <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                                <MapPin size={16} className="text-orange-500" />
                                <h4 className="font-bold text-gray-800 text-sm">ডেলিভারি ঠিকানা</h4>
                             </div>
                             <p className="text-sm font-bold text-gray-800">{orderData.customerName}</p>
                             <p className="text-xs text-gray-500 mt-1">{orderData.customerPhone}</p>
                             <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 p-2 rounded-lg">{orderData.customerAddress}</p>
                        </div>

                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100">
                             <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                                <Calendar size={16} className="text-purple-500" />
                                <h4 className="font-bold text-gray-800 text-sm">অর্ডার সামারি</h4>
                             </div>
                             <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                <span>অর্ডার তারিখ:</span>
                                <span>{orderData.createdAt?.toDate().toLocaleDateString()}</span>
                             </div>
                             <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                <span>পেমেন্ট:</span>
                                <span className="uppercase">{orderData.paymentMethod}</span>
                             </div>
                             <div className="flex justify-between text-sm font-black text-primary mt-3 pt-2 border-t border-dashed border-gray-200">
                                <span>মোট বিল:</span>
                                <span>৳ {orderData.totalAmount}</span>
                             </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100">
                         <h4 className="font-bold text-gray-800 text-sm mb-3">অর্ডারকৃত পণ্য</h4>
                         <div className="space-y-3">
                            {orderData.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                                    <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-white" alt="" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">৳{item.price * item.quantity}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;