/* eslint-disable no-unused-vars, no-empty, no-undef */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Plus, LogOut, Search, Bell, 
  ChevronRight, Star, Zap, BarChart, Download, Filter, MessageSquare, Settings, X, CheckCircle, Sparkles
} from 'lucide-react';

const HrdDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let activeView = 'dashboard';
  if (location.pathname.includes('/candidate_pool')) activeView = 'candidate_pool';
  else if (location.pathname.includes('/job_postings')) activeView = 'job_postings';
  else if (location.pathname.includes('/create_job')) activeView = 'create_job';
  
  else if (location.pathname.includes('/job_detail')) activeView = 'job_detail';
  else if (location.pathname.includes('/profile')) activeView = 'profile';
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [hrProfile, setHrProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullName: '', phoneNumber: '', address: '', avatarUrl: '', companyName: '', companyWebsite: ''
  });

  // Form state for creating/editing job
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewCandidate, setReviewCandidate] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    categoryId: 'cat-tech01',
    jobType: 'full-time',
    experienceLevel: 'mid',
    locationType: 'onsite',
    status: 'open'
  });


  async function fetchProfile() {
    try {
      const res = await fetchWithAuth('/api/profiles/me');
      const data = await res.json();
      if (data.status === 'success') {
        const p = data.data.profile || data.data;
        setHrProfile(p);
        if (p) {
          let parsedHrdData = p.hrdData || p.hrd_data || p.hrData || {};
          if (typeof parsedHrdData === 'string') {
            try { parsedHrdData = JSON.parse(parsedHrdData); } catch (e) { parsedHrdData = {}; }
          }
          
          setProfileForm({
            fullName: p.fullName || p.full_name || '',
            phoneNumber: p.phoneNumber || p.phone_number || '',
            address: p.address || '',
            avatarUrl: p.avatarUrl || p.avatar_url || '',
            companyName: parsedHrdData.companyName || p.companyName || '',
            companyWebsite: parsedHrdData.companyWebsite || p.companyWebsite || ''
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      const payload = {};
      if (profileForm.fullName) payload.fullName = profileForm.fullName;
      if (profileForm.phoneNumber) payload.phoneNumber = profileForm.phoneNumber;
      if (profileForm.address) payload.address = profileForm.address;
      if (profileForm.avatarUrl) payload.avatarUrl = profileForm.avatarUrl;
      
      const hrdData = {};
      if (profileForm.companyName) hrdData.companyName = profileForm.companyName;
      if (profileForm.companyWebsite) hrdData.companyWebsite = profileForm.companyWebsite;
      
      if (Object.keys(hrdData).length > 0) {
        payload.hrdData = hrdData;
      }

      const res = await fetchWithAuth('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
         alert('Profil berhasil diperbarui!');
         fetchProfile();
      } else {
         alert('Gagal: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  }

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

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'hrd') {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line
    fetchJobs();
    // eslint-disable-next-line
    fetchProfile();

    if (location.pathname.includes('/job_detail') && !selectedJob) {
      const savedJobId = sessionStorage.getItem('currentJobId');
      if (savedJobId) {
        // eslint-disable-next-line
        handleViewJobDetail({ id: savedJobId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const openCreateJob = () => {
    setEditingJob(null);
    setJobForm({
      title: '', description: '', categoryId: 'cat-tech01', 
      jobType: 'full-time', experienceLevel: 'mid', locationType: 'onsite', status: 'open'
    });
    navigate('/hrd-dashboard/create_job');
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
    const method = editingJob ? 'PUT' : 'POST';

    const payload = {
      title: jobForm.title,
      description: jobForm.description,
      categoryId: jobForm.categoryId,
      jobType: jobForm.jobType,
      experienceLevel: jobForm.experienceLevel,
      locationType: jobForm.locationType,
      status: jobForm.status
    };

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      console.log('Submit Job Response:', data); // Debugging

      if (data.status === 'success') {
        fetchJobs();
        navigate('/hrd-dashboard/job_postings');
      } else {
        alert('Gagal menyimpan lowongan: ' + data.message);
      }
    } catch (err) {
      console.error('Error submitting job:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  async function handleViewJobDetail(job) {
    try {
      if (job && job.id) sessionStorage.setItem('currentJobId', job.id);
      const jobId = job ? job.id : sessionStorage.getItem('currentJobId');
      if (!jobId) return;

      let jobData = null;
      
      try {
          const res = await fetchWithAuth(`/api/jobs/${jobId}`);
          const data = await res.json();
          if (data.status === 'success') {
              jobData = data.data.job || data.data;
          }
      } catch(e) {
          console.error(e);
      }
      
      // If endpoint fails, fetch all HRD jobs and find it
      if (!jobData) {
          try {
             const allRes = await fetchWithAuth('/api/jobs/mine');
             const allData = await allRes.json();
             if (allData.status === 'success') {
                 const allJobs = allData.data.jobs || [];
                 jobData = allJobs.find(j => j.id === jobId);
             }
          } catch(e) {}
      }
      
      // Still no data? Use the passed job object if it has details
      if (!jobData && job && Object.keys(job).length > 1) {
          jobData = job;
      }
      
      let applications = [];
      try {
        const appsRes = await fetchWithAuth(`/api/jobs/${jobId}/applications`);
        const appsData = await appsRes.json();
        if (appsData.status === 'success' && appsData.data.applications) {
          applications = appsData.data.applications;
        }
      } catch(e) {
        console.error('Error fetching applications', e);
      }

      if (jobData) {
        setSelectedJob({ ...(job || {}), ...jobData, applications });
        if (!location.pathname.includes('/job_detail')) {
          navigate('/hrd-dashboard/job_detail');
        }
      } else {
        alert('Gagal mengambil detail lowongan, silakan kembali ke Job Postings.');
        navigate('/hrd-dashboard/job_postings');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan jaringan');
    }
  }

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetchWithAuth(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
         setSelectedJob(prev => ({
            ...prev,
            applications: prev.applications.map(app => (app.id === appId || app.application_id === appId) ? { ...app, status: newStatus } : app)
         }));
      } else {
         alert('Gagal mengubah status: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderSidebar = () => (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0 z-20 shrink-0 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Zap size={18} className="fill-white" />
          </div>
          <div>
            <div className="font-bold text-indigo-700 tracking-tight leading-tight">Pelet</div>
            <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">HR Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <button onClick={() => navigate('/hrd-dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        
        <button onClick={() => navigate('/hrd-dashboard/job_postings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'job_postings' || activeView === 'job_detail' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
          <Briefcase size={18} />
          <span>Job Postings</span>
        </button>

        <button onClick={openCreateJob} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'create_job' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'}`}>
          <Plus size={18} />
          <span>Create New Job</span>
        </button>
      </nav>

      <div className="p-4 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  const renderHeader = (title, subtitle) => (
    <div className="mb-10">
      <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="text-text-muted text-[15px] mt-1">{subtitle}</p>}
    </div>
  );

  // --- Views ---

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderHeader(
        "Talent Overview", 
        "AI-powered insights for Pelet Hiring"
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center"><Briefcase size={16}/></div>
            <span className="text-[13px] font-bold text-text-main">Total Jobs Posted</span>
          </div>
          <div className="flex items-end gap-2 my-2">
            <h3 className="text-4xl font-bold text-brand-primary">{jobs.length}</h3>
          </div>
          <p className="text-[13px] text-text-muted mt-2">All time job postings</p>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Briefcase size={16}/></div>
            <span className="text-[13px] font-bold text-text-main">Active Jobs</span>
          </div>
          <div className="flex items-end gap-2 my-2">
            <h3 className="text-4xl font-bold text-green-600">{jobs.filter(j => j.status === 'open').length}</h3>
          </div>
          <p className="text-[13px] text-text-muted mt-2">Currently accepting applications</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center"><Briefcase size={16}/></div>
            <span className="text-[13px] font-bold text-text-main">Closed Jobs</span>
          </div>
          <div className="flex items-end gap-2 my-2">
            <h3 className="text-4xl font-bold text-slate-600">{jobs.filter(j => j.status === 'closed').length}</h3>
          </div>
          <p className="text-[13px] text-text-muted mt-2">Past job postings</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm">
            <h3 className="text-lg font-bold text-text-main mb-6">Job Categories</h3>
            {jobs.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-4">Belum ada data kategori</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(
                  jobs.reduce((acc, job) => {
                    const cat = job.category_id || 'Other';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([name, count]) => {
                  const percentage = Math.round((count / jobs.length) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-[13px] font-semibold mb-2">
                        <span className="capitalize">{name}</span>
                        <span className="text-brand-primary">{percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-canvas-base rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-text-muted mt-6">Data based on your current active and past job postings.</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-border-ghost/20 shadow-sm flex items-start gap-4">
            <div className="text-brand-primary mt-1"><Zap size={24}/></div>
            <div>
              <h4 className="font-bold text-[14px] mb-1">AI Recommendation</h4>
              <p className="text-[13px] text-text-muted leading-relaxed mb-3">Posting jobs with complete descriptions and clear requirements increases top-tier applicant matching by 45%.</p>
              <button onClick={openCreateJob} className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">Create New Job →</button>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-border-ghost/20 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border-ghost/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-main">Recent Job Postings</h3>
              <button onClick={() => navigate('/hrd-dashboard/job_postings')} className="text-[13px] font-medium text-brand-primary hover:underline">View All Jobs</button>
            </div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm flex-1 flex items-center justify-center">Belum ada lowongan pekerjaan yang diposting.</div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50/50 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Job Title</th>
                      <th className="px-6 py-4">Job Type</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-ghost/10">
                    {jobs.slice(0, 5).map(job => (
                      <tr key={job.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewJobDetail(job)}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-text-main">{job.title}</div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{job.job_type}</td>
                        <td className="px-6 py-4 text-text-muted">{job.location_type}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold px-2.5 py-1 rounded-md text-[10px] uppercase ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-right"><ChevronRight size={16} className="inline"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
        <button onClick={openCreateJob} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 shadow-ambient">
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
          <button onClick={openCreateJob} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm">Post a Job</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="bg-white border border-border-ghost/20 rounded-[20px] p-6 flex justify-between items-center hover:shadow-sm transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg">{job.title}</h4>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">{job.status}</span>
                </div>
                <div className="text-[13px] text-text-muted">{job.job_type} • {job.experience_level} • {job.location_type}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleViewJobDetail(job)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                  View Detail
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-white border border-border-ghost/20 rounded-[20px] text-slate-500">
              {searchQuery ? 'Tidak ada pekerjaan yang cocok dengan pencarian Anda.' : 'Belum ada pekerjaan yang dibuat.'}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus lowongan ini?")) return;
    try {
      const res = await fetchWithAuth(`/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchJobs();
        navigate('/hrd-dashboard/job_postings');
      } else {
        alert('Gagal menghapus lowongan: ' + data.message);
      }
    } catch(e) { alert('Terjadi kesalahan jaringan'); }
  };

  const renderJobDetail = () => {
    if (!selectedJob) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-text-main mb-2">Memuat Data Pekerjaan</h2>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
            Sedang mengambil detail dan daftar pelamar terbaru...
          </p>
          <button onClick={() => navigate('/hrd-dashboard/job_postings')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            Batal
          </button>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <button onClick={() => navigate('/hrd-dashboard/job_postings')} className="hover:text-text-main">Job Postings</button>
          <ChevronRight size={14} />
          <span className="font-semibold text-brand-primary">{selectedJob.title}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">{selectedJob.title}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedJob.status === 'open' ? 'bg-purple-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                {selectedJob.status === 'open' ? 'ACTIVE' : 'CLOSED'}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-text-muted font-medium">
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
              navigate('/hrd-dashboard/create_job');
            }} className="px-5 py-2.5 bg-white border border-border-ghost/20 rounded-xl text-sm font-semibold text-text-main hover:bg-slate-50 transition-colors shadow-sm">
              Edit Posting
            </button>
            <button className="px-5 py-2.5 bg-white border border-border-ghost/20 rounded-xl text-sm font-semibold text-text-main hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Zap size={14}/> Share
            </button>
            <button onClick={() => handleDeleteJob(selectedJob.id)} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 shadow-ambient transition-colors">
              Delete Job
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-ambient transition-colors">
              Close Job
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">Total Applicants</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main">{selectedJob.applications ? selectedJob.applications.length : 0}</span>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-5 border border-border-ghost/20 shadow-sm">
            <h4 className="text-[13px] font-bold text-text-main mb-2">Job Status</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main capitalize">{selectedJob.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-border-ghost/20 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-ghost/20 flex justify-between items-center">
                <h3 className="font-bold text-text-main">Top Candidates</h3>
                <button className="text-[13px] font-bold text-indigo-600 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-border-ghost/10">
                {selectedJob.applications && selectedJob.applications.length > 0 ? [...selectedJob.applications].sort((a, b) => getMatchScore(b) - getMatchScore(a)).slice(0, 3).map((app, idx) => (
                  <div key={app.id || app.application_id || idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-border-ghost/20 bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden shrink-0">
                        {app.avatar_url || app.avatarUrl || app.profile?.avatarUrl || app.Profile?.avatarUrl ? (
                           <img src={app.avatar_url || app.avatarUrl || app.profile?.avatarUrl || app.Profile?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           (app.full_name || app.name || app.applicant_name || app.fullName || '?').charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[14px] text-text-main">{app.full_name || app.name || app.applicant_name || app.fullName || 'Pelamar Tanpa Nama'}</h4>
                        <p className="text-[12px] text-text-muted leading-tight mt-0.5">{app.email || app.applicant_email || 'Email tidak tersedia'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select 
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
                          app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        value={app.status || 'pending'}
                        onChange={(e) => handleUpdateApplicationStatus(app.application_id || app.id, e.target.value)}
                      >
                        <option value="pending" className="text-slate-700">PENDING</option>
                        <option value="accepted" className="text-slate-700">ACCEPTED</option>
                        <option value="rejected" className="text-slate-700">REJECTED</option>
                      </select>
                      <button onClick={() => setReviewCandidate(app)} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-1.5 rounded-full">
                        Review CV
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[13px] text-text-muted">
                    Belum ada pelamar untuk posisi ini.
                  </div>
                )}
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
        </div>
      </div>
    );
  };

  const renderCreateJob = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-10">
        <button onClick={() => navigate('/hrd-dashboard/job_postings')} className="text-text-muted hover:text-text-main text-sm font-medium mb-4 flex items-center gap-1">← Back to Postings</button>
        <h2 className="text-[40px] font-medium text-text-main tracking-tight leading-tight">
          {editingJob ? 'Edit' : 'Post a'} <span className="text-indigo-600">{editingJob ? 'Position' : 'New Position'}</span>
        </h2>
        <p className="text-text-muted text-[15px] mt-2 max-w-xl">
          Define the role, requirements, and let Pelet match you with the top 1% of talent in our global network.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <form onSubmit={handleJobSubmit} className="flex-1 space-y-8">
          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Job Title</label>
            <input 
              type="text" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}
              className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              placeholder="e.g. Senior Full Stack Engineer"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Description</label>
            <textarea 
              rows="6" required value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}
              className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
              placeholder="Describe the mission, the impact, and the day-to-day responsibilities..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Job Type</label>
                <select value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
             </div>
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Experience Level</label>
                <select value={jobForm.experienceLevel} onChange={e => setJobForm({...jobForm, experienceLevel: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600">
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Manager</option>
                </select>
             </div>
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Location Type</label>
                <select value={jobForm.locationType} onChange={e => setJobForm({...jobForm, locationType: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600">
                  <option value="onsite">On-Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
             </div>
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Category</label>
                <select value={jobForm.categoryId} onChange={e => setJobForm({...jobForm, categoryId: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600">
                  <option value="cat-tech01">Programmer / Technology (cat-tech01)</option>
                  <option value="cat-design01">Design (cat-design01)</option>
                  <option value="cat-marketing01">Marketing (cat-marketing01)</option>
                  <option value="cat-management01">Management (cat-management01)</option>
                  <option value="other">Other</option>
                </select>
             </div>
             <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-3">Status</label>
                <select value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})} className="w-full bg-white border border-border-ghost/40 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-indigo-600">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => navigate('/hrd-dashboard/job_postings')} className="text-sm font-bold text-text-main hover:text-text-muted">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[15px] font-bold shadow-ambient hover:-translate-y-0.5 transition-all">
              {editingJob ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </form>

        <div className="w-[300px] shrink-0">
          <div className="bg-[#f8f9fc] rounded-[20px] p-6 border border-border-ghost/10">
            <h4 className="font-bold mb-4">Posting Tips</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-indigo-600 bg-purple-100 p-2 rounded-lg shrink-0 h-min"><Zap size={16}/></div>
                <div>
                  <h5 className="font-bold text-[13px] mb-1">Be Specific</h5>
                  <p className="text-[12px] text-text-muted">Clearly define the tech stack to reduce irrelevant applications by 40%.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-indigo-600 bg-purple-100 p-2 rounded-lg shrink-0 h-min"><Star size={16}/></div>
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

  const renderProfile = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-[32px] font-bold text-text-main tracking-tight leading-tight">Company Profile</h2>
        <p className="text-text-muted text-[15px] mt-1">Update your HR administrator details and company information.</p>
      </div>
      
      <div className="bg-white p-8 rounded-[24px] shadow-sm border border-border-ghost/20">
        <h2 className="text-lg font-bold text-text-main mb-6">Edit Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-text-main mb-2">Full Name</label>
              <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-text-main mb-2">Phone Number</label>
              <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-text-main mb-2">Address</label>
            <input type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-text-main mb-2">Avatar URL</label>
            <input type="text" value={profileForm.avatarUrl} onChange={e => setProfileForm({...profileForm, avatarUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-text-main mb-2">Company Name</label>
              <input type="text" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" placeholder="PT Maju Jaya" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-text-main mb-2">Company Website</label>
              <input type="url" value={profileForm.companyWebsite} onChange={e => setProfileForm({...profileForm, companyWebsite: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-sm" placeholder="https://company.com" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-ambient hover:bg-indigo-700 transition-colors">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const filteredJobs = jobs.filter(j => 
    (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.location_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.job_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMatchScore = (app) => {
    if (!app) return 0;
    return app.match_score || app.matchScore || app.score || app.recommendation?.match_score || app.recommended_job?.match_score || app.JobSeeker?.match_score || 0;
  };

  const getAiAnalysis = (app) => {
    if (!app) return null;
    return app.ai_analysis || app.aiAnalysis || app.analysis || app.recommendation?.ai_analysis || app.recommended_job?.ai_analysis || app.JobSeeker?.ai_analysis || null;
  };

  const getCvUrl = (app) => {
    if (!app) return null;
    return app.file_url || app.fileUrl || app.resume_url || app.resumeUrl || app.document_url || app.documentUrl || app.cv_url || app.cvUrl || app.resume?.file_url || app.resume?.fileUrl || app.document?.file_url || null;
  };

  const formatBoldText = (text) => {
    if (typeof text !== 'string') return text;
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
    if (!text) return <p className="text-slate-500 italic">No detailed analysis provided.</p>;
    if (typeof text !== 'string') {
       try { text = JSON.stringify(text, null, 2); } catch(e) { text = String(text); }
    }
    return text.split('\n').map((line, i) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">{formatBoldText(trimmed.replace('### ', ''))}</h3>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3">{formatBoldText(trimmed.replace('## ', ''))}</h2>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={i} className="ml-5 list-disc mt-1 text-slate-700 leading-relaxed">{formatBoldText(trimmed.substring(2))}</li>;
      }
      if (trimmed.trim() === '---') {
        return <hr key={i} className="my-6 border-slate-200" />;
      }
      if (trimmed.trim() === '') {
        return <div key={i} className="h-2"></div>;
      }
      return <p key={i} className="mb-2 text-slate-700 leading-relaxed">{formatBoldText(trimmed)}</p>;
    });
  };

  return (
    <div className="flex h-screen bg-canvas-base font-sans overflow-hidden">
      {renderSidebar()}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white px-10 py-5 border-b border-border-ghost/20 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="relative w-96">
            {(activeView === 'job_postings' || activeView === 'job_detail') && (
              <>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search candidates, jobs..." 
                  className="w-full bg-slate-50 rounded-2xl pl-11 pr-4 py-2.5 text-sm border-none focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/hrd-dashboard/profile')}
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{hrProfile?.fullName || 'HR Recruiter'}</div>
                <div className="text-xs text-slate-500">{
                  (() => {
                    let d = hrProfile?.hrdData || hrProfile?.hrd_data || hrProfile?.hrData || {};
                    if (typeof d === 'string') try { d = JSON.parse(d); } catch(e) { d = {}; }
                    return d.companyName || d.company_name || hrProfile?.companyName || 'Company';
                  })()
                }</div>
              </div>
              <img src={hrProfile?.avatarUrl || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-[1000px] mx-auto">
            {activeView === 'dashboard' && renderDashboard()}
            
            {activeView === 'job_postings' && renderJobPostings()}
            {activeView === 'job_detail' && renderJobDetail()}
            {activeView === 'create_job' && renderCreateJob()}
            {activeView === 'profile' && renderProfile()}
          </div>
        </div>
      </main>

      {/* Review Candidate Modal */}
      {reviewCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-200">
                  {reviewCandidate.avatar_url || reviewCandidate.profile?.avatarUrl ? (
                    <img src={reviewCandidate.avatar_url || reviewCandidate.profile?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                      {(reviewCandidate.full_name || reviewCandidate.profile?.fullName || 'C')[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {reviewCandidate.full_name || reviewCandidate.profile?.fullName || 'Candidate Profile'}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">


                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getCvUrl(reviewCandidate) && (
                  <button 
                    onClick={() => window.open(getCvUrl(reviewCandidate), '_blank')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                  >
                    View CV PDF
                  </button>
                )}
                <button onClick={() => setReviewCandidate(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 bg-slate-100 flex flex-col min-h-[60vh]">
              {getCvUrl(reviewCandidate) ? (
                <iframe 
                  src={getCvUrl(reviewCandidate)} 
                  className="w-full h-full flex-1 border-0" 
                  title="Candidate CV"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="font-medium">File CV tidak tersedia untuk kandidat ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrdDashboard;
