import React, { createContext, useContext, useState } from 'react';
import { WalletAsset } from '../types';
import { INITIAL_WALLET_ASSETS } from '../mockData';

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
  depositAsset: (symbol: string, amount: number) => void;
  withdrawAsset: (symbol: string, amount: number, address: string) => boolean;
  transferAsset: (symbol: string, amount: number, from: string, to: string) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp';
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot' | 'pin' | 'otp') => void;
  closeAuthModal: () => void;
  logout: () => void;
  login: (email: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot' | 'pin' | 'otp'>('login');

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

  const [walletAssets, setWalletAssets] = useState<WalletAsset[]>(INITIAL_WALLET_ASSETS);

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' | 'pin' | 'otp' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const login = (email: string) => {
    setUser((prev) => ({ ...prev, email }));
    setIsLoggedIn(true);
    closeAuthModal();
  };

  const depositAsset = (symbol: string, amount: number) => {
    setWalletAssets((assets) =>
      assets.map((asset) => {
        if (asset.symbol === symbol) {
          const total = asset.total + amount;
          const available = asset.available + amount;
          return {
            ...asset,
            total,
            available,
            valueUsdt: total * (asset.symbol === 'USDT' ? 1 : asset.valueUsdt / (asset.total || 1))
          };
        }
        return asset;
      })
    );
  };

  const withdrawAsset = (symbol: string, amount: number) => {
    let success = false;
    setWalletAssets((assets) =>
      assets.map((asset) => {
        if (asset.symbol === symbol && asset.available >= amount) {
          success = true;
          const total = asset.total - amount;
          const available = asset.available - amount;
          return {
            ...asset,
            total,
            available,
            valueUsdt: total * (asset.symbol === 'USDT' ? 1 : asset.valueUsdt / (asset.total || 1))
          };
        }
        return asset;
      })
    );
    return success;
  };

  const transferAsset = (symbol: string, amount: number) => {
    // Internal wallet transfer feedback
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        user,
        walletAssets,
        depositAsset,
        withdrawAsset,
        transferAsset,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        logout,
        login
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
