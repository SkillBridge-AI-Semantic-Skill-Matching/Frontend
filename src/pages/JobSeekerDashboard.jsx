import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, FileText, User, LogOut, 
  Search, Bell, Settings, TrendingUp, Send, Zap, 
  ChevronRight, Database, Box, GraduationCap, AlertTriangle, 
  MonitorSmartphone, MapPin, Clock, ArrowLeft, CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'user') {
      navigate('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('accessToken');
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    
    let res = await fetch(url, { ...options, headers });
    let clone = res.clone();
    let data;
    try { data = await clone.json(); } catch(e) { }

    if (res.status === 401 || (data && data.message && (data.message.toLowerCase().includes('kadaluarsa') || data.message.toLowerCase().includes('otorisasi')))) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch('/api/authentications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          const refreshData = await refreshRes.json();
          if (refreshData.status === 'success') {
            token = refreshData.data.accessToken;
            localStorage.setItem('accessToken', token);
            headers.Authorization = `Bearer ${token}`;
            res = await fetch(url, { ...options, headers });
          } else {
            handleLogout();
          }
        } catch (e) {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    }
    return res;
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [profRes, recsRes, appsRes] = await Promise.all([
        fetchWithAuth('/api/profiles/me'),
        fetchWithAuth('/api/recommendations'),
        fetchWithAuth('/api/applications/mine')
      ]);
      const profData = await profRes.json();
      const recsData = await recsRes.json();
      const appsData = await appsRes.json();

      if (profData.status === 'success') setProfile(profData.data.profile || profData.data);
      if (recsData.status === 'success') {
        const mappedMatches = (recsData.data.recommendations || []).map(r => ({
          ...r,
          id: r.job_id,
          title: r.job_title,
          description: r.job_description,
          status: r.job_status
        }));
        setMatches(mappedMatches);
      }
      if (appsData.status === 'success') setApplications(appsData.data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyJob(jobId) {
    try {
      const res = await fetchWithAuth(`/api/jobs/${jobId}/applications`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Berhasil melamar pekerjaan!');
        fetchData();
        setActiveView('applications');
      } else {
        alert('Gagal melamar: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Zap size={18} className="fill-white" />
            </div>
            <div>
              <div className="font-bold text-indigo-700 tracking-tight leading-tight">SkillBridge AI</div>
              <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Seeker Portal</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => setActiveView('matches')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${(activeView === 'matches' || activeView === 'job_detail') ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <Briefcase size={18} />
            My Matches
          </button>
          <button onClick={() => setActiveView('applications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'applications' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <FileText size={18} />
            Applications
          </button>
          <button onClick={() => setActiveView('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <User size={18} />
            Profile
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-[#f8fafc]">
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search skills, jobs, or insights..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <button className="hover:text-indigo-600 transition-colors"><Bell size={20} /></button>
              <button className="hover:text-indigo-600 transition-colors"><Settings size={20} /></button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{profile?.fullName || 'Job Seeker'}</div>
                <div className="text-xs text-slate-500">{profile?.applicantData?.bio || 'SkillBridge User'}</div>
              </div>
              <img src={profile?.avatarUrl || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            </div>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-medium text-slate-900 mb-1">Your Career Overview</h1>
            <p className="text-slate-500">AI-powered insights for your skill growth</p>
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Match Score Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Your Match Score</h3>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                    <TrendingUp size={12} /> +4% this week
                  </span>
                </div>
                <div className="text-5xl font-bold text-indigo-700 mb-6">
                  82<span className="text-2xl text-indigo-400">%</span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">Market Alignment</span>
                    <span className="text-slate-900 font-bold">High</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[82%]"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are in the top 15% of candidates with your current skill profile. Improving <span className="text-indigo-600 font-bold">SQL</span> could boost your score by 7%.
              </p>
            </div>

            {/* Middle Column Stats */}
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <Send size={16} className="rotate-45 -mt-1 ml-1" />
                </div>
                <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Applications Sent</div>
                <div className="text-3xl font-bold text-slate-900">12</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                  <TrendingUp size={16} />
                </div>
                <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Interview Rate</div>
                <div className="text-3xl font-bold text-slate-900">24%</div>
              </div>
            </div>

            {/* Skill Insights Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={18} className="text-indigo-600 fill-indigo-600" />
                <h3 className="font-bold text-slate-900">Skill Insights</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Strong Proficiencies</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-800">UI Design & Figma</span>
                        <span className="text-indigo-600 font-bold">Expert</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-[95%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-800">Prototyping</span>
                        <span className="text-indigo-600 font-bold">Advanced</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-[80%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Improving</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-800">Data Visualization</span>
                        <span className="text-purple-600 font-bold">Learning</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-purple-600 rounded-full w-[40%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recommended Jobs */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
                <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all matches <ChevronRight size={16} />
                </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Job Card 1 */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <MonitorSmartphone size={20} className="text-slate-600" />
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold text-center leading-tight">
                        94%<br/>Match
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Senior Product Designer</h3>
                    <p className="text-sm text-slate-500 mb-4">Lumina Tech • Hybrid</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Figma</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">React</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">UI/UX</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl transition-colors">
                    View Job
                  </button>
                </div>

                {/* Job Card 2 */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Box size={20} className="text-slate-600" />
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold text-center leading-tight">
                        88%<br/>Match
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Lead UX Researcher</h3>
                    <p className="text-sm text-slate-500 mb-4">Aura Systems • Remote</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">Strategy</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">User Testing</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">SQL</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl transition-colors">
                    View Job
                  </button>
                </div>
              </div>
            </div>

            {/* Skill Gap Section */}
            <div className="lg:col-span-1">
              {/* Spacer for alignment with Recommended Jobs title */}
              <div className="h-6 mb-4 hidden lg:block"></div> 
              
              <div className="bg-[#1e1b4b] rounded-3xl p-6 text-white h-full flex flex-col shadow-lg border border-indigo-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} className="text-indigo-300" />
                    <h3 className="font-bold text-lg">Skill Gap Identified</h3>
                  </div>
                  <p className="text-sm text-indigo-100/70 mb-6 leading-relaxed">
                    You're missing SQL and Docker, which are required for 64% of high-paying design engineer roles.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Database size={16} className="text-indigo-200" />
                      </div>
                      <span className="text-sm font-medium">Database Management<br/><span className="text-xs text-indigo-300 font-normal">(SQL)</span></span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Box size={16} className="text-indigo-200" />
                      </div>
                      <span className="text-sm font-medium">Containerization<br/><span className="text-xs text-indigo-300 font-normal">(Docker)</span></span>
                    </div>
                  </div>
                </div>
                
                <button className="relative z-10 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm">
                  Improve Skills <GraduationCap size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
        )}
        {activeView === 'matches' && (
          <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-medium text-slate-900 mb-2">Matched Jobs</h1>
              <p className="text-slate-500">Our AI has analyzed your profile and identified <span className="text-indigo-600 font-bold">{matches.length} opportunities</span> tailored for you.</p>
            </div>
            
            {loading ? (
              <div className="text-center py-20 text-slate-500">Memuat data...</div>
            ) : matches.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">Belum ada rekomendasi yang tersedia. Silakan unggah CV Anda di halaman utama.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matches.map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                          {job.title.charAt(0)}
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide">
                          {Math.round(job.score || 0)}% MATCH
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">{job.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                        <Briefcase size={14} /> {job.category_id || 'Tech'} • {job.location_type || 'Remote'}
                      </p>
                      <p className="text-sm text-slate-600 mb-6 line-clamp-3">
                        {job.description || 'Tidak ada deskripsi yang disediakan.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold">{job.job_type}</span>
                        <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold">{job.experience_level}</span>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedJob(job); setActiveView('job_detail'); }} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'job_detail' && selectedJob && (
          <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveView('matches')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2">
              <ArrowLeft size={16} /> Back to Matches
            </button>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-3xl uppercase">
                    {selectedJob.title.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{selectedJob.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Briefcase size={16} /> {selectedJob.category_id || 'Technology'}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={16} /> {selectedJob.location_type}</span>
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {selectedJob.job_type}</span>
                    </div>
                  </div>
                </div>
                {!applications.some(app => app.job_id === selectedJob.id) ? (
                  <button onClick={() => handleApplyJob(selectedJob.id)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                    <Send size={18} /> Apply Now
                  </button>
                ) : (
                  <button disabled className="px-8 py-3.5 bg-green-50 text-green-600 border border-green-200 font-bold rounded-xl flex items-center gap-2 opacity-80 cursor-not-allowed">
                    <CheckCircle size={18} /> Applied
                  </button>
                )}
              </div>

              <div className="h-px w-full bg-slate-100 my-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedJob.description || 'Tidak ada deskripsi lebih lanjut.'}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Job Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Experience Level</div>
                        <div className="text-sm font-medium text-slate-700 capitalize">{selectedJob.experience_level}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Status</div>
                        <div className="text-sm font-medium text-green-600 capitalize flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {selectedJob.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'applications' && (
          <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-medium text-slate-900 mb-2">Your Applications</h1>
              <p className="text-slate-500">Tracking your progress across <span className="text-indigo-600 font-bold">{applications.length} opportunities</span>.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {applications.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Lamaran</h3>
                  <p className="text-slate-500 mb-6">Anda belum melamar pekerjaan apapun.</p>
                  <button onClick={() => setActiveView('matches')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                    Cari Pekerjaan
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Job Details</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Applied Date</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-sm text-slate-900 mb-0.5">{app.title || app.job_title || 'Unknown Job'}</div>
                          <div className="text-xs text-slate-500">{app.category_id || 'Tech'}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                          {new Date(app.created_at || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => {
                            // Find the job from matches, or fetch it
                            const job = matches.find(m => m.id === app.job_id);
                            if (job) { setSelectedJob(job); setActiveView('job_detail'); }
                          }} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobSeekerDashboard;
