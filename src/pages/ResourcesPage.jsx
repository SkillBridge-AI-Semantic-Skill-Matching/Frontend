/* eslint-disable no-unused-vars, no-empty, no-undef */
import React, { useState } from 'react';
import { Bell, User, CloudUpload, Sparkles, Lock, CheckCircle2, Circle, Zap, Cpu, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourcesPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const userRole = localStorage.getItem('userRole');

  // Simulate CV Analysis process
  const handleAnalyzeClick = () => {
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

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
            <Link to="/" className="hover:text-indigo-600 transition-colors">Find Jobs</Link>
            <Link to="/resources" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">AI CV Analyzer</Link>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Unlock your<br />
            <span className="text-indigo-600">career path</span> with<br />
            AI precision.
          </h1>
          <p className="text-lg text-slate-600 max-w-md leading-relaxed">
            Upload your CV and let our SkillBridge engine map your expertise to global opportunities in seconds. No more manual data entry.
          </p>
          
          <div className="flex gap-4">
            <div className="bg-indigo-50/50 rounded-xl p-4 flex-1 border border-indigo-100">
              <div className="text-indigo-600 font-bold text-xl mb-1">98%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Match Accuracy</div>
            </div>
            <div className="bg-indigo-50/50 rounded-xl p-4 flex-1 border border-indigo-100">
              <div className="text-indigo-600 font-bold text-xl mb-1">&lt; 5s</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analysis Speed</div>
            </div>
          </div>
        </div>
        
        {/* Upload Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Upload your CV (PDF)</h3>
          <p className="text-sm text-slate-500 mb-6">Drag and drop your professional resume</p>
          
          <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors p-10 text-center cursor-pointer mb-6 group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <CloudUpload size={24} className="text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-400">Maximum file size: 10MB</p>
          </div>
          
          <button 
            onClick={handleAnalyzeClick}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mb-4"
          >
            Analyze CV <Sparkles size={18} />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
            <Lock size={12} />
            <span>ENCRYPTED & SECURE</span>
          </div>
        </div>
      </section>

      {/* Analysis Process Section (Only show if uploading) */}
      {isUploading && (
        <section className="py-12 bg-slate-100/50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-8">
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Cpu size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Analyzing your CV...</h2>
              <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto">
                Extracting skills, experience, and matching your profile to 50,000+ active roles.
              </p>
              
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                     {progress < 40 ? 'Parsing PDF...' : progress < 80 ? 'Scanning Keywords...' : 'Matching Roles...'}
                   </span>
                   <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 md:px-12">
                <div className="flex flex-col items-center gap-2">
                  {progress >= 30 ? <CheckCircle2 className="text-indigo-600" size={24} /> : <Circle className="text-slate-300" size={24} />}
                  <span className="text-xs font-bold text-slate-700">PDF Parsing</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 mx-4"></div>
                <div className="flex flex-col items-center gap-2">
                  {progress >= 70 ? <CheckCircle2 className="text-indigo-600" size={24} /> : <Circle className="text-slate-300" size={24} />}
                  <span className="text-xs font-bold text-slate-700">Skill Mapping</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 mx-4"></div>
                <div className="flex flex-col items-center gap-2">
                  {progress >= 100 ? <CheckCircle2 className="text-indigo-600" size={24} /> : <Circle className="text-slate-300" size={24} />}
                  <span className="text-xs font-bold text-slate-400">Market Match</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Section */}
      <section className="py-24 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        {/* Abstract Image */}
        <div className="rounded-3xl overflow-hidden bg-slate-900 aspect-video relative shadow-2xl">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Data code" className="w-full h-full object-cover opacity-50" />
          <div className="absolute bottom-8 left-8 text-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Market Insight</div>
            <div className="text-xl font-bold">Data-Driven Career Design</div>
          </div>
        </div>

        {/* Text Content */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-6">
            <Zap size={12} className="fill-indigo-700" /> AI ENGINE V4.0
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Beyond a simple keyword match.
          </h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            SkillBridge AI understands the semantic relationship between your experiences. It doesn't just look for "Project Manager"; it identifies leadership, stakeholder management, and technical delivery capabilities.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Instant gap analysis for your dream roles.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp size={14} className="text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Personalized course recommendations to level up.</p>
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
          
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              © 2026 SkillBridge AI. All rights reserved.
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResourcesPage;
