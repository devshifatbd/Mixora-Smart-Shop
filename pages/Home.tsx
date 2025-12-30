import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { db } from '../firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { 
  Loader2, 
  ChevronRight, 
  Shirt, 
  ShoppingBag, 
  Laptop, 
  Home as HomeIcon, 
  Heart, 
  Activity, 
  Baby, 
  Gift 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesList } from '../data';

interface HomeProps {
  addToCart: (product: Product) => void;
}

// Sub-component for individual category item to handle image errors independently
const CategoryItem: React.FC<{ cat: string; imageUrl: string }> = ({ cat, imageUrl }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback Icons if 3D image fails
  const getFallbackIcon = () => {
    if (cat.includes('পুরুষ')) return <Shirt className="w-8 h-8 text-indigo-500" />;
    if (cat.includes('নারী')) return <ShoppingBag className="w-8 h-8 text-pink-500" />;
    if (cat.includes('ইলেকট্রনিক্স')) return <Laptop className="w-8 h-8 text-blue-500" />;
    if (cat.includes('গৃহস্থালী')) return <HomeIcon className="w-8 h-8 text-orange-500" />;
    if (cat.includes('বিউটি')) return <Heart className="w-8 h-8 text-red-500" />;
    if (cat.includes('খেলাধুলা')) return <Activity className="w-8 h-8 text-green-500" />;
    if (cat.includes('কিডস')) return <Baby className="w-8 h-8 text-yellow-500" />;
    return <Gift className="w-8 h-8 text-purple-500" />;
  };

  return (
    <Link to={`/category/${cat}`} className="flex flex-col items-center cursor-pointer group">
       <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:border-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          
          {imageError ? (
             getFallbackIcon()
          ) : (
             <img 
               src={imageUrl} 
               onError={() => setImageError(true)}
               alt={cat}
               className="w-10 h-10 md:w-14 md:h-14 object-contain z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
             />
          )}
       </div>
       <span className="text-xs md:text-sm font-bold text-gray-700 text-center group-hover:text-secondary transition duration-300 px-1 leading-tight">
        {cat}
       </span>
    </Link>
  );
};

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const slides = [
    { 
      id: 1, 
      image: "https://t4.ftcdn.net/jpg/07/51/66/05/360_F_751660549_sbBTsejzwpjXlmuoCk66VTQZGO3hztjy.jpg", 
      title: "সামার ফ্যাশন ফেস্ট", 
      subtitle: "স্টাইলিশ লুক আর কমফোর্ট, সবই এখন হাতের মুঠোয়।",
      buttonText: "কালেকশন দেখুন",
      overlayClass: "bg-gradient-to-r from-orange-500/80 to-transparent",
      textClass: "text-white",
      btnClass: "bg-white text-orange-600 hover:bg-orange-100"
    },
    { 
      id: 2, 
      image: "https://freedesignfile.com/upload/2020/07/Online-Shopping-Banner-Mobile-App-Vector.jpg", 
      title: "স্মার্ট শপিং উৎসব", 
      subtitle: "আপনার পছন্দের সব পণ্য এখন এক ক্লিকেই।",
      buttonText: "অর্ডার করুন",
      overlayClass: "bg-gradient-to-r from-blue-900/70 to-transparent",
      textClass: "text-white",
      btnClass: "bg-[#FFD700] text-blue-900 hover:bg-yellow-400"
    },
    { 
      id: 3, 
      image: "https://cdn.vectorstock.com/i/500p/40/25/smartphone-shopping-app-vector-33184025.jpg", 
      title: "গ্যাজেট ধামাকা", 
      subtitle: "লেটেস্ট টেকনোলজি, অবিশ্বাস্য দামে।",
      buttonText: "অফার লুফে নিন",
      overlayClass: "bg-gradient-to-r from-emerald-900/80 to-transparent",
      textClass: "text-white",
      btnClass: "bg-emerald-500 text-white hover:bg-emerald-600"
    },
  ];

  // Reliable Microsoft 3D Fluent Emoji URLs
  const categoryImages: Record<string, string> = {
    'পুরুষদের ফ্যাশন': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/T-shirt.png',
    'নারীদের ফ্যাশন': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Dress.png',
    'ইলেকট্রনিক্স ও গ্যাজেট': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png',
    'গৃহস্থালী ও লিভিং': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Couch%20and%20lamp.png',
    'বিউটি ও পার্সোনাল কেয়ার': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Lipstick.png',
    'খেলাধুলা ও ফিটনেস': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Soccer%20ball.png',
    'কিডস ও টয়েজ': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Teddy%20bear.png',
    'গিফট ও স্টেশনারি': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wrapped%20gift.png'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productSnapshot = await getDocs(query(collection(db, "products"), limit(20)));
        const productList = productSnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
        } as Product));
        setProducts(productList);
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

  return (
    <div className="min-h-screen bg-[#F1F2F4] font-sans">
      
      {/* 1. Hero Section (Expanded Slider + Right Banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6">
         <div className="grid grid-cols-12 gap-4 h-auto md:h-[400px]">
            
            {/* Main Slider (Expanded to 9 cols) - Added min-h-[200px] for mobile */}
            <div className="col-span-12 md:col-span-9 relative rounded-2xl overflow-hidden shadow-sm group min-h-[220px]">
               {slides.map((slide, index) => (
                  <div 
                     key={slide.id}
                     className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                     <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition duration-1000" />
                     {/* Dynamic Creative Overlay */}
                     <div className={`absolute inset-0 ${slide.overlayClass} flex items-center`}>
                        <div className={`px-6 md:px-16 max-w-lg ${slide.textClass} animate-fade-in-up`}>
                           <h2 className="text-2xl md:text-5xl font-extrabold mb-2 md:mb-3 font-sans leading-tight drop-shadow-md">
                             {slide.title}
                           </h2>
                           <p className="text-sm md:text-xl font-medium mb-4 md:mb-8 opacity-95 drop-shadow-sm line-clamp-2 md:line-clamp-none">
                             {slide.subtitle}
                           </p>
                           <button className={`${slide.btnClass} px-6 py-2 md:px-8 md:py-3 rounded-full font-bold transition shadow-lg text-xs md:text-sm uppercase tracking-wide transform hover:-translate-y-1 hover:shadow-xl duration-300`}>
                              {slide.buttonText}
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
               
               {/* Slider Controls */}
               <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                 {slides.map((_, idx) => (
                   <button 
                     key={idx}
                     className={`h-2 md:h-2.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/40 w-2 md:w-2.5 hover:bg-white/60'}`}
                     onClick={() => setCurrentSlide(idx)}
                  />
                 ))}
               </div>
            </div>

            {/* Right Banners (Desktop Only - 3 cols) */}
            <div className="hidden md:flex col-span-3 flex-col gap-4 h-full">
               
               {/* Banner 1: Gadgets */}
               <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm">
                  <img 
                    src="https://www.slashgear.com/img/gallery/12-smart-gadgets-you-didnt-know-existed-upgrade/intro-1712278582.jpg" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                    alt="Gadgets" 
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition duration-300 flex flex-col justify-end p-6">
                     <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded w-fit mb-2">ট্রেন্ডিং</span>
                     <h3 className="font-bold text-xl text-white leading-none">ফিউচার টেক</h3>
                     <p className="text-gray-200 text-xs mt-1">আপগ্রেড ইয়োর লাইফ</p>
                  </div>
               </div>

               {/* Banner 2: Beauty */}
               <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm">
                  <img 
                    src="https://st.depositphotos.com/1684571/1468/i/450/depositphotos_14680941-stock-photo-woman-receiving-facial-mask-at.jpg" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                    alt="Beauty" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6">
                     <span className="text-[10px] font-bold bg-pink-500 text-white px-2 py-0.5 rounded w-fit mb-2">স্পেশাল</span>
                     <h3 className="font-bold text-xl text-white leading-none">গ্লোয়িং স্কিন</h3>
                     <p className="text-gray-200 text-xs mt-1">ন্যাচারাল বিউটি কেয়ার</p>
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* 2. Shop by Category (3D Icons & Creative Design) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
         <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 justify-center md:justify-start">
               <span className="text-3xl">📦</span> জনপ্রিয় ক্যাটাগরি
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
              {categoriesList.map((cat, idx) => (
                <CategoryItem 
                  key={idx} 
                  cat={cat} 
                  imageUrl={categoryImages[cat] || 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Cardboard%20box.png'} 
                />
              ))}
            </div>
         </div>
      </div>

      {/* 3. Flash Sale / Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-bold text-gray-800">ফ্ল্যাশ ডিল</h2>
               <div className="hidden md:flex items-center gap-2 text-white text-xs font-bold">
                  <span className="bg-primary px-2 py-1 rounded-md shadow-sm">০০</span> :
                  <span className="bg-primary px-2 py-1 rounded-md shadow-sm">১২</span> :
                  <span className="bg-primary px-2 py-1 rounded-md shadow-sm">৪৫</span>
               </div>
            </div>
            <Link to="/category/all" className="text-secondary text-sm font-bold flex items-center hover:underline">সব দেখুন <ChevronRight className="h-4 w-4" /></Link>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {products.slice(0, 5).map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
             ))}
         </div>
      </div>

      {/* 4. Main Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <h2 className="text-xl font-bold text-gray-800">আপনার জন্য সেরা</h2>
          <div className="flex gap-4">
             <button className="text-secondary font-bold border-b-2 border-secondary pb-2 text-sm">সব</button>
             <button className="text-gray-500 hover:text-secondary font-medium text-sm pb-2">নতুন</button>
             <button className="text-gray-500 hover:text-secondary font-medium text-sm pb-2">বেস্ট সেলিং</button>
          </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center py-20 bg-white rounded-lg"><Loader2 className="animate-spin h-10 w-10 text-secondary" /></div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
           </div>
        )}
        <div className="text-center mt-8">
           <Link to="/category/all" className="inline-block border-2 border-secondary text-secondary px-10 py-2.5 rounded-full font-bold hover:bg-secondary hover:text-white transition text-sm uppercase tracking-wider">আরো দেখুন</Link>
        </div>
      </div>

    </div>
  );
};

export default Home;