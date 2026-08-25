import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Sparkles, Users, Award, ChevronRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { apiClient } from '../../api/client';

export const ReferralView: React.FC = () => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [referralUrl, setReferralUrl] = useState('');

  // Dynamically generate the link based on localhost or live domain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin; // Gets http://localhost:3000 or your real domain
      setReferralUrl(`${baseUrl}?ref=${user.referralCode || 'PENDING'}`);
    }
  }, [user.referralCode]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient<any>('/auth/referrals');
        if (res.success && res.data?.leaderboard) {
          setLeaderboard(res.data.leaderboard);
        }
      } catch(err) {}
    };
    fetchStats();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Fallback leaderboard if there isn't enough database data yet
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : [
    { nickname: 'CryptoWhale_Official', total_referrals: 1420, referral_earnings_usdt: 48950.00 },
    { nickname: 'AlphaTrader_Club', total_referrals: 980, referral_earnings_usdt: 32140.50 },
    { nickname: `${user.nickname} (You)`, total_referrals: user.totalReferrals, referral_earnings_usdt: user.referralEarningsUsdt },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Referral Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white shadow-xl space-y-3">
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold inline-flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5" /> ORIVIANT AFFILIATE PROGRAM
        </span>
        <h1 className="text-2xl sm:text-4xl font-black">Invite Friends & Earn 40% Commission</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Get paid lifetime trading fee rebates every time your invited friends trade Spot or Futures.
        </p>
      </div>

      {/* Unique Invite Link Box */}
      <div className="p-6 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-app">Your Personal Referral Link & Code</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full bg-app-sec border border-app rounded-xl px-4 py-3 text-xs font-mono text-app truncate">
            {referralUrl || 'Loading link...'}
          </div>
          <button
            onClick={handleCopy}
            disabled={!referralUrl}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Referral Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm">
          <span className="text-xs font-semibold text-app-sec block mb-1">Total Invited Friends</span>
          <div className="text-3xl font-black text-app">{user.totalReferrals}</div>
          <p className="text-[10px] text-app-sec mt-1">KYC Level 2 verified users</p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm">
          <span className="text-xs font-semibold text-app-sec block mb-1">Total Commission Earned</span>
          <div className="text-3xl font-black text-emerald-500">
            ${user.referralEarningsUsdt.toLocaleString()} USDT
          </div>
          <p className="text-[10px] text-app-sec mt-1">Paid automatically in real-time</p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm">
          <span className="text-xs font-semibold text-app-sec block mb-1">Current Rebate Tier</span>
          <div className="text-3xl font-black text-purple-500">40%</div>
          <p className="text-[10px] text-app-sec mt-1">VIP Tier 3 Affiliate Partner</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-app flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> Top Referral Earners This Month
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2">Rank</th>
                <th className="py-2">User / Partner</th>
                <th className="py-2">Invited Friends</th>
                <th className="py-2 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs font-medium">
              {displayLeaderboard.map((row, idx) => (
                <tr key={idx} className="hover:bg-app-sec/40 transition-colors">
                  <td className="py-3 font-bold text-app">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 font-extrabold text-app">{row.nickname}</td>
                  <td className="py-3 text-app-sec">{row.total_referrals} Users</td>
                  <td className="py-3 text-right font-black text-emerald-500">
                    ${Number(row.referral_earnings_usdt).toLocaleString()} USDT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};