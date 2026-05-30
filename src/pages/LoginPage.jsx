/* eslint-disable no-unused-vars, no-empty, no-undef */
import React, { useState } from 'react';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [userType, setUserType] = useState('job_seeker'); // 'job_seeker' or 'recruiter'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/authentications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'fail') {
        throw new Error(data.message || 'Login failed');
      }

      const role = data.data.user.role; // Use role from backend

      // Validasi kecocokan role dengan pilihan portal (Toggle Switch)
      if (userType === 'job_seeker' && role !== 'user') {
        throw new Error('Akun Anda terdaftar sebagai HRD / Recruiter. Silakan pilih portal HR / Recruiter untuk masuk.');
      }
      if (userType === 'recruiter' && role !== 'hrd') {
        throw new Error('Akun Anda terdaftar sebagai Job Seeker. Silakan pilih portal Job Seeker untuk masuk.');
      }

      // Save tokens and user info
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', data.data.user.id);
      
      // Navigate based on actual role
      if (role === 'user') {
        navigate('/'); // Redirect to landing page
      } else {
        navigate('/hrd-dashboard'); // HR/Recruiter dashboard
      }
    } catch (err) {
      setError(err.message);
      setEmail('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-indigo-50/50 p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-16">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Zap size={18} className="fill-white" />
              </div>
              <span className="font-semibold text-indigo-600">Pelet</span>
            </Link>

            <h1 className="text-4xl md:text-5xl font-medium text-slate-900 leading-[1.15] tracking-tight mb-6">
              Elevate your<br />
              <span className="text-indigo-600">career trajectory</span><br />
              with AI precision.
            </h1>
            
            <p className="text-slate-500 leading-relaxed max-w-sm">
              Connecting elite talent with world-class opportunities through sophisticated algorithmic matching.
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {/* Dummy Avatars */}
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=1" alt="User 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=2" alt="User 2" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=3" alt="User 3" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-medium text-indigo-600">+2k</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Joined by 2,000+ top industry professionals this month.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-8">Please enter your details to access your dashboard.</p>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-slate-50 rounded-xl mb-8 border border-slate-100">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  userType === 'job_seeker'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setUserType('job_seeker')}
              >
                Job Seeker
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  userType === 'recruiter'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setUserType('recruiter')}
              >
                HR / Recruiter
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                  <a href="#" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-[#4a3aff] hover:bg-[#3f31e5] disabled:bg-indigo-300 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">Create Account</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
