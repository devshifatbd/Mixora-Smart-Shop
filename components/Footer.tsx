import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-20 mt-0 font-sans border-t-4 border-transparent relative overflow-hidden">
      {/* Colorful Gradient Border Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl w-fit shadow-lg shadow-white/5">
                <img 
                  src="https://iili.io/fX9o8KP.md.png" 
                  alt="Mixora Smart Shop" 
                  className="h-8 object-contain"
                />
            </div>
            <p className="text-sm leading-relaxed text-gray-300 font-medium">
              মিক্সোরা স্মার্ট শপ - আপনার লাইফস্টাইলের বিশ্বস্ত সঙ্গী। আমরা দিচ্ছি প্রিমিয়াম কোয়ালিটির নিশ্চয়তা এবং দ্রুততম ডেলিভারি সার্ভিস।
            </p>
            <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center hover:-translate-y-1 transition shadow-lg shadow-blue-500/30"><Facebook size={18} fill="white" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center hover:-translate-y-1 transition shadow-lg shadow-pink-500/30"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center hover:-translate-y-1 transition shadow-lg shadow-red-500/30"><Youtube size={18} fill="white" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-500 rounded-full"></span> কুইক লিংকস
            </h3>
            <ul className="space-y-3 text-sm font-medium text-gray-300">
              <li><Link to="/" className="hover:text-cyan-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">হোম পেজ</Link></li>
              <li><Link to="/category/all" className="hover:text-cyan-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">সকল কালেকশন</Link></li>
              <li><Link to="/order-tracking" className="hover:text-cyan-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">অর্ডার ট্র্যাকিং</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">যোগাযোগ করুন</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span> কাস্টমার কেয়ার
            </h3>
            <ul className="space-y-3 text-sm font-medium text-gray-300">
              <li><Link to="/login" className="hover:text-purple-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">অ্যাডমিন লগইন</Link></li>
              <li><a href="#" className="hover:text-purple-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">টার্মস এন্ড কন্ডিশন</a></li>
              <li><a href="#" className="hover:text-purple-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">রিফান্ড পলিসি</a></li>
              <li><a href="#" className="hover:text-purple-400 transition flex items-center gap-2 hover:translate-x-2 duration-300">প্রাইভেসি পলিসি</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full"></span> যোগাযোগ
             </h3>
             <ul className="space-y-5 text-sm font-medium text-gray-300">
                <li className="flex items-start gap-3 group">
                   <div className="bg-pink-500/20 p-2 rounded-lg text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition"><MapPin size={18} /></div>
                   <span>উত্তরা সেক্টর ৭, ঢাকা - ১২৩০,<br/>বাংলাদেশ</span>
                </li>
                <li className="flex items-center gap-3 group">
                   <div className="bg-green-500/20 p-2 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition"><Phone size={18} /></div>
                   <span className="font-bold text-white text-base">01711-728660</span>
                </li>
                <li className="flex items-center gap-3 group">
                   <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition"><Mail size={18} /></div>
                   <span>support@mixora.com</span>
                </li>
             </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8 mt-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} <span className="font-bold text-white">Mixora Smart Shop</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-4 py-2 rounded-full">
                  <span>Made with</span>
                  <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
                  <span>by</span>
                  <span className="font-bold text-white">GrowEasy Tech</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;