import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-[20px] border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full group relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[1/1] overflow-hidden bg-[#F8F9FB] m-2 rounded-[16px]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out p-4 mix-blend-multiply"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-lg shadow-rose-500/20 animate-pulse-slow">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Stock Badge */}
        {!product.stock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
             <span className="bg-gray-900 text-white text-xs px-3 py-1.5 font-bold rounded-lg shadow-xl">স্টক আউট</span>
          </div>
        )}

        {/* Favorite Button (Visual) */}
        <button className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300">
            <Heart className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3 pt-1 flex-grow flex flex-col">
        
        <h3 className="text-[13px] md:text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5em] mt-3">
          {product.name}
        </h3>
        
        <div className="mt-auto w-full">
           {/* Price */}
           <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-black text-primary">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">৳{product.originalPrice}</span>
              )}
           </div>

           {/* Buttons - DIRECT ORDER highlighted */}
           <div className="grid grid-cols-5 gap-2">
             <button 
               onClick={handleAddToCart}
               disabled={!product.stock}
               className="col-span-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-colors active:scale-95 border border-gray-200"
               title="Add to Cart"
             >
               <ShoppingCart className="w-4 h-4" />
             </button>
             <button 
               onClick={handleOrderNow}
               disabled={!product.stock}
               className="col-span-3 bg-gradient-to-r from-primary to-gray-800 text-white text-[10px] md:text-xs font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-1 active:scale-95 border-b-2 border-gray-900 active:border-b-0 active:translate-y-0.5"
             >
               <Zap className="w-3.5 h-3.5 fill-white" /> অর্ডার করুন
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;