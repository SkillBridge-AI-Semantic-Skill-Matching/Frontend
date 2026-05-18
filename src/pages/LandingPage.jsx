import React from 'react';
import { Bell, Search, User, ChevronRight, FileText, Cpu, Sparkles, EyeOff, TrendingUp, Crosshair, Users, Clock, Globe, Share2, CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
              <Zap size={14} className="fill-white" />
            </div>
            <span className="text-lg font-bold text-indigo-600 tracking-tight">SkillBridge AI</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Find Jobs</Link>
            <Link to="/resources" className="hover:text-indigo-600 transition-colors">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userRole ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-sm font-medium text-white bg-indigo-600 px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={() => { localStorage.removeItem('userRole'); window.location.reload(); }}
                className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/register" className="text-sm font-medium text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors">Register</Link>
              <Link to="/login" className="text-sm font-medium text-white bg-indigo-600 px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Login</Link>
            </>
          )}
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <button className="text-slate-500 hover:text-slate-800 transition-colors">
            <Bell size={20} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
            <User size={16} className="text-slate-500" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Find Jobs That<br />Truly Match<br />Your Skills with<br />AI
          </h1>
          <p className="text-lg text-slate-600 max-w-md leading-relaxed">
            Stop scrolling through irrelevant listings. Our neural matching engine analyzes your deep technical expertise to bridge the gap between your talent and your next career milestone.
          </p>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">
              Upload CV
            </button>
            <button className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all">
              Try Demo
            </button>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center overflow-hidden">
                   <User size={16} className="text-white"/>
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-500 font-medium">Trusted by 10,000+ top-tier specialists</span>
          </div>
        </div>
        
        {/* Hero Graphic */}
        <div className="relative rounded-2xl bg-white p-4 shadow-2xl border border-slate-100">
          <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg border border-slate-100 z-20">
            <Sparkles className="text-indigo-500" size={24} />
          </div>
          <div className="aspect-[4/3] rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center">
            {/* Abstract AI CV graphic */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900 z-0"></div>
            <div className="z-10 w-3/4 h-3/4 border border-indigo-500/30 rounded-lg p-6 flex flex-col relative bg-slate-900/50 backdrop-blur-sm shadow-2xl">
              <div className="w-12 h-12 bg-teal-400/20 rounded mb-4 flex items-center justify-center border border-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                 <User className="text-teal-400" size={24} />
              </div>
              <div className="w-3/4 h-2 bg-indigo-500/40 rounded mb-3"></div>
              <div className="w-full h-2 bg-indigo-500/20 rounded mb-3"></div>
              <div className="w-5/6 h-2 bg-indigo-500/20 rounded mb-3"></div>
              <div className="w-full h-2 bg-indigo-500/20 rounded mb-3"></div>
              
              {/* Glowing connection lines overlay */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-teal-400/50 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>
              <div className="absolute top-1/3 left-1/4 w-px h-1/2 bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
              <div className="absolute top-1/4 right-1/4 w-px h-1/2 bg-purple-400/50 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-medium text-slate-700">Matching Skills...</span>
               <span className="text-sm font-bold text-indigo-600">99% Precision</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-[99%] rounded-full relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Our 3-step semantic alignment protocol ensures you only see opportunities that value your specific expertise.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Semantic Upload", desc: "Upload your CV or portfolio. Our AI doesn't just read keywords; it understands the context and impact of your work history." },
              { icon: Cpu, title: "Deep Analysis", desc: "We map your skills against a live database of thousands of high-intent job postings from world-class tech companies." },
              { icon: Sparkles, title: "Bridge The Gap", desc: "Receive a curated list of 'Perfect Matches.' Direct introductions and fast-tracked application statuses guaranteed." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Split */}
      <section className="py-24 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        {/* For Talent */}
        <div>
          <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">For Talent</div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10">Elevate Your Career Path</h2>
          
          <div className="space-y-8">
            {[
              { icon: EyeOff, title: "Stealth Matching", desc: "Apply with confidence. Your identity is shielded from current employers until a match is confirmed." },
              { icon: TrendingUp, title: "Salary Benchmarking", desc: "AI-driven insights on your market value based on real-time data from matching roles." },
              { icon: Crosshair, title: "Skill Gap Analysis", desc: "Personalized learning paths to help you qualify for the high-paying roles you desire." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For Recruiters */}
        <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              For Recruiters
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Hire with Precision</h2>
            
            <div className="space-y-4 mb-10">
              {[
                { icon: Users, title: "Pre-vetted Candidates", desc: "Skip the initial screening. Our AI ensures candidates meet 95% of your core requirements." },
                { icon: Clock, title: "Reduce Time-to-Hire", desc: "Average reduction of 40% in time spent from posting to first interview." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl group">
              Enter Recruiter Portal <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract background graphics */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to find your<br/>perfect career match?</h2>
            <p className="text-indigo-100 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Join thousands of tech professionals who found their dream roles using SkillBridge AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                Get Started Now
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg font-bold text-indigo-600 tracking-tight">SkillBridge AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bridging the gap between raw talent and enterprise excellence through ethical artificial intelligence and high-precision mapping.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6">Platform</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600">Career Search</a>
              <a href="#" className="hover:text-indigo-600">Skill Mapping</a>
              <a href="#" className="hover:text-indigo-600">Pricing</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6">Company</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600">About Us</a>
              <a href="#" className="hover:text-indigo-600">Ethics Board</a>
              <a href="#" className="hover:text-indigo-600">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6">Support</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600">Help Center</a>
              <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              © 2026 SkillBridge AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              <a href="#" className="hover:text-slate-600">Twitter</a>
              <a href="#" className="hover:text-slate-600">LinkedIn</a>
              <a href="#" className="hover:text-slate-600">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
