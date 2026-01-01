import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs, limit, query, doc, getDoc } from 'firebase/firestore';
import { 
  Loader2, ChevronRight, Sparkles, Tag, Truck, ShieldCheck, 
  CreditCard, LayoutDashboard, MessageCircle, Send, Timer, ShoppingBag, Zap, ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesList } from '../data';

interface HomeProps {
  addToCart: (product: Product) => void;
}

// Updated Category Images as per user request
const categoryIcons3D: Record<string, string> = {
  'পুরুষদের ফ্যাশন': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/alt-men-s-fashion-1739454090154.png&width=180',
  'নারীদের ফ্যাশন': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/women-s-fashion-1739453519658.png&width=180',
  'ইলেকট্রনিক্স ও গ্যাজেট': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/electronic-accessories-1739453603406.png&width=180', 
  'গৃহস্থালী ও লিভিং': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/tv-home-appliance-1739453546671.png&width=180', 
  'বিউটি ও পার্সোনাল কেয়ার': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/health-beauty-1739453480173.png&width=180',
  'খেলাধুলা ও ফিটনেস': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/sports-outdoors-1739453653455.png&width=180',
  'কিডস ও টয়েজ': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/automotive-motorcycle-1739453692433.png&width=180',
  'গিফট ও স্টেশনারি': 'https://imrs.cartup.com/api/v1/image-resize?imageUrl=https://sl-dev-s3.s3.amazonaws.com/admin/resources/watches-bags-1739453629792.png&width=180',
};

// Fallback Icons (Lucide)
const categoryIconsFallback: Record<string, any> = {
  'পুরুষদের ফ্যাশন': Tag,
  'নারীদের ফ্যাশন': Sparkles,
  'ইলেকট্রনিক্স ও গ্যাজেট': Zap,
  'গৃহস্থালী ও লিভিং': Tag,
  'বিউটি ও পার্সোনাল কেয়ার': Sparkles,
  'খেলাধুলা ও ফিটনেস': Tag,
  'কিডস ও টয়েজ': Tag,
  'গিফট ও স্টেশনারি': Tag,
};

const defaultSlides = [
  { 
    id: 1, 
    bgImage: "https://i.pinimg.com/736x/2b/fe/52/2bfe5239a045e652557d8bb742fc28e2.jpg", 
    title: "রিভিউ & উইন",
    highlight: "১০০০ টাকার ভাউচার", 
    description: "মিক্সোরা সুপার শপ থেকে পণ্য কিনে রিভিউ দিয়ে জিতে নিন নিশ্চিত উপহার।",
    btnText: "শপ করুন",
    btnColor: "bg-white text-blue-600"
  },
  { 
    id: 2, 
    bgImage: "https://i.pinimg.com/736x/6a/33/40/6a33404103b3158d6d07ed1a0a8a72fc.jpg", 
    title: "ঈদ কালেকশন",
    highlight: "৭০% পর্যন্ত ছাড়",
    description: "এক্সক্লুসিভ ডিজাইন এবং প্রিমিয়াম কোয়ালিটির ঈদ কালেকশন এখন হাতের মুঠোয়।",
    btnText: "অর্ডার করুন",
    btnColor: "bg-white text-pink-600"
  },
  { 
    id: 3, 
    bgImage: "https://i.pinimg.com/736x/2a/b7/a0/2ab7a0ba8df54ccce0c0ae8001935864.jpg", 
    title: "গ্যাজেট ফেস্ট",
    highlight: "সেরা দামে সেরা পণ্য",
    description: "অরিজিনাল স্মার্টওয়াচ, ইয়ারবাড এবং এক্সেসরিজ এর বিশাল সমাহার।",
    btnText: "দেখুন",
    btnColor: "bg-white text-cyan-600"
  },
];

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();

  // Content States
  const [slides, setSlides] = useState(defaultSlides);
  const [flashSaleEndTime, setFlashSaleEndTime] = useState<Date | null>(null);
  const [middleBanner, setMiddleBanner] = useState({
      image: "https://i.pinimg.com/1200x/ee/06/b5/ee06b50d83e0da8b9f57eae955246ccd.jpg",
      title: "YEAR END SALE",
      badge: "Limited Time Offer",
      description: "আমাদের সব প্রিমিয়াম কালেকশনে পাচ্ছেন বিশেষ ছাড়। স্টক শেষ হওয়ার আগেই অর্ডার করুন।",
      btnText: "অফারগুলো দেখুন"
  });

  // Handle Image Error for Categories
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const handleImageError = (cat: string) => {
    setImgError(prev => ({ ...prev, [cat]: true }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products
        const productSnapshot = await getDocs(query(collection(db, "products"), limit(20)));
        const productList = productSnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
        } as Product));
        setProducts(productList);

        // Fetch Hero Slides
        const heroDoc = await getDoc(doc(db, "siteContent", "hero"));
        if (heroDoc.exists() && heroDoc.data().slides) {
            setSlides(heroDoc.data().slides);
        }

        // Fetch Middle Banner
        const middleBannerDoc = await getDoc(doc(db, "siteContent", "middleBanner"));
        if (middleBannerDoc.exists()) {
            setMiddleBanner(middleBannerDoc.data() as any);
        }

        // Fetch Flash Sale
        const fsDoc = await getDoc(doc(db, "siteContent", "flashSale"));
        if (fsDoc.exists() && fsDoc.data().endTime) {
            setFlashSaleEndTime(new Date(fsDoc.data().endTime));
        } else {
            // Default 5 hours if not set
            setFlashSaleEndTime(new Date(Date.now() + 5 * 60 * 60 * 1000));
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Flash Sale Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
        if (!flashSaleEndTime) return;
        
        const now = new Date();
        const diff = flashSaleEndTime.getTime() - now.getTime();

        if (diff <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ hours, minutes, seconds });
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSaleEndTime]);

  const handleDirectOrder = (product: Product) => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#F1F2F4] font-sans pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Left: Main Slider (75% Width) */}
              <div className="lg:col-span-3 relative h-[250px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm group">
                  {slides.map((slide, index) => (
                      <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                      >
                          <img 
                            src={slide.bgImage} 
                            alt={slide.title} 
                            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2000ms]"
                          />
                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
                              <div className="animate-fade-in-up max-w-xl">
                                 <h2 className="text-3xl md:text-6xl font-black mb-3 uppercase tracking-tight drop-shadow-2xl leading-none">
                                   {slide.title}
                                 </h2>
                                 <div className="bg-white/10 backdrop-blur-md inline-block px-4 py-2 rounded-lg border-l-4 border-yellow-400 mb-5">
                                    <h3 className="text-xl md:text-3xl font-bold text-yellow-300 drop-shadow-md tracking-wider">{slide.highlight}</h3>
                                 </div>
                                 <p className="text-sm md:text-lg mb-8 font-medium text-gray-200 drop-shadow-md leading-relaxed max-w-md hidden md:block">
                                   {slide.description}
                                 </p>
                                 <button 
                                    onClick={() => navigate('/category/all')}
                                    className={`${slide.btnColor || "bg-white text-blue-600"} px-8 py-3.5 rounded-full font-bold shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 text-sm uppercase tracking-wider`}
                                 >
                                    {slide.btnText} <ChevronRight size={18} />
                                 </button>
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {/* Dots */}
                  <div className="absolute bottom-5 left-8 md:left-16 flex space-x-2 z-20">
                    {slides.map((_, idx) => (
                        <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/40 w-2'}`}
                        />
                    ))}
                  </div>
              </div>

              {/* Right: WhatsApp Order Card */}
              <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
                  <div className="bg-[#128C7E] h-full rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-center items-center text-center group cursor-pointer border border-[#075E54]">
                      
                      {/* Background Patterns */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://i.pinimg.com/originals/97/66/6a/97666a36f7556dbbe0147c234907954a.jpg')] bg-cover"></div>
                      
                      <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-full mb-4 border border-white/20 animate-bounce-slow">
                          <MessageCircle className="h-10 w-10 text-white fill-white" />
                      </div>
                      
                      <h3 className="relative z-10 text-white font-black text-xl mb-1 uppercase tracking-tight">অর্ডার করুন</h3>
                      <h4 className="relative z-10 text-yellow-300 font-bold text-sm mb-4">সরাসরি হোয়াটসঅ্যাপে</h4>

                      <div className="relative z-10 bg-white rounded-xl py-3 px-6 w-full mb-4 shadow-lg">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">হটলাইন নাম্বার</p>
                          <p className="text-2xl font-black text-[#128C7E]">01711-728660</p>
                      </div>

                      <a 
                          href="https://wa.me/8801711728660" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative z-10 w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border-b-4 border-[#075E54] active:border-b-0 active:translate-y-1"
                      >
                         <Send size={18} /> মেসেজ পাঠান
                      </a>
                      
                      <p className="relative z-10 text-white/70 text-[10px] mt-4 font-medium">২৪/৭ কাস্টমার সাপোর্ট</p>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. SERVICE INFO BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {icon: Tag, color: 'text-pink-600', bg: 'bg-pink-50', title: 'সেরা দাম', desc: 'প্রতিদিন সাশ্রয়ী মূল্য'},
                {icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', title: '১০০% অরিজিনাল', desc: 'জেনুইন পণ্যের নিশ্চয়তা'},
                {icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', title: 'নিরাপদ পেমেন্ট', desc: 'ক্যাশ অন ডেলিভারি সুবিধা'},
                {icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50', title: 'দ্রুত ডেলিভারি', desc: 'সমগ্র বাংলাদেশে'},
              ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                      <div className={`${item.bg} p-3.5 rounded-2xl ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <item.icon size={22} />
                      </div>
                      <div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                          <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. MIDDLE BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 hidden md:block">
          <div className="relative rounded-[2rem] overflow-hidden h-[160px] md:h-[260px] shadow-lg group cursor-pointer">
             <img 
               src={middleBanner.image} 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
               alt="Sale Banner" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/50 to-transparent flex items-center px-8 md:px-20">
                 <div className="text-white transform group-hover:translate-x-2 transition-transform duration-500">
                     <div className="bg-yellow-400 text-purple-900 inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 shadow-md">{middleBanner.badge}</div>
                     <h2 className="text-3xl md:text-6xl font-black mb-3 italic tracking-tight">{middleBanner.title}</h2>
                     <p className="text-sm md:text-lg text-gray-200 mb-6 font-medium max-w-md">{middleBanner.description}</p>
                     <button onClick={() => navigate('/category/all')} className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-purple-900/20">
                         {middleBanner.btnText}
                     </button>
                 </div>
             </div>
          </div>
      </div>

      {/* 4. CATEGORIES (Direct Images) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
         <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <LayoutDashboard className="text-primary" size={24} /> জনপ্রিয় ক্যাটাগরি
         </h2>
         <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categoriesList.map((cat, idx) => {
               const FallbackIcon = categoryIconsFallback[cat] || Tag;
               return (
               <Link to={`/category/${cat}`} key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center transition-transform duration-300 transform group-hover:scale-110">
                      {!imgError[cat] ? (
                          <img 
                            src={categoryIcons3D[cat]} 
                            alt={cat}
                            className="w-full h-full object-contain drop-shadow-md z-10"
                            onError={() => handleImageError(cat)}
                          />
                      ) : (
                          <FallbackIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-600 group-hover:text-primary transition-colors z-10" />
                      )}
                  </div>
                  <span className="text-[11px] md:text-sm font-bold text-gray-700 text-center leading-tight group-hover:text-primary transition-colors line-clamp-2">
                     {cat}
                  </span>
               </Link>
            )})}
         </div>
      </div>

      {/* 5. FLASH SALE SECTION (Updated Vibrant Design) */}
      <section className="my-10 py-12 relative overflow-hidden bg-gradient-to-r from-rose-600 via-red-500 to-orange-500">
         {/* Background Elements */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
         <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-300 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
         <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-40"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-b border-white/20 pb-6">
                <div className="flex items-center gap-4 text-white">
                   <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/30">
                        <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-bounce" />
                   </div>
                   <div>
                       <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter drop-shadow-lg leading-none mb-1">Flash <span className="text-yellow-300">Sale</span></h2>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                          <p className="text-white/90 text-sm font-bold tracking-[0.2em] uppercase">Limited Time Offer</p>
                       </div>
                   </div>
                </div>
                
                {/* Timer Pill */}
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
                   <Timer className="text-white w-5 h-5" />
                   <div className="text-white font-mono font-bold text-lg flex gap-1">
                      <span>{timeLeft.hours.toString().padStart(2, '0')}</span><span className="opacity-50">:</span>
                      <span>{timeLeft.minutes.toString().padStart(2, '0')}</span><span className="opacity-50">:</span>
                      <span className="text-yellow-300">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                   </div>
                </div>

                <button onClick={() => navigate('/category/all')} className="hidden md:flex bg-white text-rose-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-100 hover:scale-105 transition shadow-xl shadow-black/10 items-center gap-2">
                    সকল ডিল দেখুন <ArrowRight size={16} />
                </button>
            </div>

            {/* Grid of 4 Items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 4).map((product) => {
                    const soldPercent = 75 + Math.floor(Math.random() * 20); // Random high sold percent for demo
                    return (
                    <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-red-900/20 group cursor-pointer hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border-4 border-transparent hover:border-white/50 relative" onClick={() => navigate(`/product/${product.id}`)}>
                        
                        {/* Discount Sticker */}
                        <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 font-black text-xs px-3 py-1.5 rounded-bl-2xl z-20 shadow-sm">
                             -25%
                        </div>

                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50 p-4 overflow-hidden">
                            <img 
                                src={product.image} 
                                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                                alt={product.name}
                            />
                        </div>
                        
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-grow relative bg-white">
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 h-10 group-hover:text-rose-600 transition-colors">{product.name}</h3>
                            
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-xl font-black text-rose-600">৳{product.price}</span>
                                <span className="text-xs text-gray-400 line-through mb-1 font-bold">৳{Math.round(product.price * 1.25)}</span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                                    <span className="text-orange-500">Sold: {soldPercent}%</span>
                                    <span>Available: {100 - soldPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden border border-gray-100">
                                    <div className="bg-gradient-to-r from-orange-400 to-rose-600 h-full rounded-full shadow-sm" style={{ width: `${soldPercent}%` }}></div>
                                </div>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDirectOrder(product); }}
                                    className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg group-hover:shadow-rose-500/30"
                                >
                                    <ShoppingBag size={14} /> Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
            
            <div className="mt-8 text-center md:hidden">
                <button onClick={() => navigate('/category/all')} className="inline-flex bg-white/20 backdrop-blur-sm border border-white/40 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-white hover:text-rose-600 transition shadow-lg items-center gap-2">
                    View All Deals <ArrowRight size={16} />
                </button>
            </div>
         </div>
      </section>

      {/* 6. JUST FOR YOU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-primary"><Sparkles size={24} fill="currentColor" /></span> আপনার জন্য সেরা
          </h2>
          <Link to="/category/all" className="text-sm font-bold text-primary hover:underline">আরও দেখুন</Link>
        </div>
        
        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
           </div>
        )}
        
        <div className="mt-12 text-center">
             <button onClick={() => navigate('/category/all')} className="bg-white border-2 border-gray-200 text-gray-700 px-12 py-3.5 rounded-full font-bold hover:border-primary hover:text-primary transition shadow-sm text-sm uppercase tracking-wide hover:shadow-lg">
                 আরো লোড করুন
             </button>
        </div>
      </section>

    </div>
  );
};

export default Home;