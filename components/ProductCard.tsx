import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

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
    navigate('/cart');
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full group"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white p-2">
        <img 
          src={product.image} 
          alt={product.name} 
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-secondary text-white text-[11px] font-bold px-2 py-1 rounded-full z-10">
            {discountPercentage}% ছাড়
          </div>
        )}
        
        {!product.stock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
             <span className="bg-red-500 text-white text-xs px-3 py-1 font-bold rounded">স্টক আউট</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 text-center flex-grow flex flex-col">
        <h3 className="text-[15px] font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
          {product.name}
        </h3>
        
        <div className="mt-auto">
           {/* Price */}
           <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-lg font-bold text-primary">৳ {product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice}</span>
              )}
           </div>

           {/* Buttons */}
           <div className="space-y-2">
             <button 
               onClick={handleAddToCart}
               disabled={!product.stock}
               className="w-full bg-primary text-white text-xs font-bold py-2 rounded transition-colors hover:bg-green-700 flex items-center justify-center gap-1"
             >
               Add to cart
             </button>
             <button 
               onClick={handleOrderNow}
               disabled={!product.stock}
               className="w-full bg-secondary text-white text-xs font-bold py-2 rounded transition-colors hover:bg-[#d68b00] flex items-center justify-center gap-1"
             >
               Buy Now
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;