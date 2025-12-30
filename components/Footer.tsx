import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary pt-16 mt-12 text-white font-sans border-t-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          
          {/* Brand Info */}
          <div>
            <div className="bg-white p-2 rounded mb-6 w-fit">
                <img 
                  src="https://iili.io/fX9o8KP.md.png" 
                  alt="Mixora Smart Shop" 
                  className="h-10 object-contain"
                />
            </div>
            <p className="text-sm leading-7 mb-6 text-gray-400">
              মিক্সোরা স্মার্ট শপ - ভেজাল মুক্ত, খাঁটি পণ্যের নিশ্চয়তা। আমরা দিচ্ছি অর্গানিক ফুড, গ্যাজেট এবং লাইফস্টাইল পণ্যের সেরা কালেকশন। সুস্থ থাকুন, মিক্সোরার সাথে থাকুন।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-secondary mb-6 relative inline-block">
              প্রয়োজনীয় লিংক
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-white/20 rounded"></span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-secondary transition flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> হোম</Link></li>
              <li><Link to="/category/all" className="hover:text-secondary transition flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> সকল পণ্য</Link></li>
              <li><Link to="/order-tracking" className="hover:text-secondary transition flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> অর্ডার ট্র্যাকিং</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="text-lg font-bold text-secondary mb-6 relative inline-block">
              যোগাযোগ
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-white/20 rounded"></span>
            </h3>
             <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-4">
                   <div className="bg-white/10 p-2 rounded-full text-secondary"><MapPin className="h-5 w-5" /></div>
                   <span className="mt-1">ঢাকা, বাংলাদেশ</span>
                </li>
                <li className="flex items-center gap-4">
                   <div className="bg-white/10 p-2 rounded-full text-secondary"><Phone className="h-5 w-5" /></div>
                   <span className="mt-1 font-bold">01711-728660</span>
                </li>
                <li className="flex items-center gap-4">
                   <div className="bg-white/10 p-2 rounded-full text-secondary"><Mail className="h-5 w-5" /></div>
                   <span className="mt-1">info@mixorasmartshop.com</span>
                </li>
             </ul>
          </div>

        </div>

        <div className="border-t border-white/10 py-6">
           <div className="flex flex-col items-center gap-2 text-gray-400">
              <p className="text-sm text-center">
                &copy; {new Date().getFullYear()} <span className="font-bold text-secondary">মিক্সোরা স্মার্ট শপ</span>। সর্বস্বত্ব সংরক্ষিত
              </p>
              <p className="text-sm text-center">
                Developed by - <span className="font-bold text-secondary">GrowEasy</span>
              </p>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;