import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, UserCheck, Globe, Calendar, Phone, MapPin, Clock } from 'lucide-react';
import { kycApi } from '../../api/kyc';
import { useUser } from '../../contexts/UserContext';

export const KycLevel1Card: React.FC = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    full_legal_name: '',
    date_of_birth: '',
    phone_number: '',
    residential_address: '',
    nationality: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // STRICT Level 1 Check: Case-insensitive and mapped strictly to user.kycLevel
  const isVerified = user.kycLevel?.toUpperCase() === 'VERIFIED';
  const isPending = user.kycLevel?.toUpperCase() === 'PENDING' || successMsg !== null;
  const kycStatus = isVerified ? 'VERIFIED' : isPending ? 'PENDING' : 'UNVERIFIED';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await kycApi.submitLevel1(formData);
      if (res.success) {
        setSuccessMsg('KYC Level 1 submitted successfully! Under review.');
        window.dispatchEvent(new CustomEvent('oriviant_refresh_wallets')); 
        setTimeout(() => window.location.reload(), 1500); // Reload to immediately sync global state
      } else {
        setErrorMsg(res.error || 'Failed to submit KYC application.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-app pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-app">Identity Verification (KYC Level 1)</h2>
            <p className="text-xs text-app-sec">Complete basic verification to unlock platform features and trading limits.</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-black rounded-xl ${
          kycStatus === 'VERIFIED' 
            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
            : kycStatus === 'PENDING'
            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
        }`}>
          {kycStatus === 'VERIFIED' ? 'VERIFIED' : kycStatus === 'PENDING' ? 'PENDING REVIEW' : 'UNVERIFIED'}
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {kycStatus === 'PENDING' ? (
        <div className="p-6 rounded-2xl bg-app-sub/40 border border-app text-center space-y-3">
          <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-app">Level 1 Application Under Review</h3>
          <p className="text-xs text-app-sec max-w-md mx-auto">
            Your verification details are currently being reviewed by our compliance team. You will be notified once approved.
          </p>
        </div>
      ) : kycStatus === 'VERIFIED' ? (
        <div className="p-6 rounded-2xl bg-app-sub/40 border border-app text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-app">KYC Level 1 Verified</h3>
          <p className="text-xs text-app-sec max-w-md mx-auto">
            Your identity has been successfully verified. Standard deposit and trading limits are unlocked.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Full Legal Name (as on ID)</label>
              <input
                type="text"
                name="full_legal_name"
                value={formData.full_legal_name}
                onChange={handleChange}
                placeholder="Enter your full legal name"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Enter your nationality"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Residential Address</label>
            <input
              type="text"
              name="residential_address"
              value={formData.residential_address}
              onChange={handleChange}
              placeholder="Enter your full residential address, city and state."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Level 1 Verification</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};