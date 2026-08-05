import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOverlayRegistration } from '../utils/OverlayRegistry';
import { WalletAsset } from '../types';
import { INITIAL_WALLET_ASSETS } from '../mockData';
import { useTrading } from './TradingContext';
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
  WalletSubAccount
} from '../types/wallet';
import {
  INITIAL_WALLET_ASSETS_DETAIL,
  INITIAL_DEPOSIT_RECORDS,
  INITIAL_WITHDRAWAL_RECORDS,
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
  
  // Fund Operations
  submitDeposit: (assetSymbol: string, amount: number, network: string) => DepositRecord;
  submitWithdrawal: (
    assetSymbol: string, 
    amount: number, 
    network: string, 
    recipientAddress: string,
    nickname?: string,
    verificationCode?: string
  ) => { success: boolean; record?: WithdrawalRecord; error?: string };
  executeInternalTransfer: (assetSymbol: string, amount: number, from: WalletSubAccount, to: WalletSubAccount) => boolean;

  // Address Book Operations
  addAddressBookItem: (asset: string, network: string, nickname: string, address: string, isWhitelisted?: boolean) => void;
  deleteAddressBookItem: (id: string) => void;
  toggleAddressWhitelist: (id: string) => void;
  toggleAddressFavorite: (id: string) => void;

  // Security Operations
  updateAntiPhishingCode: (code: string) => void;
  removeTrustedDevice: (deviceId: string) => void;
  toggleWalletFreeze: (freeze: boolean, adminReason?: string) => void;
  toggleWithdrawalsLock: (lock: boolean, adminReason?: string) => void;

  // Admin Portal Operations
  updateDepositStatus: (id: string, newStatus: DepositStatus, notes?: string, adminEmail?: string) => void;
  updateWithdrawalStatus: (id: string, newStatus: WithdrawalStatus, txHash?: string, notes?: string, adminEmail?: string) => void;
  adjustUserAssetBalance: (symbol: string, amountChange: number, subAccount: WalletSubAccount, adminEmail: string, reason: string) => void;

  // Backward compatibility stubs
  depositAsset: (symbol: string, amount: number) => void;
  withdrawAsset: (symbol: string, amount: number, address: string) => boolean;
  transferAsset: (symbol: string, amount: number, from: string, to: string) => void;

  // Auth Modal & State
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp';
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot' | 'pin' | 'otp') => void;
  closeAuthModal: () => void;
  
  // Sign Out Modal
  isSignOutModalOpen: boolean;
  openSignOutModal: () => void;
  closeSignOutModal: () => void;
  confirmLogout: () => void;
  logout: () => void;
  login: (email: string, rememberMe?: boolean) => void;
  triggerSessionExpired: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize session state based on Remember Me & Auth Token
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const auth = localStorage.getItem('oriviant_authenticated');
    const remember = localStorage.getItem('oriviant_remember_me');
    if (auth === 'false') return false;
    // If remember me was active or token exists
    if (auth === 'true' || remember === 'true') return true;
    return true; // Default active state for dev preview, can be toggled by sign out
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot' | 'pin' | 'otp'>('login');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'ORV-894102',
    email: 'trader.alex@oriviant.io',
    nickname: 'Alex_Vance_Oriviant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    kycLevel: 'Level 2 Verified',
    is2FAEnabled: true,
    referralCode: 'ORV-7790',
    vipLevel: 3,
    totalReferrals: 24,
    referralEarningsUsdt: 1840.50
  });

  const { coins } = useTrading();

  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>(INITIAL_WALLET_ASSETS);
  const [walletDetails, setWalletDetails] = useState<WalletAssetDetail[]>(INITIAL_WALLET_ASSETS_DETAIL);

  // Synchronize walletDetails prices with live market data from TradingContext
  useEffect(() => {
    if (!coins || coins.length === 0) return;
    setWalletDetails((prev) =>
      prev.map((asset) => {
        if (asset.symbol === 'USDT') return asset; // Stablecoin
        const match = coins.find(
          (c) =>
            c.symbol === `${asset.symbol}/USDT` ||
            c.symbol === asset.symbol ||
            c.id.toLowerCase() === asset.symbol.toLowerCase()
        );
        if (match) {
          return {
            ...asset,
            priceUsdt: match.price,
            change24h: match.change24h
          };
        }
        return asset;
      })
    );
  }, [coins]);

  const [deposits, setDeposits] = useState<DepositRecord[]>(INITIAL_DEPOSIT_RECORDS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(INITIAL_WITHDRAWAL_RECORDS);
  const [internalTransfers, setInternalTransfers] = useState<InternalTransferRecord[]>([]);
  const [addressBook, setAddressBook] = useState<AddressBookItem[]>(INITIAL_ADDRESS_BOOK);
  const [securityState, setSecurityState] = useState<UserSecurityState>(INITIAL_SECURITY_STATE);
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([
    {
      id: 'AUD-1001',
      adminEmail: 'admin.security@oriviant.io',
      actionType: 'WITHDRAWAL_STATUS_CHANGE',
      targetId: 'WTH-88102',
      targetUser: 'Alex Vance',
      oldStatus: 'Under Review',
      newStatus: 'Completed',
      reason: 'Compliant security verification & automated hot wallet dispatch',
      timestamp: '2026-08-04 16:24:30'
    }
  ]);

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openSignOutModal = () => {
    setIsSignOutModalOpen(true);
  };

  const closeSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  useOverlayRegistration('auth-modal', isAuthModalOpen, closeAuthModal);
  useOverlayRegistration('signout-modal', isSignOutModalOpen, closeSignOutModal);

  // Logout trigger (opens confirmation modal)
  const logout = () => {
    setIsSignOutModalOpen(true);
  };

  // Confirmed Logout: Destroys authenticated session & clears user session storage & state
  const confirmLogout = () => {
    // Destroy authenticated session and remove tokens
    setIsLoggedIn(false);
    localStorage.setItem('oriviant_authenticated', 'false');
    localStorage.removeItem('oriviant_token');
    localStorage.removeItem('oriviant_user_profile');
    
    // Clear user session storage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Session storage clear warning:', e);
    }

    // Clear wallet info, balances, open positions, pending orders, notifications data
    setDeposits([]);
    setWithdrawals([]);
    setInternalTransfers([]);
    setAddressBook([]);
    
    // Close sign out confirmation dialog
    setIsSignOutModalOpen(false);

    // Broadcast session state change for active tab redirecting
    window.dispatchEvent(new CustomEvent('oriviant_session_logout'));
  };

  // Login handler
  const login = (email: string, rememberMe = true) => {
    const updatedProfile = {
      ...user,
      email: email || 'trader.alex@oriviant.io',
      nickname: email ? email.split('@')[0] : 'Alex_Vance_Oriviant'
    };
    setUser(updatedProfile);
    setIsLoggedIn(true);

    // Restore default wallet structures on login
    setWalletAssets(INITIAL_WALLET_ASSETS);
    setWalletDetails(INITIAL_WALLET_ASSETS_DETAIL);
    setDeposits(INITIAL_DEPOSIT_RECORDS);
    setWithdrawals(INITIAL_WITHDRAWAL_RECORDS);
    setAddressBook(INITIAL_ADDRESS_BOOK);

    // Save tokens and Remember Me preference
    localStorage.setItem('oriviant_authenticated', 'true');
    localStorage.setItem('oriviant_token', `orv_token_${Date.now()}`);
    if (rememberMe) {
      localStorage.setItem('oriviant_remember_me', 'true');
    } else {
      localStorage.removeItem('oriviant_remember_me');
    }

    closeAuthModal();
  };

  // Session Expired helper
  const triggerSessionExpired = () => {
    confirmLogout();
  };

  // Submit new Deposit
  const submitDeposit = (assetSymbol: string, amount: number, network: string): DepositRecord => {
    const asset = walletDetails.find(a => a.symbol === assetSymbol) || walletDetails[0];
    const netInfo = asset.depositNetworks.find(n => n.network === network) || asset.depositNetworks[0];

    const newDep: DepositRecord = {
      id: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.nickname,
      userEmail: user.email,
      asset: assetSymbol,
      amount,
      usdValue: amount * asset.priceUsdt,
      network,
      depositAddress: netInfo?.depositAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      txHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 10)}`,
      explorerUrl: `https://etherscan.io/tx/0x${Math.random().toString(16).substring(2, 18)}`,
      confirmations: 1,
      requiredConfirmations: netInfo?.requiredConfirmations || 12,
      status: 'Confirming',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: `User initiated ${network} deposit`
    };

    setDeposits(prev => [newDep, ...prev]);

    // Simulate deposit confirmation after 12 seconds
    setTimeout(() => {
      setDeposits(prev => prev.map(d => d.id === newDep.id ? {
        ...d,
        status: 'Completed',
        confirmations: d.requiredConfirmations,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } : d));

      // Credit Spot Balance
      setWalletDetails(prev => prev.map(a => a.symbol === assetSymbol ? {
        ...a,
        spotBalance: a.spotBalance + amount
      } : a));
    }, 12000);

    return newDep;
  };

  // Submit new Withdrawal
  const submitWithdrawal = (
    assetSymbol: string, 
    amount: number, 
    network: string, 
    recipientAddress: string,
    nickname?: string,
    verificationCode?: string
  ): { success: boolean; record?: WithdrawalRecord; error?: string } => {
    if (securityState.isWalletFrozen) {
      return { success: false, error: 'Your wallet is currently frozen by administration. Contact support.' };
    }

    if (securityState.areWithdrawalsLocked) {
      return { success: false, error: 'Withdrawals are currently locked on your account.' };
    }

    const asset = walletDetails.find(a => a.symbol === assetSymbol);
    if (!asset) return { success: false, error: 'Invalid asset.' };

    const netInfo = asset.withdrawalNetworks.find(n => n.network === network) || asset.withdrawalNetworks[0];
    const fee = netInfo?.fee || 1.0;
    const totalRequired = amount;

    if (asset.spotBalance < totalRequired) {
      return { success: false, error: `Insufficient Spot balance. Available: ${asset.spotBalance} ${assetSymbol}` };
    }

    const receiveAmt = Math.max(0, amount - fee);
    const isWhitelisted = addressBook.some(item => item.address.toLowerCase() === recipientAddress.toLowerCase() && item.isWhitelisted);

    // Lock balance
    setWalletDetails(prev => prev.map(a => a.symbol === assetSymbol ? {
      ...a,
      spotBalance: a.spotBalance - totalRequired,
      lockedBalance: a.lockedBalance + totalRequired
    } : a));

    const newWth: WithdrawalRecord = {
      id: `WTH-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.nickname,
      userEmail: user.email,
      asset: assetSymbol,
      amount,
      fee,
      receiveAmount: receiveAmt,
      usdValue: receiveAmt * asset.priceUsdt,
      network,
      recipientAddress,
      addressNickname: nickname || 'Saved Wallet',
      isWhitelisted,
      status: isWhitelisted ? 'Pending' : 'Under Review',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: isWhitelisted ? 'Whitelisted destination auto-cleared 2FA' : 'Standard security audit pending'
    };

    setWithdrawals(prev => [newWth, ...prev]);
    return { success: true, record: newWth };
  };

  // Internal Wallet Transfer
  const executeInternalTransfer = (
    assetSymbol: string, 
    amount: number, 
    from: WalletSubAccount, 
    to: WalletSubAccount
  ): boolean => {
    if (from === to) return false;
    const asset = walletDetails.find(a => a.symbol === assetSymbol);
    if (!asset) return false;

    const currentBalFrom = from === 'spot' ? asset.spotBalance : from === 'futures' ? asset.futuresBalance : asset.fundingBalance;
    if (currentBalFrom < amount) return false;

    setWalletDetails(prev => prev.map(a => {
      if (a.symbol !== assetSymbol) return a;
      let spot = a.spotBalance;
      let futures = a.futuresBalance;
      let funding = a.fundingBalance;

      if (from === 'spot') spot -= amount;
      if (from === 'futures') futures -= amount;
      if (from === 'funding') funding -= amount;

      if (to === 'spot') spot += amount;
      if (to === 'futures') futures += amount;
      if (to === 'funding') funding += amount;

      return {
        ...a,
        spotBalance: spot,
        futuresBalance: futures,
        fundingBalance: funding
      };
    }));

    const rec: InternalTransferRecord = {
      id: `TRF-${Math.floor(10000 + Math.random() * 90000)}`,
      asset: assetSymbol,
      amount,
      usdValue: amount * asset.priceUsdt,
      fromWallet: from,
      toWallet: to,
      status: 'Completed',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setInternalTransfers(prev => [rec, ...prev]);
    return true;
  };

  // Address Book Operations
  const addAddressBookItem = (asset: string, network: string, nickname: string, address: string, isWhitelisted = false) => {
    const newItem: AddressBookItem = {
      id: `ADR-${Math.floor(1000 + Math.random() * 9000)}`,
      asset,
      network,
      nickname,
      address,
      isWhitelisted,
      isFavorite: false,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setAddressBook(prev => [newItem, ...prev]);
  };

  const deleteAddressBookItem = (id: string) => {
    setAddressBook(prev => prev.filter(item => item.id !== id));
  };

  const toggleAddressWhitelist = (id: string) => {
    setAddressBook(prev => prev.map(item => item.id === id ? { ...item, isWhitelisted: !item.isWhitelisted } : item));
  };

  const toggleAddressFavorite = (id: string) => {
    setAddressBook(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  // Security Updates
  const updateAntiPhishingCode = (code: string) => {
    setSecurityState(prev => ({ ...prev, antiPhishingCode: code }));
  };

  const removeTrustedDevice = (deviceId: string) => {
    setSecurityState(prev => ({
      ...prev,
      trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId)
    }));
  };

  const toggleWalletFreeze = (freeze: boolean, adminReason = 'Administrative compliance check') => {
    setSecurityState(prev => ({ ...prev, isWalletFrozen: freeze }));
    setAuditLogs(prev => [{
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      adminEmail: 'admin.compliance@oriviant.io',
      actionType: 'WALLET_FREEZE',
      targetId: user.id,
      targetUser: user.nickname,
      oldStatus: freeze ? 'Unfrozen' : 'Frozen',
      newStatus: freeze ? 'Frozen' : 'Unfrozen',
      reason: adminReason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, ...prev]);
  };

  const toggleWithdrawalsLock = (lock: boolean, adminReason = 'Withdrawal limit restriction') => {
    setSecurityState(prev => ({ ...prev, areWithdrawalsLocked: lock }));
  };

  // Admin Actions
  const updateDepositStatus = (id: string, newStatus: DepositStatus, notes?: string, adminEmail = 'admin@oriviant.io') => {
    setDeposits(prev => prev.map(dep => {
      if (dep.id !== id) return dep;
      const oldStatus = dep.status;

      // Credit balance if changing from non-completed to Completed
      if (oldStatus !== 'Completed' && newStatus === 'Completed') {
        setWalletDetails(wb => wb.map(a => a.symbol === dep.asset ? {
          ...a,
          spotBalance: a.spotBalance + dep.amount
        } : a));
      }

      // Record Audit
      setAuditLogs(logs => [{
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        adminEmail,
        actionType: 'DEPOSIT_STATUS_CHANGE',
        targetId: id,
        targetUser: dep.userName,
        oldStatus,
        newStatus,
        reason: notes || `Admin changed deposit status to ${newStatus}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }, ...logs]);

      return {
        ...dep,
        status: newStatus,
        notes: notes || dep.notes,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }));
  };

  const updateWithdrawalStatus = (
    id: string, 
    newStatus: WithdrawalStatus, 
    txHash?: string, 
    notes?: string, 
    adminEmail = 'admin@oriviant.io'
  ) => {
    setWithdrawals(prev => prev.map(wth => {
      if (wth.id !== id) return wth;
      const oldStatus = wth.status;

      // If rejected or cancelled, release locked balance back to spot balance
      if ((newStatus === 'Rejected' || newStatus === 'Cancelled' || newStatus === 'Failed') &&
          oldStatus !== 'Rejected' && oldStatus !== 'Cancelled' && oldStatus !== 'Failed') {
        setWalletDetails(wb => wb.map(a => a.symbol === wth.asset ? {
          ...a,
          spotBalance: a.spotBalance + wth.amount,
          lockedBalance: Math.max(0, a.lockedBalance - wth.amount)
        } : a));
      }

      // If completed, remove from locked balance
      if (newStatus === 'Completed' && oldStatus !== 'Completed') {
        setWalletDetails(wb => wb.map(a => a.symbol === wth.asset ? {
          ...a,
          lockedBalance: Math.max(0, a.lockedBalance - wth.amount)
        } : a));
      }

      // Audit Record
      setAuditLogs(logs => [{
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        adminEmail,
        actionType: 'WITHDRAWAL_STATUS_CHANGE',
        targetId: id,
        targetUser: wth.userName,
        oldStatus,
        newStatus,
        reason: notes || `Admin updated withdrawal status to ${newStatus}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }, ...logs]);

      return {
        ...wth,
        status: newStatus,
        txHash: txHash || wth.txHash,
        notes: notes || wth.notes,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }));
  };

  const adjustUserAssetBalance = (symbol: string, amountChange: number, subAccount: WalletSubAccount, adminEmail: string, reason: string) => {
    setWalletDetails(prev => prev.map(a => {
      if (a.symbol !== symbol) return a;
      return {
        ...a,
        spotBalance: subAccount === 'spot' ? Math.max(0, a.spotBalance + amountChange) : a.spotBalance,
        futuresBalance: subAccount === 'futures' ? Math.max(0, a.futuresBalance + amountChange) : a.futuresBalance,
        fundingBalance: subAccount === 'funding' ? Math.max(0, a.fundingBalance + amountChange) : a.fundingBalance,
      };
    }));

    setAuditLogs(logs => [{
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      adminEmail,
      actionType: 'BALANCE_ADJUSTMENT',
      targetId: symbol,
      targetUser: user.nickname,
      oldStatus: 'Adjusting Balance',
      newStatus: `${amountChange > 0 ? '+' : ''}${amountChange} ${symbol} (${subAccount})`,
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, ...logs]);
  };

  const depositAsset = (symbol: string, amount: number) => {
    submitDeposit(symbol, amount, 'TRC20');
  };

  const withdrawAsset = (symbol: string, amount: number, address: string) => {
    const res = submitWithdrawal(symbol, amount, 'TRC20', address);
    return res.success;
  };

  const transferAsset = (symbol: string, amount: number) => {
    executeInternalTransfer(symbol, amount, 'spot', 'futures');
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        user,
        walletAssets,
        walletDetails,
        deposits,
        withdrawals,
        internalTransfers,
        addressBook,
        securityState,
        auditLogs,
        submitDeposit,
        submitWithdrawal,
        executeInternalTransfer,
        addAddressBookItem,
        deleteAddressBookItem,
        toggleAddressWhitelist,
        toggleAddressFavorite,
        updateAntiPhishingCode,
        removeTrustedDevice,
        toggleWalletFreeze,
        toggleWithdrawalsLock,
        updateDepositStatus,
        updateWithdrawalStatus,
        adjustUserAssetBalance,
        depositAsset,
        withdrawAsset,
        transferAsset,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isSignOutModalOpen,
        openSignOutModal,
        closeSignOutModal,
        confirmLogout,
        logout,
        login,
        triggerSessionExpired
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

