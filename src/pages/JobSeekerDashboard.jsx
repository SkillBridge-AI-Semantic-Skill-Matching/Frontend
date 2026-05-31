/* eslint-disable no-unused-vars, no-empty, no-undef */
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, FileText, User, LogOut, 
  Search, Bell, Settings, TrendingUp, Send, Zap, 
  ChevronRight, ArrowLeft, CheckCircle, MapPin, Clock, XCircle, Sparkles, Building2, Globe
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let activeView = 'dashboard';
  if (location.pathname.includes('/matches')) activeView = 'matches';
  else if (location.pathname.includes('/job_detail')) activeView = 'job_detail';
  else if (location.pathname.includes('/applications')) activeView = 'applications';
  else if (location.pathname.includes('/profile')) activeView = 'profile';

  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
     fullName: '', phoneNumber: '', address: '', avatarUrl: '', bio: '', education: '', portfolioUrl: '', linkedinUrl: ''
  });


  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

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
      const [profRes, recsRes, appsRes, jobsRes, resumesRes] = await Promise.all([
        fetchWithAuth('/api/profiles/me'),
        fetchWithAuth('/api/recommendations'),
        fetchWithAuth('/api/applications/mine'),
        fetch('/api/jobs'),
        fetchWithAuth('/api/resumes/mine')
      ]);
      const profData = await profRes.json();
      const recsData = await recsRes.json();
      const appsData = await appsRes.json();
      const jobsData = await jobsRes.json();
      const resumesData = await resumesRes.json();

      if (profData.status === 'success') {
         const p = profData.data?.profile || profData.data || null;
         setProfile(p);
         if (p) {
            let parsedApplicantData = p.applicantData || p.applicant_data || {};
            if (typeof parsedApplicantData === 'string') {
              try { parsedApplicantData = JSON.parse(parsedApplicantData); } catch (e) { parsedApplicantData = {}; }
            }
            setProfileForm({
               fullName: p.fullName || p.full_name || '',
               phoneNumber: p.phoneNumber || p.phone_number || '',
               address: p.address || '',
               avatarUrl: p.avatarUrl || p.avatar_url || '',
               bio: parsedApplicantData.bio || p.bio || '',
               education: parsedApplicantData.education || p.education || '',
               portfolioUrl: parsedApplicantData.portfolioUrl || parsedApplicantData.portfolio_url || p.portfolioUrl || '',
               linkedinUrl: parsedApplicantData.linkedinUrl || parsedApplicantData.linkedin_url || p.linkedinUrl || ''
            });
         }
      }
      if (resumesData.status === 'success') {
         setResumes(resumesData.data?.resumes || []);
      }
      if (recsData.status === 'success') {
        let rawRecs = Array.isArray(recsData.data) ? recsData.data : (recsData.data?.recommendations);
        rawRecs = Array.isArray(rawRecs) ? rawRecs.slice().reverse() : [];
        
        let realMatches = [];
        let cleanTopUnits = [];
        let cleanGapUnits = [];

        if (rawRecs.length > 0) {
           const latestDocId = rawRecs[0].document_id;
           const latestRecs = rawRecs.filter(r => r.document_id === latestDocId);
           
           // Use the top_units and gap_units from the first element of the latest CV
           const tu = latestRecs[0].top_units;
           const gu = latestRecs[0].gap_units;
           
           if (Array.isArray(tu)) {
              cleanTopUnits = tu;
           } else if (typeof tu === 'string') {
              try {
                 cleanTopUnits = JSON.parse(tu);
                 if (!Array.isArray(cleanTopUnits)) cleanTopUnits = [cleanTopUnits];
              } catch(e) {
                 cleanTopUnits = tu.replace(/[[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
              }
           }

           if (Array.isArray(gu)) {
              cleanGapUnits = gu;
           } else if (typeof gu === 'string') {
              try {
                 cleanGapUnits = JSON.parse(gu);
                 if (!Array.isArray(cleanGapUnits)) cleanGapUnits = [cleanGapUnits];
              } catch(e) {
                 cleanGapUnits = gu.replace(/[[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
              }
           }

           setAiAnalysis({
             top_units: Array.from(new Set(cleanTopUnits.map(unit => typeof unit === 'object' ? (unit?.judul_unit || unit?.name || unit?.skill || JSON.stringify(unit)) : String(unit)))),
             gap_units: Array.from(new Set(cleanGapUnits.map(unit => typeof unit === 'object' ? (unit?.judul_unit || unit?.name || unit?.skill || JSON.stringify(unit)) : String(unit))))
           });
           
           let validJobs = [];
           if (jobsData.status === 'success') {
             validJobs = jobsData.data?.jobs || jobsData.data || [];
           }
           
           // Map realMatches directly from the backend API's latest recommendations
           // CROSS-REFERENCE with real HRD jobs to ensure NO dummy data is shown
           realMatches = latestRecs
              .filter(r => validJobs.some(job => job.id === r.job_id))
              .map(r => {
                 const realHrdJob = validJobs.find(job => job.id === r.job_id);
                 return {
                     ...realHrdJob,
                     id: r.job_id,
                     match_score: r.match_score || 0,
                     ai_analysis: r.ai_analysis || ''
                 };
              });
           
           // Sort by match_score descending and pick top 3
           realMatches.sort((a, b) => b.match_score - a.match_score);
        }
        
        setMatches(realMatches.slice(0, 3));
      }
      if (appsData.status === 'success') {
        const rawApps = Array.isArray(appsData.data) ? appsData.data : (appsData.data?.applications);
        setApplications(Array.isArray(rawApps) ? rawApps : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewJobDetail(job) {
    try {
      if (job && job.id) sessionStorage.setItem('currentJobSeekerJobId', job.id);
      const jobId = job ? job.id : sessionStorage.getItem('currentJobSeekerJobId');
      if (!jobId) return;

      let jobWithAi = { ...job };
      const match = matches.find(m => m.id === jobId || m.job_id === jobId);
      if (match) {
        jobWithAi = { ...jobWithAi, ...match };
      }

      if (job && Object.keys(jobWithAi).length > 1) setSelectedJob(jobWithAi); // Optimistic update
      if (!location.pathname.includes('/job_detail')) {
         navigate('/dashboard/job_detail');
      }
      
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.status === 'success') {
        const fullJob = data.data.job || data.data;
        setSelectedJob(prev => ({ ...(prev || {}), ...jobWithAi, ...fullJob }));
      }
    } catch(e) {
      console.error('Gagal memuat detail pekerjaan', e);
      alert('Gagal memuat detail pekerjaan, kembali ke halaman pencarian.');
      navigate('/dashboard/matches');
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
        navigate('/dashboard/applications');
      } else {
        alert('Gagal melamar: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    }
  }

  async function handleStartInterview(jobId) {
    setShowInterviewModal(true);
    setLoadingInterview(true);
    setInterviewQuestions(null);
    try {
      const res = await fetchWithAuth(`/api/jobs/${jobId}/interview`);
      const data = await res.json();
      if (data.success || data.status === 'success' || data.interview_content) {
        const payload = data.interview_content || data.data?.interview_content || data.data || data;
        if (typeof payload === 'string') {
          // Potong teks jika ada bagian 'Pertanyaan Lanjutan' atau 'Follow-up'
          const slicedPayload = payload.split(/(?:\*\*|\*)?(?:Pertanyaan Lanjutan|Follow-up)/i)[0].trim();
          setInterviewQuestions(slicedPayload);
        } else if (Array.isArray(payload)) {
          setInterviewQuestions(payload);
        } else if (payload && Array.isArray(payload.questions)) {
          setInterviewQuestions(payload.questions);
        } else {
          setInterviewQuestions([JSON.stringify(payload)]);
        }
      } else {
        setInterviewQuestions(['Gagal memuat pertanyaan: ' + (data.message || 'Error')]);
      }
    } catch(e) {
      setInterviewQuestions(['Terjadi kesalahan jaringan saat mengambil data interview.']);
    }
    setLoadingInterview(false);
  }

  // Markdown Parser Helpers
  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-slate-900 mt-8 mb-3">{formatBoldText(trimmed.replace('### ', ''))}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4">{formatBoldText(trimmed.replace('## ', ''))}</h2>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={i} className="ml-5 list-disc mt-1.5 text-slate-700 leading-relaxed">{formatBoldText(trimmed.substring(2))}</li>;
      }
      if (trimmed.trim() === '---') {
        return <hr key={i} className="my-8 border-slate-200" />;
      }
      if (trimmed.trim() === '') {
        return <div key={i} className="h-3"></div>;
      }
      return <p key={i} className="mb-2 text-slate-700 leading-relaxed">{formatBoldText(trimmed)}</p>;
    });
  };

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      const payload = {};
      if (profileForm.fullName) payload.fullName = profileForm.fullName;
      if (profileForm.phoneNumber) payload.phoneNumber = profileForm.phoneNumber;
      if (profileForm.address) payload.address = profileForm.address;
      if (profileForm.avatarUrl) payload.avatarUrl = profileForm.avatarUrl;
      
      const applicantData = {};
      if (profileForm.bio) applicantData.bio = profileForm.bio;
      if (profileForm.education) applicantData.education = profileForm.education;
      if (profileForm.portfolioUrl) applicantData.portfolioUrl = profileForm.portfolioUrl;
      if (profileForm.linkedinUrl) applicantData.linkedinUrl = profileForm.linkedinUrl;
      
      if (Object.keys(applicantData).length > 0) {
         payload.applicantData = applicantData;
      }

      const res = await fetchWithAuth('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
         alert('Profil berhasil diperbarui!');
         fetchData();
      } else {
         alert('Gagal: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  }

  async function handleDeleteResume(id) {
    if (!confirm('Hapus CV ini? Analisis AI sebelumnya akan direset.')) return;
    try {
      const res = await fetchWithAuth(`/api/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) {
         alert('CV terhapus!');
         setAiAnalysis(null);
         setMatches([]);
         fetchData();
      }
    } catch (err) {}
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'user') {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line
    fetchData();

    if (location.pathname.includes('/job_detail') && !selectedJob) {
      const savedJobId = sessionStorage.getItem('currentJobSeekerJobId');
      if (savedJobId) {
        // eslint-disable-next-line
        handleViewJobDetail({ id: savedJobId });
      } else {
        navigate('/dashboard/matches');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Sync AI analysis for the selected job if the page was refreshed (so matches loads after selectedJob is set)
  useEffect(() => {
    if (selectedJob && selectedJob.id && !selectedJob.ai_analysis && matches.length > 0) {
      const matchedJob = matches.find(m => m.id === selectedJob.id);
      if (matchedJob && matchedJob.ai_analysis) {
        setSelectedJob(prev => ({
          ...prev,
          ai_analysis: matchedJob.ai_analysis,
          top_units: matchedJob.top_units,
          gap_units: matchedJob.gap_units,
          match_score: matchedJob.match_score
        }));
      }
    }
  }, [matches, selectedJob?.id]);


  const filteredMatches = matches.filter(m => 
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.job_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.location_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.category_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = applications.filter(a => 
    (a.title || a.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.category_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="font-bold text-indigo-700 tracking-tight leading-tight">Pelet</div>
              <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Seeker Portal</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1">
          <Link to="/dashboard" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/dashboard/matches" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${(activeView === 'matches' || activeView === 'job_detail') ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <Briefcase size={18} />
            My Matches
          </Link>
          <Link to="/dashboard/applications" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'applications' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <FileText size={18} />
            Applications
          </Link>
          <Link to="/dashboard/profile" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
            <User size={18} />
            Profile
          </Link>
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
            {(activeView === 'matches' || activeView === 'applications') && (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search skills, jobs, or insights..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/dashboard/profile')}
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{profile?.fullName || 'Job Seeker'}</div>
                <div className="text-xs text-slate-500">{
                  (() => {
                    let d = profile?.applicantData || profile?.applicant_data || {};
                    if (typeof d === 'string') try { d = JSON.parse(d); } catch(e) { d = {}; }
                    return d.bio || profile?.bio || 'SkillBridge User';
                  })()
                }</div>
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Top Match Score</h3>
                </div>
                <div className="text-5xl font-bold text-indigo-700 mb-6">
                  {matches.length > 0 ? Math.max(...matches.map(m => Math.round(m.match_score || 0))) : 0}<span className="text-2xl text-indigo-400">%</span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">Highest Alignment</span>
                    <span className="text-slate-900 font-bold">
                      {matches.length > 0 && Math.max(...matches.map(m => Math.round(m.match_score || 0))) > 80 ? 'High' : 
                       matches.length > 0 && Math.max(...matches.map(m => Math.round(m.match_score || 0))) > 50 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${matches.length > 0 ? Math.max(...matches.map(m => Math.round(m.match_score || 0))) : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column Stats */}
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <Send size={16} className="rotate-45 -mt-1 ml-1" />
                </div>
                <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Applications Sent</div>
                <div className="text-3xl font-bold text-slate-900">{applications.length}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
                  <TrendingUp size={16} />
                </div>
                <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Interview Rate</div>
                <div className="text-3xl font-bold text-slate-900">
                  {applications.length > 0 ? Math.round((applications.filter(a => a.status === 'accepted').length / applications.length) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Skill Insights Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={18} className="text-indigo-600 fill-indigo-600" />
                <h3 className="font-bold text-slate-900">AI CV Analysis</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Top Matched Skills</h4>
                  <div className="space-y-3">
                    {aiAnalysis && aiAnalysis.top_units ? (
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.top_units.map((unit, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-100">
                            {typeof unit === 'object' ? (unit?.name || unit?.skill || JSON.stringify(unit)) : String(unit)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Silakan unggah CV untuk melihat hasil analisis.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Recommended Jobs */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
                <button onClick={() => navigate('/dashboard/matches')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all matches <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matches.slice(0, 3).map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-5">
                        <div className="flex-shrink-0 bg-gradient-to-br from-indigo-50 to-white text-indigo-700 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-xl shadow-[0_2px_10px_-3px_rgba(79,70,229,0.15)] border border-indigo-100">
                          {Math.round(job.match_score || 0)}%
                          <span className="text-[9px] uppercase tracking-wider font-bold mt-0.5 text-indigo-400">Match</span>
                        </div>
                        <div className="pt-1">
                          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 line-clamp-2">{job.title}</h3>
                          {job.company_name && (
                            <div className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5"><Building2 size={12} className="text-indigo-500"/> {job.company_name}</div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold capitalize">{job.location_type}</span>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold capitalize">{job.job_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleViewJobDetail(job)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                      View Details
                    </button>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="text-slate-500 text-sm">Belum ada rekomendasi pekerjaan.</div>
                )}
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
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                {searchQuery ? 'Tidak ada pekerjaan yang cocok dengan pencarian Anda.' : 'Belum ada rekomendasi yang tersedia. Silakan unggah CV Anda di halaman utama.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMatches.map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-start gap-5 mb-5">
                        <div className="flex-shrink-0 bg-gradient-to-br from-indigo-50 to-white text-indigo-700 w-20 h-20 rounded-3xl flex flex-col items-center justify-center font-extrabold text-2xl shadow-[0_2px_15px_-3px_rgba(79,70,229,0.15)] border border-indigo-100">
                          {Math.round(job.match_score || 0)}%
                          <span className="text-[10px] uppercase tracking-wider font-bold mt-1 text-indigo-400">Match</span>
                        </div>
                        <div className="pt-1.5 flex-1">
                          <h3 className="font-bold text-xl text-slate-900 mb-1.5 leading-tight">{job.title}</h3>
                          {job.company_name && (
                            <div className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2"><Building2 size={14} className="text-indigo-500"/> {job.company_name}</div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold capitalize">{job.location_type}</span>
                            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold capitalize">{job.job_type}</span>
                            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold capitalize">{job.experience_level}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-6 line-clamp-3">
                        {job.description || 'Tidak ada deskripsi yang disediakan.'}
                      </p>
                    </div>
                    <button onClick={() => handleViewJobDetail(job)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'job_detail' && (
          <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => navigate('/dashboard/matches')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2">
              <ArrowLeft size={16} /> Back to Matches
            </button>
            
            {!selectedJob || !selectedJob.title ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-500 font-medium">Memuat detail pekerjaan...</p>
              </div>
            ) : (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6 items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{selectedJob.title}</h1>
                    {selectedJob.company_name && (
                       <div className="flex items-center gap-3 mb-4">
                         <span className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><Building2 size={20}/> {selectedJob.company_name}</span>
                         {selectedJob.company_website && (
                            <a href={selectedJob.company_website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1.5">
                               <Globe size={14}/> Website
                            </a>
                         )}
                       </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={16} /> {selectedJob.location_type}</span>
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {selectedJob.job_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <button onClick={() => handleStartInterview(selectedJob.id)} className="px-5 py-3.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 h-fit whitespace-nowrap">
                    <Sparkles size={18} className="text-indigo-600" /> Mock Interview
                  </button>
                  {(() => {
                  const appliedApp = applications.find(app => app.job_id === selectedJob.id);
                  if (!appliedApp) {
                    return (
                      <button onClick={() => handleApplyJob(selectedJob.id)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                        <Send size={18} /> Apply Now
                      </button>
                    );
                  }
                  
                  const statusColors = {
                    pending: 'bg-amber-50 text-amber-600 border-amber-200',
                    accepted: 'bg-green-50 text-green-600 border-green-200',
                    rejected: 'bg-red-50 text-red-600 border-red-200'
                  };
                  const sColor = statusColors[appliedApp.status] || 'bg-slate-50 text-slate-600 border-slate-200';
                  
                  return (
                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-6 py-2.5 ${sColor} border font-bold rounded-xl flex items-center gap-2 shadow-sm`}>
                        {appliedApp.status === 'accepted' ? <CheckCircle size={18} /> : appliedApp.status === 'rejected' ? <XCircle size={18} /> : <Clock size={18} />}
                        Application Status: <span className="uppercase tracking-wider ml-1">{appliedApp.status}</span>
                      </div>

                    </div>
                  );
                })()}
                </div>
              </div>

              <div className="h-px w-full bg-slate-100 my-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                  {selectedJob.ai_analysis && (
                    <div className="bg-indigo-50/50 rounded-[24px] p-8 border border-indigo-100 relative shadow-sm">
                      <div className="absolute top-6 right-6 text-indigo-400"><Sparkles size={18}/></div>
                      <h3 className="font-bold text-lg mb-4 text-indigo-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-600"/> AI Match Analysis
                      </h3>
                      <div className="text-[14px] text-slate-700 leading-relaxed mb-6">
                        {renderMarkdown((selectedJob.ai_analysis || '').split(/### 2\.|## 2\.|2\. Rekomendasi/i)[0].trim())}
                      </div>
                      
                      {((selectedJob.top_units && selectedJob.top_units.length > 0) || (selectedJob.gap_units && selectedJob.gap_units.length > 0)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-indigo-100/50">
                          {selectedJob.top_units && selectedJob.top_units.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle size={14}/> Matching Skills</div>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.top_units.map(unit => (
                                  <span key={unit} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[11px] font-bold">{unit}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedJob.gap_units && selectedJob.gap_units.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle size={14}/> Skill Gaps (To Learn)</div>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.gap_units.map(unit => (
                                  <span key={unit} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[11px] font-bold">{unit}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#f8f9fc] rounded-[24px] p-8 border border-slate-100 relative shadow-sm">
                    <div className="absolute top-6 right-6 text-slate-400"><Zap size={18}/></div>
                    <h3 className="font-bold text-lg mb-4 text-slate-900">Role Overview</h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {selectedJob.description || 'Tidak ada deskripsi lebih lanjut.'}
                    </p>
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
            )}
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
                  <button onClick={() => navigate('/dashboard/matches')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
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
                    {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                      <tr key={app.id || app.application_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-sm text-slate-900 mb-0.5">{app.title || app.job_title || 'Unknown Job'}</div>
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
                          {app.applied_at || app.appliedAt || app.created_at || app.createdAt ? new Date(app.applied_at || app.appliedAt || app.created_at || app.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => {
                            handleViewJobDetail({ id: app.job_id });
                          }} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">View Details</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-500">
                          {searchQuery ? 'Tidak ada lamaran yang cocok dengan pencarian Anda.' : 'Belum ada lamaran'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {activeView === 'profile' && (
          <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-medium text-slate-900 mb-2">My Profile</h1>
              <p className="text-slate-500">Update your personal information and manage your uploaded CVs.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Avatar URL</label>
                  <input type="text" value={profileForm.avatarUrl} onChange={e => setProfileForm({...profileForm, avatarUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / Headline</label>
                  <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all h-24 resize-none" placeholder="Experienced Frontend Developer..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Education</label>
                    <input type="text" value={profileForm.education} onChange={e => setProfileForm({...profileForm, education: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" placeholder="S1 Teknik Informatika..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio URL</label>
                    <input type="url" value={profileForm.portfolioUrl} onChange={e => setProfileForm({...profileForm, portfolioUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" placeholder="https://portfolio.dev" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn URL</label>
                  <input type="url" value={profileForm.linkedinUrl} onChange={e => setProfileForm({...profileForm, linkedinUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all" placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Manage CVs</h2>
              {resumes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Anda belum mengunggah CV apapun.</p>
                  <button onClick={() => navigate('/')} className="mt-4 px-5 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    Upload CV di Beranda
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{r.filename || 'Resume Document'}</p>
                          <p className="text-xs text-slate-500">Uploaded on {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteResume(r.id)} className="px-4 py-2 bg-white text-red-600 border border-red-100 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors">
                        Delete CV
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mock Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" /> AI Mock Interview
              </h2>
              <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              {loadingInterview ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium">Generating interview questions with AI...</p>
                </div>
              ) : interviewQuestions ? (
                <div className="space-y-6">
                  {typeof interviewQuestions === 'string' ? (
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/80">
                      {renderMarkdown(interviewQuestions)}
                    </div>
                  ) : Array.isArray(interviewQuestions) ? (
                    interviewQuestions.map((q, i) => (
                      <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {i + 1}
                          </div>
                          <div className="text-slate-700 leading-relaxed pt-1">
                            {typeof q === 'string' ? q : (q.question || JSON.stringify(q))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Tidak ada pertanyaan yang tersedia.
                </div>
              )}
            </div>
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowInterviewModal(false)} className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobSeekerDashboard;
