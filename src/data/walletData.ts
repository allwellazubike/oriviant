import { 
  WalletAssetDetail, 
  DepositRecord, 
  WithdrawalRecord, 
  InternalTransferRecord, 
  AddressBookItem, 
  TrustedDevice, 
  LoginHistoryItem, 
  UserSecurityState 
} from '../types/wallet';

export const INITIAL_WALLET_ASSETS_DETAIL: WalletAssetDetail[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '₮',
    spotBalance: 0,
    futuresBalance: 0,
    fundingBalance: 0,
    lockedBalance: 0,
    unrealizedPnL: 0,
    priceUsdt: 1.00,
    change24h: 0.00,
    depositNetworks: [
      {
        network: 'TRC20',
        name: 'Tron (TRC20)',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '2 mins (~12 confirmations)',
        minDeposit: 10,
        requiredConfirmations: 12,
        depositAddress: 'TWNRfaxRcvT566zfPN9MmEPwsviiSA44qH', // Client USDT Address
      }
    ],
    withdrawalNetworks: [
      {
        network: 'TRC20',
        name: 'Tron (TRC20)',
        fee: 1.00,
        feeSymbol: 'USDT',
        minWithdrawal: 10,
        maxWithdrawal: 1000000,
        estimatedArrival: '3-5 mins',
      }
    ]
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    spotBalance: 0,
    futuresBalance: 0,
    fundingBalance: 0,
    lockedBalance: 0,
    unrealizedPnL: 0,
    priceUsdt: 92450.80,
    change24h: 3.82,
    depositNetworks: [
      {
        network: 'Bitcoin',
        name: 'Bitcoin Native Network',
        fee: 0,
        feeSymbol: 'BTC',
        estimatedArrival: '10-20 mins (~2 confirmations)',
        minDeposit: 0.0002,
        requiredConfirmations: 2,
        depositAddress: 'bc1q3h5fswmlfaxj252at9dqshwk2lkrunvg7dlsg3', // Client BTC Address
      }
    ],
    withdrawalNetworks: [
      {
        network: 'Bitcoin',
        name: 'Bitcoin Native Network',
        fee: 0.00015,
        feeSymbol: 'BTC',
        minWithdrawal: 0.0005,
        maxWithdrawal: 50,
        estimatedArrival: '15-30 mins',
      }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    spotBalance: 0,
    futuresBalance: 0,
    fundingBalance: 0,
    lockedBalance: 0,
    unrealizedPnL: 0,
    priceUsdt: 3480.25,
    change24h: 5.14,
    depositNetworks: [
      {
        network: 'ERC20',
        name: 'Ethereum (ERC20)',
        fee: 0,
        feeSymbol: 'ETH',
        estimatedArrival: '3 mins (~12 confirmations)',
        minDeposit: 0.005,
        requiredConfirmations: 12,
        depositAddress: '0x293DdE7F363dEacAF5efC188B704375CD66fc803', // Client ETH Address
      }
    ],
    withdrawalNetworks: [
      {
        network: 'ERC20',
        name: 'Ethereum (ERC20)',
        fee: 0.0012,
        feeSymbol: 'ETH',
        minWithdrawal: 0.01,
        maxWithdrawal: 500,
        estimatedArrival: '5 mins',
      }
    ]
  }
];

export const INITIAL_DEPOSIT_RECORDS: DepositRecord[] = [];
export const INITIAL_WITHDRAWAL_RECORDS: WithdrawalRecord[] = [];
export const INITIAL_ADDRESS_BOOK: AddressBookItem[] = [];
export const INITIAL_TRUSTED_DEVICES: TrustedDevice[] = [];
export const INITIAL_LOGIN_HISTORY: LoginHistoryItem[] = [];

export const INITIAL_SECURITY_STATE: UserSecurityState = {
  isEmailVerified: false,
  email: '',
  isPhoneVerified: false,
  phone: '',
  is2FAEnabled: false,
  isPasskeyEnabled: false,
  antiPhishingCode: '',
  isWithdrawalPasswordSet: false,
  isWalletFrozen: false,
  areWithdrawalsLocked: false,
  trustedDevices: INITIAL_TRUSTED_DEVICES,
  loginHistory: INITIAL_LOGIN_HISTORY
};