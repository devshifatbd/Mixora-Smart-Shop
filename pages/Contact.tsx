import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">যোগাযোগ করুন</h1>
          <p className="text-gray-500">যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <Phone className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">ফোন নাম্বার</h3>
                        <p className="text-gray-600 mt-1">01711-728660</p>
                        <p className="text-xs text-gray-400 mt-1">সকাল ১০টা - রাত ৮টা</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">ইমেইল</h3>
                        <p className="text-gray-600 mt-1">support@mixorasmartshop.com</p>
                        <p className="text-gray-600 mt-1">info@mixorasmartshop.com</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">অফিস ঠিকানা</h3>
                        <p className="text-gray-600 mt-1">
                            লেভেল ৪, উত্তরা সেক্টর ৭,<br/>
                            ঢাকা - ১২৩০, বাংলাদেশ
                        </p>
                    </div>
                </div>
            </div>

            {/* Message Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">মেসেজ পাঠান</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">আপনার নাম</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary" placeholder="নাম লিখুন" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">ইমেইল / ফোন</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary" placeholder="যোগাযোগের তথ্য" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">মেসেজ</label>
                        <textarea rows={4} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary" placeholder="আপনার বার্তা লিখুন..."></textarea>
                    </div>
                    <button type="button" className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-[#b0936a] transition flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" /> মেসেজ পাঠান
                    </button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;