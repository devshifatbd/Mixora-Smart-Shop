import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Mail, Lock, ArrowRight, Fingerprint } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLoginSuccess = async (userEmail: string | null) => {
    onClose();
    if (userEmail === 'mixorasmartshop@gmail.com') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(userCredential.user.email);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      } else {
          setError('লগইন করতে সমস্যা হয়েছে।');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user.email);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError('গুগল লগইন সম্পন্ন হয়নি।');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      ></div>

      {/* Unique Compact Card */}
      <div className="relative w-full max-w-[360px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-fade-in-up transform transition-all duration-500 scale-100 ring-4 ring-white/20">
         
         {/* Close Button */}
         <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors"
         >
            <X size={18} />
         </button>

         {/* Header Design */}
         <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-gray-800 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-gray-300 transform rotate-3 mb-4 group hover:rotate-6 transition-transform duration-300">
                 <Fingerprint className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">হ্যালো!</h2>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">একাউন্টে প্রবেশ করুন</p>
         </div>

         {/* Form Section */}
         <div className="px-8 pb-8">
            {error && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-xl mb-4 flex items-center gap-2 border border-red-100 animate-pulse">
                    <AlertCircle size={14} /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-1 flex items-center transition-colors focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-sm">
                    <div className="p-3 bg-white rounded-xl text-gray-400 shadow-sm">
                        <Mail size={16} />
                    </div>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="আপনার ইমেইল"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700 px-3 placeholder:font-normal placeholder:text-gray-400"
                    />
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-1 flex items-center transition-colors focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-sm">
                    <div className="p-3 bg-white rounded-xl text-gray-400 shadow-sm">
                        <Lock size={16} />
                    </div>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700 px-3 placeholder:font-normal placeholder:text-gray-400"
                    />
                </div>

                <div className="text-right">
                    <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors">পাসওয়ার্ড ভুলে গেছেন?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-gray-300 hover:bg-black hover:scale-[1.02] transition-all flex justify-center items-center gap-2 group"
                >
                    {loading ? 'অপেক্ষা করুন...' : <>লগইন <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </form>

            <div className="relative py-5">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300">
                    <span className="bg-white px-2">Or continue with</span>
                </div>
            </div>

            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-2xl font-bold text-xs hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2 group"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="Google" />
                Google Login
            </button>
            
            <p className="text-center mt-6 text-[10px] text-gray-400 font-medium">
                নতুন ব্যবহারকারী? <a href="#" className="text-primary font-bold hover:underline">রেজিস্টার করুন</a>
            </p>
         </div>
      </div>
    </div>
  );
};

export default LoginModal;