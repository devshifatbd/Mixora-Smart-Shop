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
import { AlertCircle, UserCircle2, X, Mail, Lock, LogIn } from 'lucide-react';

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in-up transform transition-all">
         
         {/* Decoration Header */}
         <div className="h-32 bg-gradient-to-br from-primary via-gray-900 to-black relative">
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm">
                <X size={20} />
            </button>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="bg-white p-3 rounded-full shadow-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <UserCircle2 className="h-12 w-12 text-primary" />
                    </div>
                </div>
            </div>
         </div>

         <div className="pt-12 pb-8 px-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-800">স্বাগতম!</h2>
                <p className="text-sm text-gray-500 font-medium">অ্যাকাউন্টে প্রবেশ করতে লগইন করুন</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2 animate-pulse">
                    <AlertCircle size={16} /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors h-5 w-5" />
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="আপনার ইমেইল"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-bold text-gray-700 transition-all"
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors h-5 w-5" />
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-bold text-gray-700 transition-all"
                    />
                </div>

                <div className="flex justify-end">
                    <a href="#" className="text-xs font-bold text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                >
                    {loading ? 'অপেক্ষা করুন...' : <><LogIn size={18} /> লগইন করুন</>}
                </button>
            </form>

            <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">অথবা</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Google দিয়ে চালিয়ে যান
            </button>
         </div>
         
         <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500">
                একাউন্ট নেই? <a href="#" className="text-primary font-bold hover:underline">রেজিস্টার করুন</a>
            </p>
         </div>
      </div>
    </div>
  );
};

export default LoginModal;