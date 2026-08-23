export type WalletSubAccount = 'spot' | 'futures' | 'funding';

export interface DepositNetworkInfo {
  network: string; // e.g. TRC20, ERC20, BEP20, Solana, Arbitrum, Bitcoin
  name: string; // e.g. Tron (TRC20)
  fee: number; // e.g. 0
  feeSymbol: string;
  estimatedArrival: string; // e.g. "2 mins (~12 confirmations)"
  minDeposit: number;
  requiredConfirmations: number;
  depositAddress: string;
  memoOrTagRequired?: boolean;
}

export interface WithdrawalNetworkInfo {
  network: string;
  name: string;
  fee: number;
  feeSymbol: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  estimatedArrival: string;
}

export interface WalletAssetDetail {
  symbol: string;
  name: string;
  icon: string;
  spotBalance: number;
  futuresBalance: number;
  fundingBalance: number;
  lockedBalance: number;
  unrealizedPnL: number;
  priceUsdt: number;
  change24h: number;
  depositNetworks: DepositNetworkInfo[];
  withdrawalNetworks: WithdrawalNetworkInfo[];
}

export type DepositStatus = 
  | 'Pending' 
  | 'Confirming' 
  | 'Processing' 
  | 'Completed' 
  | 'Failed' 
  | 'Cancelled';

export type WithdrawalStatus = 
  | 'Pending' 
  | 'Under Review' 
  | 'Approved' 
  | 'Processing' 
  | 'Broadcasted' 
  | 'Completed' 
  | 'Rejected' 
  | 'Cancelled' 
  | 'Failed';

export interface DepositRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  asset: string;
  amount: number;
  usdValue: number;
  network: string;
  depositAddress: string;
  txHash: string;
  explorerUrl: string;
  confirmations: number;
  requiredConfirmations: number;
  status: DepositStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  asset: string;
  amount: number;
  fee: number;
  receiveAmount: number;
  usdValue: number;
  network: string;
  recipientAddress: string;
  addressNickname?: string;
  isWhitelisted?: boolean;
  status: WithdrawalStatus;
  txHash?: string;
  explorerUrl?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  notes?: string;
}

export interface InternalTransferRecord {
  id: string;
  asset: string;
  amount: number;
  usdValue: number;
  fromWallet: WalletSubAccount;
  toWallet: WalletSubAccount;
  status: 'Completed';
  createdAt: string;
}

export interface AddressBookItem {
  id: string;
  asset: string;
  network: string;
  nickname: string;
  address: string;
  isWhitelisted: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface LoginHistoryItem {
  id: string;
  loginTime: string;
  location: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  status: 'Success' | 'Failed' | 'New Device Detected';
}

export interface UserSecurityState {
  isEmailVerified: boolean;
  email: string;
  isPhoneVerified: boolean;
  phone?: string;
  is2FAEnabled: boolean;
  isPasskeyEnabled: boolean;
  antiPhishingCode: string;
  isWithdrawalPasswordSet: boolean;
  isWalletFrozen: boolean;
  areWithdrawalsLocked: boolean;
  trustedDevices: TrustedDevice[];
  loginHistory: LoginHistoryItem[];
}

export interface AdminAuditRecord {
  id: string;
  adminEmail: string;
  actionType: 'DEPOSIT_STATUS_CHANGE' | 'WITHDRAWAL_STATUS_CHANGE' | 'WALLET_FREEZE' | 'BALANCE_ADJUSTMENT';
  targetId: string;
  targetUser: string;
  oldStatus?: string;
  newStatus?: string;
  reason: string;
  timestamp: string;
}
