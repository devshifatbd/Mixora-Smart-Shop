import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { db } from '../firebase';
import { doc, getDoc, collection, setDoc, Timestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { Minus, Plus, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Truck, PackageCheck, Banknote, ShoppingCart, Sparkles, Star, Cpu, Layers, Zap, Award, ThumbsUp, Info } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface ProductDetailsProps {
  addToCart: (product: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka City', // Default to Inside Dhaka
    paymentMethod: 'cod'
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{id: string, total: number} | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          
          // Fetch related products
          const relatedQ = query(
              collection(db, "products"), 
              where("category", "==", prodData.category), 
              limit(5)
          );
          const relatedSnap = await getDocs(relatedQ);
          const related = relatedSnap.docs
            .map(d => ({id: d.id, ...d.data()} as Product))
            .filter(p => p.id !== prodData.id);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error getting product:", error);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // --- AI Logic: Generate Extra Tags based on Keywords ---
  const generateAIInsights = (text: string, category: string) => {
    const insights = [];
    const lowerText = text.toLowerCase();
    const lowerCat = category.toLowerCase();

    if (lowerText.includes('cotton') || lowerText.includes('fabric') || lowerText.includes('soft')) {
        insights.push({ icon: <Layers className="w-4 h-4" />, text: "উন্নত ফেব্রিক" });
    }
    if (lowerText.includes('battery') || lowerText.includes('charg') || lowerCat.includes('electronic')) {
        insights.push({ icon: <Zap className="w-4 h-4" />, text: "লং লাস্টিং ব্যাটারি" });
    }
    if (lowerText.includes('warranty') || lowerText.includes('guarantee')) {
        insights.push({ icon: <ShieldCheck className="w-4 h-4" />, text: "ওয়ারেন্টি সুবিধা" });
    }
    if (lowerText.includes('premium') || lowerText.includes('quality') || lowerText.includes('best')) {
        insights.push({ icon: <Award className="w-4 h-4" />, text: "প্রিমিয়াম কোয়ালিটি" });
    }
    if (lowerText.includes('gift') || lowerCat.includes('gift')) {
        insights.push({ icon: <Sparkles className="w-4 h-4" />, text: "গিফটের জন্য সেরা" });
    }

    // Default tag if none found, just to look good
    if (insights.length === 0) {
        insights.push({ icon: <ThumbsUp className="w-4 h-4" />, text: "হাইলি রেকমেন্ডেড" });
    }
    
    return insights;
  };

  // --- Advanced AI Description Parser & Renderer ---
  const renderAIDescription = (desc: string, category: string) => {
    // 1. Clean and split text
    const lines = desc.split(/[।.\n]/).filter(s => s.trim().length > 0);
    
    const highlights: string[] = [];
    const specs: { key: string, value: string }[] = [];
    const details: string[] = [];

    // Parse logic
    lines.forEach(line => {
        const cleanLine = line.trim();
        // Check for Specification pattern (e.g., "Color: Red" or "Battery - 5000mAh")
        const specMatch = cleanLine.match(/^([^:-]+)[:\u2013-](.+)$/);

        if (specMatch && cleanLine.length < 50) {
            specs.push({ key: specMatch[1].trim(), value: specMatch[2].trim() });
        } 
        // Check for Highlights (Short bullet points)
        else if (cleanLine.length < 60) {
            highlights.push(cleanLine);
        } 
        // Long text is Narrative Detail
        else {
            details.push(cleanLine);
        }
    });

    const aiInsights = generateAIInsights(desc, category);

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* 1. Insights & Highlights (Subtle Design, No explicit "AI" Label) */}
            {(aiInsights.length > 0 || highlights.length > 0) && (
                <div className="space-y-5">
                    
                    {/* Smart Tags */}
                    <div className="flex flex-wrap gap-2.5">
                        {aiInsights.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">
                                <span className="text-secondary p-1 bg-secondary/10 rounded-full">{tag.icon}</span>
                                <span className="text-xs font-bold text-gray-700">{tag.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Highlights (Feature Cards) */}
                    {highlights.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {highlights.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-secondary/20 transition-colors">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-gray-700 leading-relaxed">{feat}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 2. Technical Specifications */}
            {specs.length > 0 && (
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-gray-600" /> স্পেসিফিকেশন
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specs.map((spec, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-gray-500 text-sm font-medium">{spec.key}</span>
                                <span className="text-gray-900 font-bold text-sm">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Detailed Narrative (Beautiful Part-by-Part Cards) */}
            {details.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg border-b border-gray-100 pb-2">
                        <Info className="h-5 w-5 text-secondary" /> বিস্তারিত তথ্য
                    </h3>
                    <div className="space-y-4">
                        {details.map((det, idx) => (
                            <div key={idx} className="group flex gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-secondary/30 transition-all duration-300">
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                                        <span className="font-bold text-xs">{idx + 1}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed pt-1 text-[15px]">
                                    {det}।
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fallback if description is plain */}
            {highlights.length === 0 && specs.length === 0 && details.length === 0 && (
                <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">{desc}</p>
            )}
        </div>
    );
  };

  // --- Custom Order ID Generator (YYMMDDxx) ---
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
        // Query the last order
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const lastOrderId = querySnapshot.docs[0].id; // Storing custom ID as doc ID

            // Check if last order starts with today's prefix (Length of YYMMDD is 6)
            if (lastOrderId && lastOrderId.startsWith(datePrefix)) {
                // Extract sequence (everything after the first 6 chars)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  if (!product) return <div className="min-h-screen flex items-center justify-center">পণ্যটি পাওয়া যায়নি</div>;

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const shippingCost = formData.city === 'Dhaka City' ? 70 : 120;
  const subTotal = product.price * quantity;
  const total = subTotal + shippingCost;

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      const customOrderId = await generateOrderId();

      await setDoc(doc(db, 'orders', customOrderId), {
        id: customOrderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: `${formData.address}, ${formData.city}`,
        items: [{...product, quantity: quantity}],
        totalAmount: total,
        shippingCost: shippingCost,
        status: 'Pending',
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now()
      });

      setOrderSuccess({ id: customOrderId, total: total });
      setFormData({ name: '', phone: '', address: '', city: 'Dhaka City', paymentMethod: 'cod' });
      setQuantity(1);
    } catch (error) {
      console.error("Order error:", error);
      alert('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
    setOrderLoading(false);
  };

  const handleAddToCart = () => {
    for(let i=0; i<quantity; i++) {
        addToCart(product);
    }
  };

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
                      onClick={() => { setOrderSuccess(null); navigate('/'); }}
                      className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                  >
                      আরো শপিং করুন
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-10">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* Product Images */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="aspect-square bg-gray-50 relative">
                        <img 
                            src={productImages[currentImageIndex]} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-4"
                        />
                        {discountPercentage > 0 && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                             {discountPercentage}% ছাড়
                          </div>
                        )}
                    </div>
                    {productImages.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide border-t border-gray-100">
                            {productImages.map((img, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`w-20 h-20 border-2 rounded-lg cursor-pointer overflow-hidden flex-shrink-0 transition-all ${currentImageIndex === idx ? 'border-secondary ring-2 ring-secondary/30' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Title */}
                <div className="lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-primary">৳ {product.price}</span>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">৳ {product.originalPrice}</span>
                        )}
                    </div>
                </div>

                {/* AI-Enhanced Description Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <PackageCheck className="text-secondary" /> পণ্যের বিবরণ
                    </h2>
                    
                    {/* Render AI Processed Description */}
                    {renderAIDescription(product.description, product.category)}

                    {product.features && product.features.length > 0 && (
                        <div className="mt-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-3">অতিরিক্ত ফিচারসমূহ:</h3>
                            <ul className="space-y-2">
                                {product.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span className="text-indigo-800">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="bg-[#FFF9F0] rounded-2xl border border-orange-100 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">আমাদের প্রতিশ্রুতি</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <PackageCheck className="h-6 w-6 text-secondary shrink-0" />
                            <p className="text-sm font-medium text-gray-700">পণ্য হাতে নিয়ে চেক করে পেমেন্ট করার সুবিধা।</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <ShieldCheck className="h-6 w-6 text-secondary shrink-0" />
                            <p className="text-sm font-medium text-gray-700">পণ্যতে কোন ত্রুটি থাকলে ৭ দিনের ভিতের রিপ্লেসমেন্ট সুবিধা।</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <Truck className="h-6 w-6 text-secondary shrink-0" />
                            <p className="text-sm font-medium text-gray-700">কোন প্রকার অগ্রিম পেমেন্ট ছাড়াই সরাদেশ হোম ডেলিভারি।</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <Banknote className="h-6 w-6 text-secondary shrink-0" />
                            <p className="text-sm font-medium text-gray-700">বাজারের সবচেয়ে প্রিমিয়াম কোয়ালিটির পণ্য সাশ্রয়ী দামে।</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Desktop Title & Price */}
                    <div className="hidden lg:block bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
                        <div className="flex items-baseline gap-3 mb-4">
                            <span className="text-4xl font-extrabold text-primary">৳ {product.price}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-gray-400 line-through">৳ {product.originalPrice}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md w-fit">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> স্টক এভেইলেবল
                        </div>
                    </div>

                    {/* ORDER FORM */}
                    <div id="order-form" className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-t-4 border-secondary p-6 md:p-8 relative overflow-hidden">
                        
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">অর্ডার কনফার্ম করতে</h2>
                            <p className="text-gray-600 font-medium">নিচের ফর্মটি পূরণ করুন</p>
                        </div>

                        <form onSubmit={handleDirectOrder} className="space-y-4">
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">আপনার নাম</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="আপনার নাম লিখুন" 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-gray-900"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">মোবাইল নাম্বার</label>
                                <input 
                                    required 
                                    type="tel" 
                                    placeholder="017xxxxxxxx" 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-gray-900"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">সম্পূর্ণ ঠিকানা</label>
                                <textarea 
                                    required 
                                    rows={2}
                                    placeholder="বাসা নং, রোড নং, থানা, জেলা" 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-gray-900"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">পরিমাণ</label>
                                     <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:bg-gray-200 rounded-l-lg transition"><Minus className="h-4 w-4" /></button>
                                        <input type="text" readOnly value={quantity} className="w-full text-center font-bold text-gray-900 bg-transparent" />
                                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:bg-gray-200 rounded-r-lg transition"><Plus className="h-4 w-4" /></button>
                                     </div>
                                </div>
                                <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1.5">শহর (ডেলিভারি এরিয়া)</label>
                                     <select 
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary font-medium text-gray-800"
                                        value={formData.city}
                                        onChange={e => setFormData({...formData, city: e.target.value})}
                                     >
                                        <option value="Dhaka City">Dhaka City</option>
                                        <option value="Outside Dhaka">Outside Dhaka</option>
                                     </select>
                                </div>
                            </div>

                            {/* INVOICE SUMMARY */}
                            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-dashed border-gray-300 mt-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider border-b border-gray-200 pb-2">ইনভয়েস সামারি</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span>পণ্যের দাম ({quantity} টি)</span>
                                        <span className="font-bold">৳ {subTotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ডেলিভারি চার্জ ({formData.city === 'Dhaka City' ? 'ঢাকা' : 'ঢাকার বাইরে'})</span>
                                        <span className="font-bold text-red-500">+ ৳ {shippingCost}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-extrabold text-primary">
                                        <span>সর্বমোট পরিশোধ করতে হবে</span>
                                        <span>৳ {total}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={orderLoading}
                                className="w-full bg-secondary text-white text-lg font-bold py-4 rounded-xl hover:bg-[#b0936a] transition shadow-lg flex items-center justify-center gap-2 animate-pulse-slow mt-4"
                            >
                                {orderLoading ? (
                                    <Loader2 className="animate-spin h-6 w-6" />
                                ) : (
                                    <>অর্ডার কনফার্ম করুন <ArrowRight className="h-5 w-5" /></>
                                )}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={handleAddToCart} 
                                className="w-full flex items-center justify-center gap-2 text-gray-600 font-bold py-3 hover:text-primary hover:bg-gray-50 rounded-lg transition"
                            >
                                <ShoppingCart className="h-5 w-5" /> কার্টে রাখুন
                            </button>

                        </form>
                    </div>

                </div>
            </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PackageCheck className="text-secondary" /> আপনার আরো পছন্দ হতে পারে
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {relatedProducts.length > 0 ? relatedProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} addToCart={addToCart} />
                )) : (
                    <div className="col-span-full text-center text-gray-400 py-8">
                        অন্য কোনো পণ্য পাওয়া যায়নি
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;