import React, { useState } from 'react';
import { Mail, Lock, Zap, User, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [userType, setUserType] = useState('job_seeker'); // 'job_seeker' or 'recruiter'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const role = userType === 'job_seeker' ? 'user' : 'hrd';
      const payload = { name, email, password, role };
      
      if (role === 'hrd') {
        payload.companyName = companyName;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'fail') {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-indigo-50/50 p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-16">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Zap size={18} className="fill-white" />
              </div>
              <span className="font-semibold text-indigo-600">SkillBridge AI</span>
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
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 mb-2">Create an account</h2>
            <p className="text-sm text-slate-500 mb-8">Join SkillBridge AI to start your journey.</p>

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
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {userType === 'recruiter' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-[#4a3aff] hover:bg-[#3f31e5] disabled:bg-indigo-300 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
              >
                {loading ? 'Registering...' : `Register as ${userType === 'job_seeker' ? 'Job Seeker' : 'Recruiter'}`}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">Login</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
