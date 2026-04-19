import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'field_worker' | 'coordinator'>('field_worker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          role,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />

        <div className="text-center relative">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          </div>
          <h2 className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'Enter your credentials to access the system' : 'Create your account to join the mission'}
          </p>
        </div>

        <form className="mt-10 space-y-6 relative" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@organization.org"
                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('field_worker')}
                    className={cn(
                      "py-3 rounded-xl text-sm font-bold border transition-all",
                      role === 'field_worker' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    )}
                  >
                    Field Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('coordinator')}
                    className={cn(
                      "py-3 rounded-xl text-sm font-bold border transition-all",
                      role === 'coordinator' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    )}
                  >
                    Coordinator
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 shadow-xl shadow-gray-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center relative pt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-gray-900 font-bold transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
