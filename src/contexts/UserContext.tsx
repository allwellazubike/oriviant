import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOverlayRegistration } from '../utils/OverlayRegistry';
import { WalletAsset } from '../types';
import { INITIAL_WALLET_ASSETS } from '../mockData';
import { apiClient } from '../api/client';
import { authApi } from '../api/auth';
import { walletApi } from '../api/wallet';
import { depositApi } from '../api/deposits';
import { withdrawalApi } from '../api/withdrawals';
import {
  WalletAssetDetail,
  DepositRecord,
  WithdrawalRecord,
  InternalTransferRecord,
  AddressBookItem,
  UserSecurityState,
  AdminAuditRecord,
  DepositStatus,
  WithdrawalStatus,
  WalletSubAccount,
  LoginHistoryItem
} from '../types/wallet';
import {
  INITIAL_WALLET_ASSETS_DETAIL,
  INITIAL_ADDRESS_BOOK,
  INITIAL_SECURITY_STATE
} from '../data/walletData';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  kycLevel: 'Level 1 Basic' | 'Level 2 Verified' | 'VIP Enterprise';
  is2FAEnabled: boolean;
  referralCode: string;
  vipLevel: number;
  totalReferrals: number;
  referralEarningsUsdt: number;
  isAdmin: boolean;
}

interface UserContextType {
  isLoggedIn: boolean;
  user: UserProfile;
  walletAssets: WalletAsset[];
  walletDetails: WalletAssetDetail[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  internalTransfers: InternalTransferRecord[];
  addressBook: AddressBookItem[];
  securityState: UserSecurityState;
  auditLogs: AdminAuditRecord[];
  
  fetchLiveWallets: () => Promise<void>;
  fetchLiveTransactions: () => Promise<void>;
  submitDeposit: (assetSymbol: string, amount: number, network: string) => DepositRecord;
  submitWithdrawal: (
    assetSymbol: string, amount: number, network: string, recipientAddress: string, nickname?: string, verificationCode?: string
  ) => { success: boolean; record?: WithdrawalRecord; error?: string };
  
  // Synchronous boolean return type to match TransferModalProps expectations
  executeInternalTransfer: (assetSymbol: string, amount: number, from: WalletSubAccount, to: WalletSubAccount) => boolean;

  addAddressBookItem: (asset: string, network: string, nickname: string, address: string, isWhitelisted?: boolean) => void;
  deleteAddressBookItem: (id: string) => void;
  toggleAddressWhitelist: (id: string) => void;
  toggleAddressFavorite: (id: string) => void;

  updateAntiPhishingCode: (code: string) => void;
  removeTrustedDevice: (deviceId: string) => void;
  toggleWalletFreeze: (freeze: boolean, adminReason?: string) => void;
  toggleWithdrawalsLock: (lock: boolean, adminReason?: string) => void;

  updateDepositStatus: (id: string, newStatus: DepositStatus, notes?: string, adminEmail?: string) => void;
  updateWithdrawalStatus: (id: string, newStatus: WithdrawalStatus, txHash?: string, notes?: string, adminEmail?: string) => void;
  adjustUserAssetBalance: (symbol: string, amountChange: number, subAccount: WalletSubAccount, adminEmail: string, reason: string) => void;

  depositAsset: (symbol: string, amount: number) => void;
  withdrawAsset: (symbol: string, amount: number, address: string) => boolean;
  transferAsset: (symbol: string, amount: number, from: string, to: string) => void;

  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp';
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot' | 'pin' | 'otp') => void;
  closeAuthModal: () => void;
  
  isSignOutModalOpen: boolean;
  openSignOutModal: () => void;
  closeSignOutModal: () => void;
  confirmLogout: () => void;
  logout: () => void;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  registerAccount: (userData: Record<string, string>) => Promise<boolean>;
  triggerSessionExpired: () => void;
  updateProfile: (nickname: string) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (avatarDataUri: string) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const auth = localStorage.getItem('oriviant_authenticated');
    const remember = localStorage.getItem('oriviant_remember_me');
    if (auth === 'false') return false;
    if (auth === 'true' || remember === 'true') return true;
    return false; 
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot' | 'pin' | 'otp'>('login');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    id: '',
    email: '',
    nickname: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    kycLevel: 'Level 1 Basic',
    is2FAEnabled: false,
    referralCode: '',
    vipLevel: 0,
    totalReferrals: 0,
    referralEarningsUsdt: 0,
    isAdmin: false
  });

  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>(INITIAL_WALLET_ASSETS);
  const [walletDetails, setWalletDetails] = useState<WalletAssetDetail[]>(INITIAL_WALLET_ASSETS_DETAIL);

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [internalTransfers, setInternalTransfers] = useState<InternalTransferRecord[]>([]);
  const [addressBook, setAddressBook] = useState<AddressBookItem[]>(INITIAL_ADDRESS_BOOK);
  const [securityState, setSecurityState] = useState<UserSecurityState>(INITIAL_SECURITY_STATE);
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([]);

  const fetchLiveWallets = useCallback(async () => {
    try {
      const res = await walletApi.getWallets();
      const walletsData = (res as any).data || (res as any).wallets || []; 
      
      if (res.success) {
        setWalletDetails((prev: WalletAssetDetail[]) =>
          prev.map((asset: WalletAssetDetail) => {
            const assetWallets = walletsData.filter((w: any) => w.asset_symbol === asset.symbol);
            if (assetWallets.length > 0) {
              const spotW = assetWallets.find((w: any) => w.wallet_type === 'spot' || !w.wallet_type) || { balance: 0, locked: 0 };
              const futW = assetWallets.find((w: any) => w.wallet_type === 'futures') || { balance: 0, locked: 0 };
              const funW = assetWallets.find((w: any) => w.wallet_type === 'funding') || { balance: 0, locked: 0 };

              return {
                ...asset,
                spotBalance: Number(spotW.balance) || 0,
                lockedBalance: Number(spotW.locked) || 0,
                availableBalance: Math.max(0, Number(spotW.balance) - Number(spotW.locked)),
                futuresBalance: Number(futW.balance) || 0,
                fundingBalance: Number(funW.balance) || 0,
              };
            }
            return { ...asset, spotBalance: 0, lockedBalance: 0, availableBalance: 0, futuresBalance: 0, fundingBalance: 0 };
          })
        );
      }
    } catch (err) {
      console.error('Failed to load live wallets from backend:', err);
    }
  }, []);

  const fetchLiveTransactions = useCallback(async () => {
    try {
      const [depRes, wthRes, ledRes] = await Promise.all([
        depositApi.getDeposits().catch(() => ({ success: false, data: null })),
        withdrawalApi.getWithdrawals().catch(() => ({ success: false, data: null })),
        walletApi.getLedger().catch(() => ({ success: false, data: null }))
      ]);

      if (depRes && (depRes as any).success !== false) {
        const rawDeps = (depRes as any).data || (depRes as any).deposits || [];
        if (Array.isArray(rawDeps)) {
          const mappedDeps: DepositRecord[] = rawDeps.map((d: any) => {
            const rawStatus = (d.status || '').toUpperCase();
            let statusVal: DepositStatus = 'Pending';
            if (['COMPLETED', 'SUCCESSFUL', 'APPROVED', 'SUCCESS'].includes(rawStatus)) statusVal = 'Completed';
            else if (['REJECTED', 'DENIED', 'FAILED'].includes(rawStatus)) statusVal = 'Rejected' as any;
            else if (['UNDER_REVIEW', 'REVIEW'].includes(rawStatus)) statusVal = 'Under Review' as any;

            return {
              id: `DEP-${d.id}`, userId: d.user_id?.toString() || '', userName: d.user_name || 'Trader', userEmail: d.user_email || '',
              asset: d.asset, amount: Number(d.amount_expected || d.amount || 0), usdValue: Number(d.amount_expected || d.amount || 0),
              network: d.network || 'TRC20', depositAddress: d.deposit_address || '', txHash: d.tx_hash || '',
              explorerUrl: '#', confirmations: statusVal === 'Completed' ? 12 : 1, requiredConfirmations: 12,
              status: statusVal, createdAt: d.created_at ? new Date(d.created_at).toISOString().replace('T', ' ').substring(0, 19) : '',
              updatedAt: d.updated_at ? new Date(d.updated_at).toISOString().replace('T', ' ').substring(0, 19) : '',
              notes: d.notes || 'Synced from database'
            };
          });
          setDeposits(mappedDeps);
        }
      }

      if (wthRes && (wthRes as any).success !== false) {
        const rawWths = (wthRes as any).data || (wthRes as any).withdrawals || [];
        if (Array.isArray(rawWths)) {
          const mappedWths: WithdrawalRecord[] = rawWths.map((w: any) => {
            const rawWthStatus = (w.status || '').toUpperCase();
            let wthStatusVal: WithdrawalStatus = 'Under Review';
            if (['COMPLETED', 'SUCCESSFUL', 'APPROVED', 'SUCCESS'].includes(rawWthStatus)) wthStatusVal = 'Completed';
            else if (['REJECTED', 'DENIED', 'FAILED'].includes(rawWthStatus)) wthStatusVal = 'Rejected' as any;
            else if (['PENDING'].includes(rawWthStatus)) wthStatusVal = 'Pending' as any;

            return {
              id: `WTH-${w.id}`, userId: w.user_id?.toString() || '', userName: w.user_name || 'Trader', userEmail: w.user_email || '',
              asset: w.asset, amount: Number(w.amount || 0), fee: Number(w.fee || 0), receiveAmount: Number(w.receive_amount || w.amount || 0),
              usdValue: Number(w.receive_amount || w.amount || 0), network: w.network || 'TRC20', recipientAddress: w.recipient_address || '',
              addressNickname: w.address_nickname || '', isWhitelisted: false, status: wthStatusVal,
              createdAt: w.created_at ? new Date(w.created_at).toISOString().replace('T', ' ').substring(0, 19) : '',
              updatedAt: w.updated_at ? new Date(w.updated_at).toISOString().replace('T', ' ').substring(0, 19) : '',
              notes: w.notes || 'Synced from database'
            };
          });
          setWithdrawals(mappedWths);
        }
      }

      if (ledRes && (ledRes as any).success !== false) {
        const rawLedger = (ledRes as any).data || (ledRes as any).ledger || [];
        if (Array.isArray(rawLedger)) {
          const mappedTransfers: InternalTransferRecord[] = rawLedger
            .filter((l: any) => l.reason === 'INTERNAL_TRANSFER' && Number(l.delta) > 0)
            .map((t: any) => ({
              id: `TRF-${t.id}`,
              asset: t.asset_symbol,
              amount: Number(t.delta),
              usdValue: Number(t.delta), 
              fromWallet: 'spot',
              toWallet: 'futures',
              status: 'Completed',
              createdAt: t.created_at ? new Date(t.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''
            }));
          setInternalTransfers(mappedTransfers);
        }
      }

    } catch (err) {
      console.error('Failed to sync live transactions from database:', err);
    }
  }, []);

  const fetchLoginHistory = useCallback(async () => {
    try {
      const res = await authApi.getLoginHistory();
      if (res.success && Array.isArray(res.data)) {
        const mapped: LoginHistoryItem[] = res.data.map((row) => ({
          id: `LOG-${row.id}`,
          loginTime: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19) : '',
          location: 'Unknown',
          browser: row.browser || 'Unknown',
          os: row.os || 'Unknown',
          device: row.device || 'Unknown',
          ip: row.ip_address || 'Unknown',
          status: row.status === 'Failed' ? 'Failed' : 'Success'
        }));
        setSecurityState((prev: UserSecurityState) => ({ ...prev, loginHistory: mapped }));
      }
    } catch (err) {
      console.error('Failed to load login history:', err);
    }
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchLiveWallets();
      fetchLiveTransactions();
    };
    window.addEventListener('oriviant_refresh_wallets', handleRefresh);
    return () => window.removeEventListener('oriviant_refresh_wallets', handleRefresh);
  }, [fetchLiveWallets, fetchLiveTransactions]);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('oriviant_token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const res = await apiClient<any>('/auth/me');
          const userData = res.user || res.data?.user || res.data;
          
          if (userData) {
            setUser((prev: UserProfile) => ({
              ...prev,
              id: userData.id?.toString() || prev.id,
              email: userData.email || prev.email,
              nickname: userData.nickname || userData.name || prev.nickname,
              avatar: userData.avatar_url || prev.avatar,
              isAdmin: userData.is_admin === true || userData.role === 'admin' || prev.isAdmin
            }));
            setIsLoggedIn(true);
            await Promise.all([fetchLiveWallets(), fetchLiveTransactions(), fetchLoginHistory()]);
          } else {
            confirmLogout();
          }
        } catch (err) {
          console.error('Session validation error:', err);
        }
      } else {
        setDeposits([]);
        setWithdrawals([]);
      }
    };
    validateSession();
  }, [fetchLiveWallets, fetchLiveTransactions, fetchLoginHistory]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      fetchLiveWallets();
      fetchLiveTransactions();
    }, 10000); 
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchLiveWallets, fetchLiveTransactions]);

  useEffect(() => {
    const fetchPricesForWallet = async () => {
      try {
        const res = await apiClient<any>('/markets/prices');
        if (res.success && res.data) {
          const marketData = Array.isArray(res.data) ? res.data : Object.values(res.data);
          
          setWalletDetails((prev: WalletAssetDetail[]) =>
            prev.map((asset: WalletAssetDetail) => {
              if (asset.symbol === 'USDT') return asset;
              const match = marketData.find(
                (c: any) =>
                  c?.symbol === `${asset.symbol}/USDT` ||
                  c?.symbol === asset.symbol ||
                  c?.id?.toLowerCase() === asset.symbol.toLowerCase()
              );
              if (match) {
                return {
                  ...asset,
                  priceUsdt: Number(match.price) || asset.priceUsdt,
                  change24h: Number(match.change24h) || asset.change24h
                };
              }
              return asset;
            })
          );
        }
      } catch (e) { }
    };
    fetchPricesForWallet();
    const interval = setInterval(fetchPricesForWallet, 30000);
    return () => clearInterval(interval);
  }, []);

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openSignOutModal = () => setIsSignOutModalOpen(true);
  const closeSignOutModal = () => setIsSignOutModalOpen(false);

  useOverlayRegistration('auth-modal', isAuthModalOpen, closeAuthModal);
  useOverlayRegistration('signout-modal', isSignOutModalOpen, closeSignOutModal);

  const logout = () => setIsSignOutModalOpen(true);

  const confirmLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('oriviant_authenticated', 'false');
    localStorage.removeItem('oriviant_token');
    localStorage.removeItem('oriviant_user_profile');
    try { sessionStorage.clear(); } catch (e) { }

    setDeposits([]);
    setWithdrawals([]);
    setInternalTransfers([]);
    setAddressBook(INITIAL_ADDRESS_BOOK);
    
    setIsSignOutModalOpen(false);
    window.dispatchEvent(new CustomEvent('oriviant_session_logout'));
  };

  const login = async (email: string, password?: string, rememberMe = true): Promise<boolean> => {
    try {
      const res = await apiClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password || '' })
      });
      
      const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
      const userData = res.user || res.data?.user || res.data;
      
      if (token && token !== 'undefined' && userData) {
        const updatedProfile = {
          ...user,
          id: userData.id?.toString() || '',
          email: userData.email || email,
          nickname: userData.nickname || userData.name || 'Trader',
          avatar: userData.avatar_url || user.avatar,
          isAdmin: userData.is_admin === true || userData.role === 'admin' || false
        };
        setUser(updatedProfile);
        setIsLoggedIn(true);

        await Promise.all([fetchLiveWallets(), fetchLiveTransactions(), fetchLoginHistory()]);

        localStorage.setItem('oriviant_authenticated', 'true');
        localStorage.setItem('oriviant_token', token);
        if (rememberMe) {
          localStorage.setItem('oriviant_remember_me', 'true');
        } else {
          localStorage.removeItem('oriviant_remember_me');
        }

        closeAuthModal();
        return true;
      }
      
      throw new Error(res.message || res.error || 'Server did not return a valid authentication token.');
    } catch (error: any) {
      console.error('Login Error Caught:', error);
      throw error; 
    }
  };

  const registerAccount = async (userData: Record<string, string>): Promise<boolean> => {
    try {
      const res = await apiClient<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          email: userData.email?.trim().toLowerCase()
        })
      });
      
      const token = res.token || res.accessToken || res.data?.token || res.data?.accessToken;
      const userObj = res.user || res.data?.user || res.data;
      
      if (token && token !== 'undefined' && userObj) {
        const updatedProfile = {
          ...user,
          id: userObj.id?.toString() || '',
          email: userObj.email || userData.email,
          nickname: userObj.nickname || userObj.name || 'Trader',
          avatar: userObj.avatar_url || user.avatar,
          isAdmin: userObj.is_admin === true || userObj.role === 'admin' || false
        };
        setUser(updatedProfile);
        setIsLoggedIn(true);

        await Promise.all([fetchLiveWallets(), fetchLiveTransactions(), fetchLoginHistory()]);

        localStorage.setItem('oriviant_authenticated', 'true');
        localStorage.setItem('oriviant_token', token);

        return true;
      }
      
      throw new Error(res.message || res.error || 'Registration failed.');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error; 
    }
  };

  const triggerSessionExpired = () => confirmLogout();

  const updateProfile = async (nickname: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.updateProfile(nickname);
      const userData = res.user;

      if (res.success && userData) {
        setUser((prev: UserProfile) => ({
          ...prev,
          nickname: userData.nickname || prev.nickname,
          avatar: userData.avatar_url || prev.avatar
        }));
        return { success: true };
      }

      return { success: false, error: res.message || res.error || 'Could not update profile.' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Could not update profile.' };
    }
  };

  const uploadAvatar = async (avatarDataUri: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.uploadAvatar(avatarDataUri);
      const userData = res.user;

      if (res.success && userData) {
        setUser((prev: UserProfile) => ({
          ...prev,
          avatar: userData.avatar_url || prev.avatar
        }));
        return { success: true };
      }

      return { success: false, error: res.message || res.error || 'Could not upload avatar.' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Could not upload avatar.' };
    }
  };

  const submitDeposit = (assetSymbol: string, amount: number, network: string): DepositRecord => {
    const asset = walletDetails.find((a: WalletAssetDetail) => a.symbol === assetSymbol) || walletDetails[0];
    const netInfo = asset.depositNetworks.find((n: any) => n.network === network) || asset.depositNetworks[0];

    const newDep: DepositRecord = {
      id: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id, userName: user.nickname, userEmail: user.email,
      asset: assetSymbol, amount, usdValue: amount * asset.priceUsdt, network,
      depositAddress: netInfo?.depositAddress || '',
      txHash: `0x${Math.random().toString(16).substring(2, 18)}`,
      explorerUrl: `https://etherscan.io/`,
      confirmations: 0, requiredConfirmations: netInfo?.requiredConfirmations || 12, 
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: `Awaiting admin compliance review`
    };

    setDeposits((prev: DepositRecord[]) => [newDep, ...prev]);
    return newDep;
  };

  const submitWithdrawal = (
    assetSymbol: string, amount: number, network: string, recipientAddress: string, nickname?: string, verificationCode?: string
  ): { success: boolean; record?: WithdrawalRecord; error?: string } => {
    if (securityState.isWalletFrozen) return { success: false, error: 'Your wallet is currently frozen by administration. Contact support.' };
    if (securityState.areWithdrawalsLocked) return { success: false, error: 'Withdrawals are currently locked on your account.' };

    const asset = walletDetails.find((a: WalletAssetDetail) => a.symbol === assetSymbol);
    if (!asset) return { success: false, error: 'Invalid asset.' };

    const netInfo = asset.withdrawalNetworks.find((n: any) => n.network === network) || asset.withdrawalNetworks[0];
    const fee = netInfo?.fee || 1.0;
    const totalRequired = amount;

    if (asset.spotBalance < totalRequired) return { success: false, error: `Insufficient Spot balance. Available: ${asset.spotBalance} ${assetSymbol}` };

    const receiveAmt = Math.max(0, amount - fee);
    const isWhitelisted = addressBook.some((item: AddressBookItem) => item.address.toLowerCase() === recipientAddress.toLowerCase() && item.isWhitelisted);

    setWalletDetails((prev: WalletAssetDetail[]) => prev.map((a: WalletAssetDetail) => a.symbol === assetSymbol ? { ...a, spotBalance: a.spotBalance - totalRequired, lockedBalance: a.lockedBalance + totalRequired } : a));

    const newWth: WithdrawalRecord = {
      id: `WTH-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id, userName: user.nickname, userEmail: user.email,
      asset: assetSymbol, amount, fee, receiveAmount: receiveAmt, usdValue: receiveAmt * asset.priceUsdt, network, recipientAddress,
      addressNickname: nickname || 'Saved Wallet', isWhitelisted, 
      status: 'Under Review',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: 'Standard security audit pending'
    };

    setWithdrawals((prev: WithdrawalRecord[]) => [newWth, ...prev]);
    return { success: true, record: newWth };
  };

  const executeInternalTransfer = (assetSymbol: string, amount: number, from: WalletSubAccount, to: WalletSubAccount): boolean => {
    if (from === to) return false;
    
    const cleanAsset = assetSymbol.split(' ')[0].toUpperCase();

    apiClient<{ success: boolean; message: string; error?: string }>('/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify({
        asset: cleanAsset,
        amount,
        from_type: from,
        to_type: to
      })
    })
      .then(async (res) => {
        if (res && res.success) {
          await fetchLiveWallets();
          await fetchLiveTransactions();
        } else {
          console.error('Transfer failed on server:', res?.error);
        }
      })
      .catch((err) => {
        console.error("Internal transfer network failed:", err);
      });

    setWalletDetails((prev: WalletAssetDetail[]) => prev.map((a: WalletAssetDetail) => {
      if (a.symbol !== cleanAsset) return a;
      let spot = a.spotBalance;
      let futures = a.futuresBalance;
      let funding = a.fundingBalance;

      if (from === 'spot') spot -= amount;
      if (from === 'futures') futures -= amount;
      if (from === 'funding') funding -= amount;

      if (to === 'spot') spot += amount;
      if (to === 'futures') futures += amount;
      if (to === 'funding') funding += amount;

      return { ...a, spotBalance: spot, futuresBalance: futures, fundingBalance: funding };
    }));

    return true;
  };

  const addAddressBookItem = (asset: string, network: string, nickname: string, address: string, isWhitelisted = false) => {
    const newItem: AddressBookItem = {
      id: `ADR-${Math.floor(1000 + Math.random() * 9000)}`, asset, network, nickname, address, isWhitelisted, isFavorite: false, createdAt: new Date().toISOString().substring(0, 10)
    };
    setAddressBook((prev: AddressBookItem[]) => [newItem, ...prev]);
  };

  const deleteAddressBookItem = (id: string) => setAddressBook((prev: AddressBookItem[]) => prev.filter((item: AddressBookItem) => item.id !== id));
  const toggleAddressWhitelist = (id: string) => setAddressBook((prev: AddressBookItem[]) => prev.map((item: AddressBookItem) => item.id === id ? { ...item, isWhitelisted: !item.isWhitelisted } : item));
  const toggleAddressFavorite = (id: string) => setAddressBook((prev: AddressBookItem[]) => prev.map((item: AddressBookItem) => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  const updateAntiPhishingCode = (code: string) => setSecurityState((prev: UserSecurityState) => ({ ...prev, antiPhishingCode: code }));
  const removeTrustedDevice = (deviceId: string) => setSecurityState((prev: UserSecurityState) => ({ ...prev, trustedDevices: prev.trustedDevices.filter((d: any) => d.id !== deviceId) }));

  const toggleWalletFreeze = (freeze: boolean, adminReason = 'Administrative compliance check') => {
    setSecurityState((prev: UserSecurityState) => ({ ...prev, isWalletFrozen: freeze }));
    setAuditLogs((prev: AdminAuditRecord[]) => [{
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`, adminEmail: 'admin.compliance@oriviant.io', actionType: 'WALLET_FREEZE', targetId: user.id, targetUser: user.nickname,
      oldStatus: freeze ? 'Unfrozen' : 'Frozen', newStatus: freeze ? 'Frozen' : 'Unfrozen', reason: adminReason, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, ...prev]);
  };

  const toggleWithdrawalsLock = (lock: boolean, adminReason = 'Withdrawal limit restriction') => setSecurityState((prev: UserSecurityState) => ({ ...prev, areWithdrawalsLocked: lock }));

  const updateDepositStatus = (id: string, newStatus: DepositStatus, notes?: string, adminEmail = 'admin@oriviant.io') => {
    setDeposits((prev: DepositRecord[]) => prev.map((dep: DepositRecord) => {
      if (dep.id !== id) return dep;
      if (dep.status !== 'Completed' && newStatus === 'Completed') {
        setWalletDetails((wb: WalletAssetDetail[]) => wb.map((a: WalletAssetDetail) => a.symbol === dep.asset ? { ...a, spotBalance: a.spotBalance + dep.amount } : a));
      }
      setAuditLogs((logs: AdminAuditRecord[]) => [{
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`, adminEmail, actionType: 'DEPOSIT_STATUS_CHANGE', targetId: id, targetUser: dep.userName,
        oldStatus: dep.status, newStatus, reason: notes || `Admin changed deposit status to ${newStatus}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }, ...logs]);
      return { ...dep, status: newStatus, notes: notes || dep.notes, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
    }));
  };

  const updateWithdrawalStatus = (id: string, newStatus: WithdrawalStatus, txHash?: string, notes?: string, adminEmail = 'admin@oriviant.io') => {
    setWithdrawals((prev: WithdrawalRecord[]) => prev.map((wth: WithdrawalRecord) => {
      if (wth.id !== id) return wth;
      const oldStatus = wth.status;
      if ((newStatus === 'Rejected' || newStatus === 'Cancelled' || newStatus === 'Failed') && oldStatus !== 'Rejected' && oldStatus !== 'Cancelled' && oldStatus !== 'Failed') {
        setWalletDetails((wb: WalletAssetDetail[]) => wb.map((a: WalletAssetDetail) => a.symbol === wth.asset ? { ...a, spotBalance: a.spotBalance + wth.amount, lockedBalance: Math.max(0, a.lockedBalance - wth.amount) } : a));
      }
      if (newStatus === 'Completed' && oldStatus !== 'Completed') {
        setWalletDetails((wb: WalletAssetDetail[]) => wb.map((a: WalletAssetDetail) => a.symbol === wth.asset ? { ...a, lockedBalance: Math.max(0, a.lockedBalance - wth.amount) } : a));
      }
      setAuditLogs((logs: AdminAuditRecord[]) => [{
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`, adminEmail, actionType: 'WITHDRAWAL_STATUS_CHANGE', targetId: id, targetUser: wth.userName, oldStatus, newStatus,
        reason: notes || `Admin updated withdrawal status to ${newStatus}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }, ...logs]);
      return { ...wth, status: newStatus, txHash: txHash || wth.txHash, notes: notes || wth.notes, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
    }));
  };

  const adjustUserAssetBalance = (symbol: string, amountChange: number, subAccount: WalletSubAccount, adminEmail: string, reason: string) => {
    setWalletDetails((prev: WalletAssetDetail[]) => prev.map((a: WalletAssetDetail) => {
      if (a.symbol !== symbol) return a;
      return {
        ...a,
        spotBalance: subAccount === 'spot' ? Math.max(0, a.spotBalance + amountChange) : a.spotBalance,
        futuresBalance: subAccount === 'futures' ? Math.max(0, a.futuresBalance + amountChange) : a.futuresBalance,
        fundingBalance: subAccount === 'funding' ? Math.max(0, a.fundingBalance + amountChange) : a.fundingBalance,
      };
    }));
    setAuditLogs((logs: AdminAuditRecord[]) => [{
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`, adminEmail, actionType: 'BALANCE_ADJUSTMENT', targetId: symbol, targetUser: user.nickname,
      oldStatus: 'Adjusting Balance', newStatus: `${amountChange > 0 ? '+' : ''}${amountChange} ${symbol} (${subAccount})`, reason, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, ...logs]);
  };

  const depositAsset = (symbol: string, amount: number) => submitDeposit(symbol, amount, 'TRC20');
  const withdrawAsset = (symbol: string, amount: number, address: string) => submitWithdrawal(symbol, amount, 'TRC20', address).success;
  const transferAsset = (symbol: string, amount: number) => executeInternalTransfer(symbol, amount, 'spot', 'futures');

  return (
    <UserContext.Provider
      value={{
        isLoggedIn, user, walletAssets, walletDetails, deposits, withdrawals, internalTransfers, addressBook, securityState, auditLogs,
        fetchLiveWallets, fetchLiveTransactions, submitDeposit, submitWithdrawal, executeInternalTransfer, addAddressBookItem, deleteAddressBookItem, toggleAddressWhitelist, toggleAddressFavorite,
        updateAntiPhishingCode, removeTrustedDevice, toggleWalletFreeze, toggleWithdrawalsLock, updateDepositStatus, updateWithdrawalStatus, adjustUserAssetBalance,
        depositAsset, withdrawAsset, transferAsset, isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal, isSignOutModalOpen, openSignOutModal, closeSignOutModal,
        confirmLogout, logout, login, registerAccount, triggerSessionExpired, updateProfile, uploadAvatar
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};