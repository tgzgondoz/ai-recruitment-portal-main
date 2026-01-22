import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt, 
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const ADMIN_EMAIL = "masogashie@gmail.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        toast.success(`Welcome back!`);
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.error?.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-200">
              D
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-gray-900 leading-none">Dimensions</h1>
              <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">RecruitAI Platform</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Secure Login</h2>
          <p className="text-gray-500 font-medium">Access your recruitment dashboard</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <FaSignInAlt />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
            <p className="text-sm font-bold text-gray-500">
              New candidate?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
                Create Account
              </Link>
            </p>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-100">
              <FaInfoCircle className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium uppercase tracking-tight">
                Recruiters and Admins should use credentials provided by the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;