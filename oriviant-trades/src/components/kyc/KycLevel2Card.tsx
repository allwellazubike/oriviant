import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, FileText, Camera, UploadCloud, Clock } from 'lucide-react';
import { kycApi } from '../../api/kyc';
import { useUser } from '../../contexts/UserContext';

export const KycLevel2Card: React.FC = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    occupation: '',
    id_document_type: 'Passport',
    id_document_number: '',
    source_of_funds: '',
    source_of_wealth: '',
    tax_id: ''
  });

  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // STRICT Level 2 Check: Maps directly to user.kycLevel2 ONLY to prevent bleeding from Level 1
  const isLevel2Verified = user.kycLevel2?.toUpperCase() === 'VERIFIED';
  const isPending = user.kycLevel2?.toUpperCase() === 'PENDING' || successMsg !== null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'front' | 'back' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === 'front') setDocumentFront(file);
      if (fileType === 'back') setDocumentBack(file);
      if (fileType === 'selfie') setSelfie(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFront || !selfie) {
      setErrorMsg('Please upload both your Front ID document and a Selfie.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = new FormData();
      data.append('occupation', formData.occupation);
      data.append('id_document_type', formData.id_document_type);
      data.append('id_document_number', formData.id_document_number);
      data.append('source_of_funds', formData.source_of_funds);
      data.append('source_of_wealth', formData.source_of_wealth);
      data.append('tax_id', formData.tax_id);
      
      data.append('documentFront', documentFront);
      if (documentBack) data.append('documentBack', documentBack);
      data.append('selfie', selfie);

      const res = await kycApi.submitLevel2(data);
      if (res.success) {
        setSuccessMsg('KYC Level 2 submitted successfully! Under compliance review.');
        window.dispatchEvent(new CustomEvent('oriviant_refresh_wallets'));
        setTimeout(() => window.location.reload(), 1500); // Reload to immediately sync global state
      } else {
        setErrorMsg(res.error || 'Failed to submit Level 2 verification.');
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-app">Advanced Compliance (KYC Level 2)</h2>
            <p className="text-xs text-app-sec">Submit documents and financial details to unlock high limits and fiat off-ramping.</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-black rounded-xl ${
          isLevel2Verified 
            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
            : isPending
            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30'
        }`}>
          {isLevel2Verified ? 'VERIFIED' : isPending ? 'PENDING REVIEW' : 'LOCKED / UNVERIFIED'}
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

      {isPending && !isLevel2Verified ? (
        <div className="p-6 rounded-2xl bg-app-sub/40 border border-app text-center space-y-3">
          <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-app">Level 2 Application Under Review</h3>
          <p className="text-xs text-app-sec max-w-md mx-auto">
            Your identity documents and financial compliance details are being reviewed. This usually takes between 24 to 48 hours.
          </p>
        </div>
      ) : isLevel2Verified ? (
        <div className="p-6 rounded-2xl bg-app-sub/40 border border-app text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-app">KYC Level 2 Fully Verified</h3>
          <p className="text-xs text-app-sec max-w-md mx-auto">
            Your enterprise verification is complete. Maximum trading limits and fiat off-ramps are unlocked.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Software Engineer, Trader"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">ID Document Type</label>
              <select
                name="id_document_type"
                value={formData.id_document_type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              >
                <option value="Passport">International Passport</option>
                <option value="DriversLicense">Driver's License</option>
                <option value="NationalId">National Identity Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">ID Document Number</label>
              <input
                type="text"
                name="id_document_number"
                value={formData.id_document_number}
                onChange={handleChange}
                placeholder="Enter document ID number"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Source of Funds</label>
              <input
                type="text"
                name="source_of_funds"
                value={formData.source_of_funds}
                onChange={handleChange}
                placeholder="e.g. Salary, Business, Investments"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Source of Wealth (Optional)</label>
              <input
                type="text"
                name="source_of_wealth"
                value={formData.source_of_wealth}
                onChange={handleChange}
                placeholder="e.g. Real Estate, Savings"
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Tax ID / TIN (Optional)</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                placeholder="Enter Tax Identification Number"
                className="w-full px-3 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-app-sub border border-app space-y-2">
              <label className="block text-xs font-bold text-app flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-accent" /> ID Front Scan *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'front')}
                required
                className="w-full text-xs text-app-sec file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
              {documentFront && <p className="text-[10px] text-emerald-500 font-bold">Selected: {documentFront.name}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-app-sub border border-app space-y-2">
              <label className="block text-xs font-bold text-app flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-accent" /> ID Back Scan (Opt.)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'back')}
                className="w-full text-xs text-app-sec file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
              {documentBack && <p className="text-[10px] text-emerald-500 font-bold">Selected: {documentBack.name}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-app-sub border border-app space-y-2">
              <label className="block text-xs font-bold text-app flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-accent" /> Selfie / Liveness *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'selfie')}
                required
                className="w-full text-xs text-app-sec file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
              />
              {selfie && <p className="text-[10px] text-emerald-500 font-bold">Selected: {selfie.name}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Level 2 Verification</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};