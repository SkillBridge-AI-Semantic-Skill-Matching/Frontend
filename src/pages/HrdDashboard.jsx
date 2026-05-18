import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Plus, LogOut, Search, Bell, 
  ChevronRight, Star, Zap, BarChart, Download, Filter, MessageSquare
} from 'lucide-react';

const HrdDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, candidate_pool, job_postings, create_job, candidate_detail
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Form state for creating/editing job
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    categoryId: 'cat-tech01',
    jobType: 'full-time',
    experienceLevel: 'mid',
    locationType: 'onsite',
    status: 'open'
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'hrd') {
      navigate('/login');
      return;
    }
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  // Wrapper for fetch that handles silent token refresh
  async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('accessToken');
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    
    let res = await fetch(url, { ...options, headers });
    let clone = res.clone();
    let data;
    try { data = await clone.json(); } catch(e) { console.error('JSON Parse error', e); }

    // Check if token expired (status 401 or specific message from backend)
    if (res.status === 401 || (data && data.message && (data.message.toLowerCase().includes('kadaluarsa') || data.message.toLowerCase().includes('token') || data.message.toLowerCase().includes('otorisasi')))) {
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
            localStorage.setItem('accessToken', token); // Save fresh token
            // Retry the original request
            headers.Authorization = `Bearer ${token}`;
            res = await fetch(url, { ...options, headers });
          } else {
            handleLogout(); // Refresh failed, user must log in again
          }
        } catch (e) {
          console.error(e);
          handleLogout();
        }
      } else {
        handleLogout();
      }
    }
    return res;
  }

  async function fetchJobs() {
    setLoadingJobs(true);
    try {
      const res = await fetchWithAuth('/api/jobs/mine');
      const data = await res.json();
      if (data.status === 'success') setJobs(data.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  }

  const openCreateJob = () => {
    setEditingJob(null);
    setJobForm({
      title: '', description: '', categoryId: 'cat-tech01', 
      jobType: 'full-time', experienceLevel: 'mid', locationType: 'onsite', status: 'open'
    });
    setActiveView('create_job');
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
    const method = editingJob ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobForm)
      });
      const data = await res.json();
      
      console.log('Submit Job Response:', data); // Debugging

      if (data.status === 'success') {
        fetchJobs();
        setActiveView('job_postings');
      } else {
        alert('Gagal menyimpan lowongan: ' + data.message);
      }
    } catch (err) {
      console.error('Error submitting job:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // --- Static Data ---
  const staticCandidates = [
    { id: 1, name: "Dr. Julian Vance", role: "Ex-Google Lead • MIT PhD", score: 98.4, avatar: "https://i.pravatar.cc/150?u=1", velocity: "HYPER-SCALE", status: "OPTIMAL" },
    { id: 2, name: "Elena Rostova", role: "Senior ML Engineer • Stanford", score: 94.1, avatar: "https://i.pravatar.cc/150?u=2", velocity: "STEADY SURGE", status: "STRONG" },
    { id: 3, name: "Marcus Cheng", role: "AI Architect • Carnegie Mellon", score: 92.8, avatar: "https://i.pravatar.cc/150?u=3", velocity: "CONSISTENT", status: "MATCH" },
    { id: 4, name: "Sarah Jenkins", role: "Data Science Lead • Berkeley", score: 89.5, avatar: "https://i.pravatar.cc/150?u=4", velocity: "ESTABLISHED", status: "MATCH" }
  ];

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderSidebar = () => (
    <aside className="w-[260px] bg-white border-r border-border-ghost/20 h-screen sticky top-0 flex flex-col pt-8 pb-6 z-10">
      <div className="px-8 mb-10">
        <h1 className="text-[17px] font-bold text-text-main leading-tight">Recruiter Portal</h1>
        <p className="text-[10px] font-bold text-text-muted tracking-wider uppercase mt-1">Enterprise Tier</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeView === 'dashboard' ? 'bg-canvas-base text-brand-primary' : 'text-text-muted hover:bg-canvas-base/50'
          }`}
        >
          <LayoutDashboard size={18} className={activeView === 'dashboard' ? 'text-brand-primary' : ''} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveView('candidate_pool')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeView === 'candidate_pool' || activeView === 'candidate_detail' ? 'bg-canvas-base text-brand-primary' : 'text-text-muted hover:bg-canvas-base/50'
          }`}
        >
          <Users size={18} className={activeView === 'candidate_pool' ? 'text-brand-primary' : ''} /> Candidate Pool
        </button>
        <button 
          onClick={() => setActiveView('job_postings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
            activeView === 'job_postings' || activeView === 'create_job' ? 'bg-canvas-base text-brand-primary' : 'text-text-muted hover:bg-canvas-base/50'
          }`}
        >
          <Briefcase size={18} className={activeView === 'job_postings' ? 'text-brand-primary' : ''} /> Job Postings
        </button>
      </nav>

      <div className="px-6 space-y-4">
        <button onClick={openCreateJob} className="w-full bg-[#4f46e5] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#4338ca] transition-colors shadow-ambient">
          <Plus size={16} /> Create New Job
        </button>
        <button onClick={handleLogout} className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors">
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );

  const renderHeader = (title, subtitle) => (
    <div className="flex justify-between items-end mb-10">
      <div>
        <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-text-muted text-[15px] mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Search candidates..." 
            className="pl-9 pr-4 py-2.5 bg-white border border-border-ghost/20 rounded-full text-sm w-64 focus:outline-none focus:border-brand-primary/50"
          />
        </div>
        <button className="w-10 h-10 bg-white border border-border-ghost/20 rounded-full flex items-center justify-center text-text-main hover:bg-slate-50">
          <Bell size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-indigo-900 border border-border-ghost/20 overflow-hidden">
          <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover"/>
        </div>
      </div>
    </div>
  );

  // --- Views ---

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderHeader(
        "Talent Overview", 
        "AI-powered insights for SkillBridge AI Hiring"
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-brand-primary tracking-wider uppercase">Growth Metric</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12% vs LY</span>
          </div>
          <h3 className="text-4xl font-bold text-text-main my-2">1,284</h3>
          <p className="text-[13px] text-text-muted mb-6">Total active applicants across 12 open roles</p>
          <div className="flex h-1.5 rounded-full overflow-hidden gap-1">
            <div className="bg-brand-primary w-[70%]"></div>
            <div className="bg-brand-secondary w-[30%]"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center"><Star size={16} className="fill-current"/></div>
            <span className="text-[13px] font-bold text-text-main">Avg Match Score</span>
          </div>
          <div className="flex items-end gap-2 my-2">
            <h3 className="text-4xl font-bold text-brand-primary">84%</h3>
            <span className="text-[13px] text-text-muted mb-1 font-medium">Qualified</span>
          </div>
          <p className="text-[13px] text-text-muted mt-2 leading-relaxed">Top match clusters are in Fullstack and Data Engineering.</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-brand-secondary flex items-center justify-center"><BarChart size={16}/></div>
            <span className="text-[13px] font-bold text-text-main">Hire Velocity</span>
          </div>
          <div className="flex items-end gap-2 my-2">
            <h3 className="text-4xl font-bold text-brand-secondary">4.2d</h3>
            <span className="text-[13px] text-text-muted mb-1 font-medium">Time to interview</span>
          </div>
          <p className="text-[13px] text-text-muted mt-2 leading-relaxed">Faster than 82% of regional competitors.</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm">
            <h3 className="text-lg font-bold text-text-main mb-6">Skill Distribution</h3>
            <div className="space-y-5">
              {[
                { name: 'Machine Learning', val: '42%', w: 'w-[42%]' },
                { name: 'UI/UX Design', val: '28%', w: 'w-[28%]' },
                { name: 'Data Analytics', val: '18%', w: 'w-[18%]' },
                { name: 'Product Strategy', val: '12%', w: 'w-[12%]' }
              ].map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-[13px] font-semibold mb-2">
                    <span>{s.name}</span>
                    <span className="text-brand-primary">{s.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-canvas-base rounded-full overflow-hidden">
                    <div className={`h-full bg-brand-primary ${s.w}`}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-6">Data based on latest 500 parsed resumes via <span className="font-bold text-brand-primary">SkillBridge AI</span> Engine.</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex items-start gap-4">
            <div className="text-brand-primary mt-1"><Zap size={24}/></div>
            <div>
              <h4 className="font-bold text-[14px] mb-1">AI Strategy Tip</h4>
              <p className="text-[13px] text-text-muted leading-relaxed mb-3">Based on candidate trends, increasing your budget for ML Engineers in Berlin by 5% could double your top-tier applicant pool.</p>
              <button className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">Explore Insights →</button>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-border-ghost/20 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-ghost/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-main">Recent High-Match Candidates</h3>
              <button className="text-[13px] font-medium text-brand-primary hover:underline">View All Candidates</button>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/50 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Applied Role</th>
                  <th className="px-6 py-4">Match</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-ghost/10">
                {[
                  { name: 'Marcus Chen', sub: '2 years @ Google', role: 'Sr. AI Engineer', match: '98%', status: 'Screening', sColor: 'text-green-600' },
                  { name: 'Sarah Jenkins', sub: 'Lead @ Meta', role: 'Product Designer', match: '94%', status: 'Interviewing', sColor: 'text-blue-600' },
                  { name: 'David Miller', sub: 'Sr. Architect @ AWS', role: 'Cloud Solutions', match: '89%', status: 'Applied', sColor: 'text-orange-500' }
                ].map(c => (
                  <tr key={c.name} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveView('candidate_detail')}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?u=${c.name}`} alt="" className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <div className="font-bold text-text-main">{c.name}</div>
                        <div className="text-[11px] text-text-muted">{c.sub}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{c.role}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{c.match}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold flex items-center gap-1.5 ${c.sColor}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div> {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300"><ChevronRight size={16}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="signature-gradient rounded-[24px] p-8 text-white flex flex-col justify-center items-start shadow-ambient">
            <h3 className="text-xl font-bold mb-2">Upgrade to Pro Hiring</h3>
            <p className="text-white/80 text-sm max-w-md mb-6">Get access to candidate behavioral video analysis and deep technical vetting automation.</p>
            <button className="bg-white text-brand-primary px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCandidatePool = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">Candidate Leaderboard</h2>
          <p className="text-text-muted text-[15px] mt-1">Real-time matching intelligence for your open roles.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-ghost/20 bg-white rounded-lg text-sm font-semibold text-text-main hover:bg-slate-50"><Filter size={16}/> Filter</button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border-ghost/20 bg-white rounded-lg text-sm font-semibold text-text-main hover:bg-slate-50"><Download size={16}/> Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-border-ghost/20 shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border-ghost/20 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Candidate Name</div>
          <div className="col-span-3">Match Score</div>
          <div className="col-span-2">Growth Velocity</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-border-ghost/10">
          {staticCandidates.map((c, i) => (
            <div key={c.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-1 flex items-center gap-2">
                <span className="text-lg font-bold text-brand-primary">0{i+1}</span>
                {i === 0 && <Star size={14} className="text-yellow-500 fill-current"/>}
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <img src={c.avatar} alt="" className="w-12 h-12 rounded-full border border-border-ghost/20" />
                <div>
                  <h4 className="font-bold text-[15px] text-text-main">{c.name}</h4>
                  <p className="text-[12px] text-text-muted mt-0.5">{c.role}</p>
                </div>
              </div>
              <div className="col-span-3 pr-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xl font-bold text-text-main">{c.score}</span>
                  <span className="text-[9px] font-bold text-brand-primary tracking-wider uppercase">{c.status}</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{width: `${c.score}%`}}></div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="px-3 py-1 bg-purple-50 text-brand-secondary text-[10px] font-bold rounded-full">{c.velocity}</span>
              </div>
              <div className="col-span-2 text-right">
                <button onClick={() => setActiveView('candidate_detail')} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors shadow-sm">
                  View Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobPostings = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">Job Postings</h2>
          <p className="text-text-muted text-[15px] mt-1">Manage your active listings.</p>
        </div>
        <button onClick={openCreateJob} className="bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#4338ca] shadow-ambient">
          <Plus size={16} /> Create New Job
        </button>
      </div>

      {loadingJobs ? (
        <p className="text-text-muted">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-[24px] p-16 text-center border border-border-ghost/20">
          <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold mb-2">No active job postings</h3>
          <p className="text-text-muted text-sm mb-6">Create a new position to start matching with top talent.</p>
          <button onClick={openCreateJob} className="bg-[#4f46e5] text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm">Post a Job</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-border-ghost/20 rounded-[20px] p-6 flex justify-between items-center hover:shadow-sm transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg">{job.title}</h4>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">{job.status}</span>
                </div>
                <div className="text-[13px] text-text-muted">{job.job_type} • {job.experience_level} • {job.location_type}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  try {
                    const res = await fetchWithAuth(`/api/jobs/${job.id}`);
                    const data = await res.json();
                    if (data.status === 'success') {
                      setSelectedJob(data.data.job);
                      setActiveView('job_detail');
                    } else {
                      alert('Gagal mengambil detail lowongan');
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }} className="px-4 py-2 text-sm font-semibold text-text-main bg-canvas-base border border-border-ghost/20 rounded-lg hover:bg-slate-100">
                  View Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderJobDetail = () => {
    if (!selectedJob) return null;
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <button onClick={() => setActiveView('job_postings')} className="hover:text-text-main">Job Postings</button>
          <ChevronRight size={14} />
          <span className="font-semibold text-brand-primary">{selectedJob.title}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">{selectedJob.title}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedJob.status === 'open' ? 'bg-purple-100 text-[#6d28d9]' : 'bg-slate-200 text-slate-600'}`}>
                {selectedJob.status === 'open' ? 'ACTIVE' : 'CLOSED'}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-text-muted font-medium">
              <span className="flex items-center gap-1.5"><Briefcase size={14}/> {selectedJob.category_id || 'Tech Team'}</span>
              <span className="flex items-center gap-1.5"><Zap size={14}/> {selectedJob.location_type}</span>
              <span className="flex items-center gap-1.5"><Star size={14}/> {selectedJob.job_type}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {
              setEditingJob(selectedJob);
              setJobForm({
                title: selectedJob.title, description: selectedJob.description || '', categoryId: selectedJob.category_id || 'cat-tech01',
                jobType: selectedJob.job_type, experienceLevel: selectedJob.experience_level, locationType: selectedJob.location_type, status: selectedJob.status
              });
              setActiveView('create_job');
            }} className="px-5 py-2.5 bg-white border border-border-ghost/20 rounded-xl text-sm font-semibold text-text-main hover:bg-slate-50 transition-colors shadow-sm">
              Edit Posting
            </button>
            <button className="px-5 py-2.5 bg-white border border-border-ghost/20 rounded-xl text-sm font-semibold text-text-main hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Zap size={14}/> Share
            </button>
            <button className="px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338ca] shadow-ambient transition-colors">
              Close Job
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">Total Applicants</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main">148</span>
              <span className="text-[11px] font-bold text-brand-primary bg-purple-50 px-1.5 py-0.5 rounded mb-1">+12%</span>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">New Candidates</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main">24</span>
              <span className="text-[10px] font-bold text-[#6d28d9] mb-1 uppercase tracking-wider">New</span>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">Avg. Match Score</h4>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-text-main">86%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-primary w-[86%]"></div></div>
          </div>
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">Days Posted</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main">12</span>
              <span className="text-[11px] text-text-muted mb-1 font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-border-ghost/20 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-ghost/20 flex justify-between items-center">
                <h3 className="font-bold text-text-main">Top Candidates</h3>
                <button className="text-[13px] font-bold text-[#6d28d9] hover:underline">View All</button>
              </div>
              <div className="divide-y divide-border-ghost/10">
                {[
                  {name: 'Sarah Jenkins', role: 'Senior UX Designer @ Meta', match: '94%', status: 'INTERVIEWING', bg: 'bg-purple-100 text-[#6d28d9]', img: '4'},
                  {name: 'Marcus Thorne', role: 'Product Designer @ Stripe', match: '89%', status: 'SCREENING', bg: 'bg-slate-200 text-slate-600', img: '3'}
                ].map(c => (
                  <div key={c.name} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={`https://i.pravatar.cc/150?u=${c.img}`} alt="" className="w-12 h-12 rounded-full border border-border-ghost/20" />
                      <div>
                        <h4 className="font-bold text-[14px] text-text-main">{c.name}</h4>
                        <p className="text-[12px] text-text-muted leading-tight mt-0.5">{c.role}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-[#4f46e5] flex items-center justify-center text-[11px] font-bold text-brand-primary">
                      {c.match}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${c.bg}`}>{c.status}</span>
                    <button className="text-[13px] font-bold text-[#6d28d9]">View<br/>Profile</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f8f9fc] rounded-[24px] p-8 border border-border-ghost/20 relative shadow-sm">
              <div className="absolute top-6 right-6 text-text-muted"><Zap size={18}/></div>
              <h3 className="font-bold text-lg mb-4">Role Overview</h3>
              <p className="text-[14px] text-text-muted leading-relaxed whitespace-pre-wrap">
                {selectedJob.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm">
              <h3 className="font-bold text-text-main mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  {user: 'Sarah Jenkins', action: 'moved to Interview phase', time: '2 hours ago • by Alex Rivera', icon: 'bg-[#4f46e5]'},
                  {user: 'New Application', action: 'received from David Chen', time: '5 hours ago • AI Scored: 82%', icon: 'bg-slate-200'},
                  {user: 'Recruiter Note', action: 'added to Marcus Thorne\'s profile', time: 'Yesterday • by Jessica Wong', icon: 'bg-[#6d28d9]'}
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 2 && <div className="absolute left-[5px] top-6 bottom-[-24px] w-px bg-border-ghost/20"></div>}
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${act.icon}`}></div>
                    <div>
                      <p className="text-[13px] text-text-main"><span className="font-bold">{act.user}</span> {act.action}</p>
                      <p className="text-[11px] text-text-muted mt-1 font-medium">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-2.5 bg-canvas-base border border-border-ghost/20 rounded-xl text-[13px] font-bold text-text-main hover:bg-slate-50 transition-colors">
                View Full History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateJob = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-10">
        <button onClick={() => setActiveView('job_postings')} className="text-text-muted hover:text-text-main text-sm font-medium mb-4 flex items-center gap-1">← Back to Postings</button>
        <h2 className="text-[40px] font-medium text-text-main tracking-tight leading-tight">
          {editingJob ? 'Edit' : 'Post a'} <span className="text-[#6d28d9]">{editingJob ? 'Position' : 'New Position'}</span>
        </h2>
        <p className="text-text-muted text-[15px] mt-2 max-w-xl">
          Define the role, requirements, and let SkillBridge AI match you with the top 1% of talent in our global network.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <form onSubmit={handleJobSubmit} className="flex-1 space-y-8">
          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Job Title</label>
            <input 
              type="text" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}
              className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
              placeholder="e.g. Senior Full Stack Engineer"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Description</label>
            <textarea 
              rows="6" required value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}
              className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] resize-none"
              placeholder="Describe the mission, the impact, and the day-to-day responsibilities..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Job Type</label>
                <select value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4f46e5]">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                </select>
             </div>
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Status</label>
                <select value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4f46e5]">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => setActiveView('job_postings')} className="text-sm font-bold text-text-main hover:text-text-muted">Cancel</button>
            <button type="submit" className="bg-[#4f46e5] text-white px-8 py-3 rounded-xl text-[15px] font-bold shadow-ambient hover:-translate-y-0.5 transition-all">
              {editingJob ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </form>

        <div className="w-[300px] shrink-0">
          <div className="bg-[#f8f9fc] rounded-[20px] p-6 border border-border-ghost/10">
            <h4 className="font-bold mb-4">Posting Tips</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-[#6d28d9] bg-purple-100 p-2 rounded-lg shrink-0 h-min"><Zap size={16}/></div>
                <div>
                  <h5 className="font-bold text-[13px] mb-1">Be Specific</h5>
                  <p className="text-[12px] text-text-muted">Clearly define the tech stack to reduce irrelevant applications by 40%.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-[#6d28d9] bg-purple-100 p-2 rounded-lg shrink-0 h-min"><Star size={16}/></div>
                <div>
                  <h5 className="font-bold text-[13px] mb-1">AI Matching</h5>
                  <p className="text-[12px] text-text-muted">Our AI analyzes your description to find candidates with specific soft-skill matches.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCandidateDetail = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <button onClick={() => setActiveView('candidate_pool')} className="text-text-muted hover:text-text-main text-sm font-medium mb-6 flex items-center gap-1">← Back to Candidates</button>
       
       <div className="flex justify-between items-start mb-8">
          <div className="flex gap-6 items-center">
            <img src="https://i.pravatar.cc/150?u=2" alt="Elena" className="w-24 h-24 rounded-2xl shadow-sm border border-border-ghost/20" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-bold text-text-main">Elena Rodriguez</h2>
                <span className="bg-purple-100 text-[#6d28d9] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Top Talent</span>
              </div>
              <p className="text-[15px] text-text-muted font-medium mb-4">Senior Full-Stack Engineer • San Francisco, CA</p>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-brand-primary text-sm font-bold"><MessageSquare size={16}/> Message</button>
                <button className="flex items-center gap-2 text-brand-primary text-sm font-bold"><Download size={16}/> Export CV</button>
              </div>
            </div>
          </div>
          <div className="w-24 h-24 rounded-full border-[6px] border-[#4f46e5] flex flex-col items-center justify-center relative">
            <span className="text-3xl font-bold text-brand-primary leading-none">95</span>
            <span className="text-[8px] font-bold text-brand-primary tracking-wider uppercase mt-1">Match Score</span>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[24px] p-8 border border-border-ghost/20 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                <Briefcase size={20} className="text-brand-primary"/>
                <h3 className="font-bold text-lg">Professional Summary</h3>
             </div>
             <p className="text-[14px] text-text-muted leading-relaxed mb-8">
                Accomplished Full-Stack Engineer with 8+ years of experience in architecting scalable cloud infrastructures and leading cross-functional engineering teams. Specialized in React, Node.js, and high-performance distributed systems. Proven track record of reducing latency by 40% for Series B fintech startups.
             </p>
             <div className="space-y-6">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-canvas-base rounded-xl flex items-center justify-center shrink-0"><Briefcase size={16} className="text-brand-primary"/></div>
                   <div>
                      <h4 className="font-bold text-[14px]">Staff Engineer @ NexGen Cloud</h4>
                      <p className="text-[12px] text-text-muted">2020 — Present • Lead architectural shifts to serverless</p>
                   </div>
                </div>
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-canvas-base rounded-xl flex items-center justify-center shrink-0"><Users size={16} className="text-brand-primary"/></div>
                   <div>
                      <h4 className="font-bold text-[14px]">M.S. Computer Science</h4>
                      <p className="text-[12px] text-text-muted">Stanford University • Focus on AI & Distributed Systems</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-[24px] p-8 border border-border-ghost/20 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                      <Zap size={20} className="text-[#6d28d9]"/>
                      <h3 className="font-bold text-lg">AI Candidate Breakdown</h3>
                  </div>
                  <span className="bg-purple-100 text-[#6d28d9] px-3 py-1 rounded-full text-[10px] font-bold uppercase">SkillBridge AI Insight</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2">
                      <span>System Architecture</span><span className="text-[#6d28d9]">98% Mastery</span>
                    </div>
                    <div className="h-2 w-full bg-canvas-base rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[#6d28d9] w-[98%]"></div>
                    </div>
                    <p className="text-[11px] italic text-text-muted">"Elena exhibits expert-level proficiency in microservices. Her historical code contributions suggest a deep understanding of horizontal scaling..."</p>
                  </div>
                </div>
             </div>

             <div className="signature-gradient rounded-[24px] p-8 text-white shadow-ambient">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={20}/>
                  <h3 className="font-bold text-lg">SkillBridge AI Verdict</h3>
                </div>
                <p className="text-white/90 text-[14px] leading-relaxed mb-6">
                  Elena Rodriguez is a High-Confidence Match for your Staff Engineer opening. Her specialized background in fintech scalability perfectly aligns with your upcoming product roadmap.
                </p>
                <div className="flex gap-4">
                  <button className="bg-white text-brand-primary px-6 py-2.5 rounded-lg text-sm font-bold">Schedule Interview</button>
                  <button className="bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-bold border border-white/30 hover:bg-white/30 transition-colors">Add to Shortlist</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas-base font-sans overflow-hidden">
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1000px] mx-auto">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'candidate_pool' && renderCandidatePool()}
          {activeView === 'job_postings' && renderJobPostings()}
          {activeView === 'job_detail' && renderJobDetail()}
          {activeView === 'create_job' && renderCreateJob()}
          {activeView === 'candidate_detail' && renderCandidateDetail()}
        </div>
      </main>
    </div>
  );
};

export default HrdDashboard;
