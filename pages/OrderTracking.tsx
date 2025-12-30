import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Loader2, PackageCheck, MapPin, Calendar, CreditCard, Truck, CheckCircle2 } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('দুঃখিত, এই আইডির কোনো অর্ডার পাওয়া যায়নি। সঠিক অর্ডার আইডি দিন।');
      }
    } catch (err) {
      console.error(err);
      setError('সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }
    setLoading(false);
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Order Confirmed', 'Order Shipped', 'Delivered'];
    // Normalize status names if needed
    if (status === 'Order Placed') status = 'Pending';
    
    // Find index, if not found (e.g. Cancelled) return -1
    return steps.indexOf(status);
  };

  const currentStep = orderData ? getStatusStep(orderData.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">অর্ডার ট্র্যাকিং</h1>
          <p className="text-gray-500">আপনার অর্ডার আইড দিয়ে বর্তমান অবস্থা যাচাই করুন</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="অর্ডার আইডি লিখুন (যেমন: 24102701)" 
              className="flex-1 border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-gray-800"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search className="h-5 w-5" /> ট্র্যাক করুন</>}
            </button>
          </form>
          {error && <p className="text-red-500 mt-3 text-sm font-medium text-center">{error}</p>}
        </div>

        {orderData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <p className="text-sm text-gray-500">অর্ডার আইডি</p>
                  <h2 className="text-xl font-mono font-bold text-primary">#{orderData.id}</h2>
               </div>
               <div className="flex items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      orderData.status === 'Cancelled' || orderData.status === 'Order Canceled' ? 'bg-red-100 text-red-600' :
                      orderData.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                  }`}>
                      {orderData.status}
                  </span>
               </div>
            </div>

            <div className="p-6">
                
                {/* Progress Bar (Only for standard flow) */}
                {orderData.status !== 'Cancelled' && orderData.status !== 'Order Canceled' && (
                    <div className="mb-10 mt-4">
                        <div className="flex justify-between relative">
                            {/* Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                            <div 
                                className="absolute top-1/2 left-0 h-1 bg-secondary -z-10 transform -translate-y-1/2 transition-all duration-1000"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            ></div>

                            {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                const isCompleted = idx <= currentStep;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-all ${isCompleted ? 'border-secondary bg-secondary text-white' : 'border-gray-300 text-gray-300'}`}>
                                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                        </div>
                                        <p className={`text-xs font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">ডেলিভারি তথ্য</h3>
                        <div className="flex items-start gap-3">
                            <PackageCheck className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-700">{orderData.customerName}</p>
                                <p className="text-sm text-gray-500">{orderData.customerPhone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">{orderData.customerAddress}</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">
                                অর্ডার তারিখ: {orderData.createdAt?.toDate().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">পেমেন্ট ও পণ্য</h3>
                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">মেথড: <span className="font-bold uppercase">{orderData.paymentMethod}</span></p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">ডেলিভারি চার্জ: ৳ {orderData.shippingCost}</p>
                        </div>
                        <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                            <p className="flex justify-between text-sm font-bold text-gray-800">
                                <span>মোট বিল:</span>
                                <span className="text-primary text-lg">৳ {orderData.totalAmount}</span>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Items */}
                <div className="mt-8">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">অর্ডারকৃত পণ্যসমূহ</h3>
                    <div className="space-y-3">
                        {orderData.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <img src={item.image} alt="" className="w-12 h-12 rounded object-cover bg-white" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-500">পরিমাণ: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-800">৳ {item.price * item.quantity}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderTracking;