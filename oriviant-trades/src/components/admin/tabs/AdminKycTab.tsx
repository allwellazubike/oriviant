import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Loader2, CheckCircle2, XCircle, Clock, Eye, AlertCircle, ExternalLink } from 'lucide-react';
import { adminApi } from '../../../api/admin';

export const AdminKycTab: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getKycApplications(statusFilter);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch KYC apps', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await adminApi.approveKyc(id);
      if (res.success) {
        setSelectedApp(null);
        setApplications((prev) => 
          prev.map((app) => app.id === id ? { ...app, status: 'APPROVED' } : app)
        );
      }
    } catch (err) {
      console.error('Failed to approve', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await adminApi.rejectKyc(id, rejectReason);
      if (res.success) {
        setSelectedApp(null);
        setRejectReason('');
        setApplications((prev) => 
          prev.map((app) => app.id === id ? { ...app, status: 'REJECTED' } : app)
        );
      }
    } catch (err) {
      console.error('Failed to reject', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApps = applications.filter((app) => 
    app.email.toLowerCase().includes(search.toLowerCase()) || 
    app.full_legal_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-app">KYC Verification Center</h1>
          <p className="text-sm text-app-sec">Review and manage user identity applications (Level 1 & Level 2).</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-sec" />
            <input
              type="text"
              placeholder="Search email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-app-card border border-app text-sm text-app focus:outline-none focus:border-accent w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-app-card border border-app text-sm font-bold text-app focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Applications</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-app-card rounded-2xl border border-app overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-app-sub/50 border-b border-app text-xs font-bold text-app-sec uppercase">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Level Requested</th>
                <th className="px-6 py-4">Nationality</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-app-sec font-medium">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-app-sub/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-app truncate">{app.full_legal_name}</div>
                      <div className="text-xs text-app-sec truncate">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400">
                      {app.current_level === 'LEVEL_1' ? 'Level 1 Basic' : 'Level 2 Enterprise'}
                    </td>
                    <td className="px-6 py-4 text-app-sec font-medium">{app.nationality}</td>
                    <td className="px-6 py-4 text-app-sec text-xs font-mono">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full flex items-center gap-1 w-max ${
                        app.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-500' :
                        app.status === 'REJECTED' ? 'bg-red-500/15 text-red-500' :
                        'bg-amber-500/15 text-amber-500'
                      }`}>
                        {app.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-app-card w-full max-w-2xl rounded-3xl border border-app shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-app flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-app">
                    Review {selectedApp.current_level === 'LEVEL_2' ? 'KYC Level 2' : 'KYC Level 1'} Application
                  </h2>
                  <p className="text-xs text-app-sec">User ID: {selectedApp.user_id}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedApp(null); setRejectReason(''); }} className="p-2 text-app-sec hover:text-app cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-app-sub/40 border border-app space-y-1">
                  <span className="text-[10px] uppercase font-bold text-app-sec">Full Legal Name</span>
                  <p className="font-bold text-app">{selectedApp.full_legal_name}</p>
                </div>
                <div className="p-4 rounded-xl bg-app-sub/40 border border-app space-y-1">
                  <span className="text-[10px] uppercase font-bold text-app-sec">Date of Birth</span>
                  <p className="font-bold text-app">{selectedApp.date_of_birth ? new Date(selectedApp.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-app-sub/40 border border-app space-y-1">
                  <span className="text-[10px] uppercase font-bold text-app-sec">Phone Number</span>
                  <p className="font-mono text-app">{selectedApp.phone_number}</p>
                </div>
                <div className="p-4 rounded-xl bg-app-sub/40 border border-app space-y-1">
                  <span className="text-[10px] uppercase font-bold text-app-sec">Nationality</span>
                  <p className="font-bold text-app">{selectedApp.nationality}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-app-sub/40 border border-app space-y-1">
                <span className="text-[10px] uppercase font-bold text-app-sec">Residential Address</span>
                <p className="font-bold text-app">{selectedApp.residential_address}</p>
              </div>

              {/* Level 2 Specific Fields & Documents Inspection */}
              {selectedApp.current_level === 'LEVEL_2' && (
                <div className="space-y-4 pt-2 border-t border-app">
                  <h3 className="text-xs font-black uppercase text-accent tracking-wider">Advanced Compliance & Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-app-sub/40 border border-app">
                      <span className="text-[10px] uppercase font-bold text-app-sec">Occupation</span>
                      <p className="text-xs font-bold text-app">{selectedApp.occupation || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-app-sub/40 border border-app">
                      <span className="text-[10px] uppercase font-bold text-app-sec">ID Type & Number</span>
                      <p className="text-xs font-bold text-app">{selectedApp.id_document_type}: {selectedApp.id_document_number || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-app-sub/40 border border-app">
                      <span className="text-[10px] uppercase font-bold text-app-sec">Source of Funds</span>
                      <p className="text-xs font-bold text-app">{selectedApp.source_of_funds || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {selectedApp.id_document_front_url && (
                      <a href={selectedApp.id_document_front_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-accent/10 text-accent font-bold text-xs flex items-center gap-1.5 hover:bg-accent/20 transition-colors">
                        View Front ID <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedApp.id_document_back_url && (
                      <a href={selectedApp.id_document_back_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-accent/10 text-accent font-bold text-xs flex items-center gap-1.5 hover:bg-accent/20 transition-colors">
                        View Back ID <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedApp.selfie_url && (
                      <a href={selectedApp.selfie_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-accent/10 text-accent font-bold text-xs flex items-center gap-1.5 hover:bg-accent/20 transition-colors">
                        View Selfie <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selectedApp.status === 'PENDING' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                  <label className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Rejection Reason (If denying)
                  </label>
                  <input 
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Invalid document scan, name mismatch..."
                    className="w-full px-3 py-2 rounded-lg bg-app-card border border-red-500/30 text-sm text-app focus:outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            {selectedApp.status === 'PENDING' && (
              <div className="p-6 border-t border-app bg-app-sub/20 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReject(selectedApp.id)}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Reject Application'}
                </button>
                <button
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve & Verify'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};