import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Loader2, AlertCircle, Filter } from 'lucide-react';
import { categoriesList } from '../data';

interface CategoryPageProps {
  addToCart: (product: Product) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ addToCart }) => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, "products");
        let q;

        // Fetch based on category if present and not 'all', otherwise fetch all for search/shop
        if (categoryName && categoryName !== 'all') {
            q = query(productsRef, where("category", "==", categoryName));
        } else {
            q = query(productsRef);
        }

        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));

        setAllProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categoryName]);

  // Apply Client-Side Filters (Search, Price, Stock)
  useEffect(() => {
    let result = [...allProducts];

    // 1. Filter by Search Query
    if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(queryLower) || 
            p.description.toLowerCase().includes(queryLower) ||
            p.category.toLowerCase().includes(queryLower)
        );
    }

    // 2. Filter by Price
    if (priceRange.min) {
        result = result.filter(p => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
        result = result.filter(p => p.price <= Number(priceRange.max));
    }

    // 3. Filter by Stock
    if (inStockOnly) {
        result = result.filter(p => p.stock === true);
    }

    setFilteredProducts(result);
  }, [allProducts, searchQuery, priceRange, inStockOnly]);

  const clearFilters = () => {
      setPriceRange({ min: '', max: '' });
      setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#F1F2F4] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
           <div>
               <h1 className="text-2xl font-bold text-gray-800">
                 {searchQuery ? `অনুসন্ধান: "${searchQuery}"` : (categoryName === 'all' || !categoryName ? 'সকল পণ্য' : categoryName)}
               </h1>
               <p className="text-sm text-gray-500 mt-1">
                 {filteredProducts.length} টি পণ্য পাওয়া গেছে
               </p>
           </div>
           
           {/* Mobile Filter Toggle */}
           <button 
             className="md:hidden bg-white border border-gray-300 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
             onClick={() => setShowMobileFilters(!showMobileFilters)}
           >
             <Filter className="h-4 w-4" /> ফিল্টার
           </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Filters */}
            <div className={`
                md:w-64 w-full flex-shrink-0 space-y-6 
                ${showMobileFilters ? 'block' : 'hidden md:block'}
            `}>
                <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Filter className="h-4 w-4" /> ফিল্টার অপশন
                        </h3>
                        {(priceRange.min || priceRange.max || inStockOnly) && (
                            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">রিসেট</button>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700">দাম (টাকা)</h4>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-secondary"
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-secondary"
                            />
                        </div>
                    </div>

                    {/* Stock Filter */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700">স্টক</h4>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                                className="rounded text-secondary focus:ring-secondary h-4 w-4 border-gray-300" 
                            />
                            <span className="text-sm text-gray-600">শুধুমাত্র স্টকে আছে</span>
                        </label>
                    </div>

                    {/* Categories List (Visual Helper) */}
                    {!categoryName || categoryName === 'all' ? (
                        <div>
                             <h4 className="text-sm font-semibold mb-3 text-gray-700">ক্যাটাগরি</h4>
                             <ul className="space-y-2 text-sm text-gray-600 max-h-60 overflow-y-auto">
                                 {categoriesList.map((cat, i) => (
                                     <li key={i}><a href={`#/category/${cat}`} className="hover:text-secondary block py-1 border-b border-dashed border-gray-100">{cat}</a></li>
                                 ))}
                             </ul>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-md">
                    <Loader2 className="animate-spin h-10 w-10 text-secondary" />
                </div>
                ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} addToCart={addToCart} />
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center bg-white p-12 rounded-md shadow-sm text-center h-64 border border-gray-100">
                    <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">দুঃখিত!</h3>
                    <p className="text-gray-500">আপনার ফিল্টার বা সার্চ অনুযায়ী কোনো পণ্য পাওয়া যায়নি।</p>
                    <button onClick={clearFilters} className="mt-4 text-secondary font-bold hover:underline">ফিল্টার রিসেট করুন</button>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;