import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, UserCircle2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = async (userEmail: string | null) => {
    // Check if the email matches the admin email
    if (userEmail === 'mixorasmartshop@gmail.com') {
      navigate('/admin/dashboard');
    } else {
      // Regular user login - redirect to home
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
      handleAuthError(err);
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
      handleAuthError(err);
    }
    setLoading(false);
  };

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      setError('অ্যাকাউন্ট পাওয়া যায়নি বা পাসওয়ার্ড ভুল।');
    } else if (err.code === 'auth/wrong-password') {
      setError('পাসওয়ার্ড ভুল হয়েছে।');
    } else if (err.code === 'auth/popup-closed-by-user') {
      setError('লগইন পপ-আপ বন্ধ করা হয়েছে।');
    } else {
      setError('লগইন করতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <UserCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">স্বাগতম!</h2>
          <p className="text-sm text-gray-500 mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল বা ফোন</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="আপনার ইমেইল লিখুন"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="********"
            />
            <div className="text-right mt-1">
               <a href="#" className="text-xs text-gray-500 hover:text-primary">পাসওয়ার্ড ভুলে গেছেন?</a>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded font-bold hover:bg-orange-600 transition disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
            <span className="border-b w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-gray-500 uppercase">অথবা</span>
            <span className="border-b w-1/5 lg:w-1/4"></span>
        </div>

        <div className="mt-4">
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded font-medium hover:bg-gray-50 transition flex items-center justify-center shadow-sm"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
                Google দিয়ে লগইন করুন
            </button>
        </div>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
               কোনো অ্যাকাউন্ট নেই? <Link to="/" className="text-primary hover:underline">সাইন আপ করুন</Link>
            </p>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
                হোম পেজে ফিরে যান
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;