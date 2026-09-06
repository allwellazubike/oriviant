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
    spotBalance: 12450.00,
    futuresBalance: 4200.00,
    fundingBalance: 1500.00,
    lockedBalance: 850.00,
    unrealizedPnL: +342.50,
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
        depositAddress: 'TY9aX8kLmP2904bca711kL90QxWv1',
      },
      {
        network: 'ERC20',
        name: 'Ethereum (ERC20)',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '4 mins (~15 confirmations)',
        minDeposit: 20,
        requiredConfirmations: 15,
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      },
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BEP20)',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '1 min (~15 confirmations)',
        minDeposit: 5,
        requiredConfirmations: 15,
        depositAddress: '0x88F9200a12bC711aBc9001199a0021bC7',
      },
      {
        network: 'Solana',
        name: 'Solana (SPL)',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '30 secs (~32 confirmations)',
        minDeposit: 5,
        requiredConfirmations: 32,
        depositAddress: 'SoL99kLpM8822kll00aXzq11bC900aQ',
      },
      {
        network: 'Arbitrum',
        name: 'Arbitrum One',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '1 min (~20 confirmations)',
        minDeposit: 5,
        requiredConfirmations: 20,
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      },
      {
        network: 'Polygon',
        name: 'Polygon PoS',
        fee: 0,
        feeSymbol: 'USDT',
        estimatedArrival: '2 mins (~64 confirmations)',
        minDeposit: 5,
        requiredConfirmations: 64,
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
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
      },
      {
        network: 'ERC20',
        name: 'Ethereum (ERC20)',
        fee: 4.50,
        feeSymbol: 'USDT',
        minWithdrawal: 25,
        maxWithdrawal: 2000000,
        estimatedArrival: '5-10 mins',
      },
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BEP20)',
        fee: 0.30,
        feeSymbol: 'USDT',
        minWithdrawal: 10,
        maxWithdrawal: 500000,
        estimatedArrival: '1-3 mins',
      },
      {
        network: 'Solana',
        name: 'Solana (SPL)',
        fee: 0.80,
        feeSymbol: 'USDT',
        minWithdrawal: 10,
        maxWithdrawal: 500000,
        estimatedArrival: '1 min',
      },
      {
        network: 'Arbitrum',
        name: 'Arbitrum One',
        fee: 0.50,
        feeSymbol: 'USDT',
        minWithdrawal: 10,
        maxWithdrawal: 500000,
        estimatedArrival: '2 mins',
      }
    ]
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    spotBalance: 0.45,
    futuresBalance: 0.15,
    fundingBalance: 0.05,
    lockedBalance: 0.02,
    unrealizedPnL: +1250.80,
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
        depositAddress: 'bc1q9a83jkl099x0441a20bca90011z',
      },
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BTCB)',
        fee: 0,
        feeSymbol: 'BTC',
        estimatedArrival: '2 mins (~15 confirmations)',
        minDeposit: 0.0001,
        requiredConfirmations: 15,
        depositAddress: '0x88F9200a12bC711aBc9001199a0021bC7',
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
      },
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BTCB)',
        fee: 0.00002,
        feeSymbol: 'BTC',
        minWithdrawal: 0.0002,
        maxWithdrawal: 20,
        estimatedArrival: '2 mins',
      }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    spotBalance: 4.20,
    futuresBalance: 1.50,
    fundingBalance: 0.30,
    lockedBalance: 0.20,
    unrealizedPnL: -120.40,
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
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      },
      {
        network: 'Arbitrum',
        name: 'Arbitrum One',
        fee: 0,
        feeSymbol: 'ETH',
        estimatedArrival: '1 min (~20 confirmations)',
        minDeposit: 0.002,
        requiredConfirmations: 20,
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      },
      {
        network: 'Optimism',
        name: 'OP Mainnet',
        fee: 0,
        feeSymbol: 'ETH',
        estimatedArrival: '1 min (~20 confirmations)',
        minDeposit: 0.002,
        requiredConfirmations: 20,
        depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
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
      },
      {
        network: 'Arbitrum',
        name: 'Arbitrum One',
        fee: 0.0001,
        feeSymbol: 'ETH',
        minWithdrawal: 0.005,
        maxWithdrawal: 200,
        estimatedArrival: '1 min',
      }
    ]
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    icon: 'S',
    spotBalance: 35.00,
    futuresBalance: 12.00,
    fundingBalance: 5.00,
    lockedBalance: 2.00,
    unrealizedPnL: +480.10,
    priceUsdt: 214.60,
    change24h: 8.75,
    depositNetworks: [
      {
        network: 'Solana',
        name: 'Solana Native',
        fee: 0,
        feeSymbol: 'SOL',
        estimatedArrival: '30 secs (~32 confirmations)',
        minDeposit: 0.05,
        requiredConfirmations: 32,
        depositAddress: 'SoL99kLpM8822kll00aXzq11bC900aQ',
      }
    ],
    withdrawalNetworks: [
      {
        network: 'Solana',
        name: 'Solana Native',
        fee: 0.005,
        feeSymbol: 'SOL',
        minWithdrawal: 0.1,
        maxWithdrawal: 10000,
        estimatedArrival: '1 min',
      }
    ]
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    icon: 'B',
    spotBalance: 8.50,
    futuresBalance: 2.00,
    fundingBalance: 1.00,
    lockedBalance: 0.00,
    unrealizedPnL: +95.20,
    priceUsdt: 685.40,
    change24h: 1.95,
    depositNetworks: [
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BEP20)',
        fee: 0,
        feeSymbol: 'BNB',
        estimatedArrival: '1 min (~15 confirmations)',
        minDeposit: 0.01,
        requiredConfirmations: 15,
        depositAddress: '0x88F9200a12bC711aBc9001199a0021bC7',
      }
    ],
    withdrawalNetworks: [
      {
        network: 'BEP20',
        name: 'BNB Smart Chain (BEP20)',
        fee: 0.0005,
        feeSymbol: 'BNB',
        minWithdrawal: 0.02,
        maxWithdrawal: 5000,
        estimatedArrival: '1-2 mins',
      }
    ]
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    icon: 'X',
    spotBalance: 1250.00,
    futuresBalance: 500.00,
    fundingBalance: 0.00,
    lockedBalance: 0.00,
    unrealizedPnL: -45.00,
    priceUsdt: 2.45,
    change24h: -1.85,
    depositNetworks: [
      {
        network: 'Ripple',
        name: 'XRP Ledger (Tag Required)',
        fee: 0,
        feeSymbol: 'XRP',
        estimatedArrival: '15 secs (~1 confirmation)',
        minDeposit: 5,
        requiredConfirmations: 1,
        depositAddress: 'rEb8TK3gG22L990xZpL1190aQx4',
        memoOrTagRequired: true
      }
    ],
    withdrawalNetworks: [
      {
        network: 'Ripple',
        name: 'XRP Ledger',
        fee: 0.25,
        feeSymbol: 'XRP',
        minWithdrawal: 10,
        maxWithdrawal: 500000,
        estimatedArrival: '1 min',
      }
    ]
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    icon: 'A',
    spotBalance: 3200.00,
    futuresBalance: 0.00,
    fundingBalance: 0.00,
    lockedBalance: 0.00,
    unrealizedPnL: +110.50,
    priceUsdt: 0.885,
    change24h: 2.40,
    depositNetworks: [
      {
        network: 'Cardano',
        name: 'Cardano Mainnet',
        fee: 0,
        feeSymbol: 'ADA',
        estimatedArrival: '3 mins (~15 confirmations)',
        minDeposit: 10,
        requiredConfirmations: 15,
        depositAddress: 'addr1q9a83jkl099x0441a20bca90011z88f920',
      }
    ],
    withdrawalNetworks: [
      {
        network: 'Cardano',
        name: 'Cardano Mainnet',
        fee: 1.0,
        feeSymbol: 'ADA',
        minWithdrawal: 15,
        maxWithdrawal: 100000,
        estimatedArrival: '3 mins',
      }
    ]
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: 'Ð',
    spotBalance: 15000.00,
    futuresBalance: 5000.00,
    fundingBalance: 0.00,
    lockedBalance: 0.00,
    unrealizedPnL: +620.00,
    priceUsdt: 0.384,
    change24h: 12.40,
    depositNetworks: [
      {
        network: 'Dogecoin',
        name: 'Dogecoin Native Network',
        fee: 0,
        feeSymbol: 'DOGE',
        estimatedArrival: '5 mins (~6 confirmations)',
        minDeposit: 50,
        requiredConfirmations: 6,
        depositAddress: 'D88xZ90bca711kL90QxWv19aX8kLmP2',
      }
    ],
    withdrawalNetworks: [
      {
        network: 'Dogecoin',
        name: 'Dogecoin Native Network',
        fee: 4.0,
        feeSymbol: 'DOGE',
        minWithdrawal: 100,
        maxWithdrawal: 1000000,
        estimatedArrival: '5 mins',
      }
    ]
  }
];

export const INITIAL_DEPOSIT_RECORDS: DepositRecord[] = [
  {
    id: 'DEP-90812',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'USDT',
    amount: 15000,
    usdValue: 15000,
    network: 'TRC20',
    depositAddress: 'TY9aX8kLmP2904bca711kL90QxWv1',
    txHash: '0x8f1922a014b9c1d2019a334e',
    explorerUrl: 'https://tronscan.org/#/transaction/0x8f1922a014b9c1d2019a334e',
    confirmations: 12,
    requiredConfirmations: 12,
    status: 'Completed',
    createdAt: '2026-08-04 18:42:10',
    updatedAt: '2026-08-04 18:44:15',
    notes: 'Auto-credited via TronScan Webhook listener'
  },
  {
    id: 'DEP-90811',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'BTC',
    amount: 0.25,
    usdValue: 23112.70,
    network: 'Bitcoin',
    depositAddress: 'bc1q9a83jkl099x0441a20bca90011z',
    txHash: '0x12a5904bca11882200114a',
    explorerUrl: 'https://mempool.space/tx/0x12a5904bca11882200114a',
    confirmations: 1,
    requiredConfirmations: 2,
    status: 'Confirming',
    createdAt: '2026-08-04 19:55:00',
    updatedAt: '2026-08-04 20:01:20',
    notes: 'Awaiting 2nd Bitcoin block confirmation'
  },
  {
    id: 'DEP-90810',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'ETH',
    amount: 2.5,
    usdValue: 8700.62,
    network: 'ERC20',
    depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    txHash: '0x4f88711abc09842100877a',
    explorerUrl: 'https://etherscan.io/tx/0x4f88711abc09842100877a',
    confirmations: 15,
    requiredConfirmations: 15,
    status: 'Completed',
    createdAt: '2026-08-03 14:12:05',
    updatedAt: '2026-08-03 14:15:30'
  },
  {
    id: 'DEP-90809',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'SOL',
    amount: 25.0,
    usdValue: 5365.00,
    network: 'Solana',
    depositAddress: 'SoL99kLpM8822kll00aXzq11bC900aQ',
    txHash: '0x334a554ef0982001a4bc',
    explorerUrl: 'https://solscan.io/tx/0x334a554ef0982001a4bc',
    confirmations: 32,
    requiredConfirmations: 32,
    status: 'Completed',
    createdAt: '2026-08-01 11:05:40',
    updatedAt: '2026-08-01 11:06:12'
  }
];

export const INITIAL_WITHDRAWAL_RECORDS: WithdrawalRecord[] = [
  {
    id: 'WTH-88102',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'USDT',
    amount: 2500,
    fee: 1.00,
    receiveAmount: 2499,
    usdValue: 2499,
    network: 'TRC20',
    recipientAddress: 'TQ8zX910a204bca711kL009aa4x',
    addressNickname: 'Binance Cold Vault',
    isWhitelisted: true,
    status: 'Completed',
    txHash: '0x991100abc8820a3b201f99a1',
    explorerUrl: 'https://tronscan.org/#/transaction/0x991100abc8820a3b201f99a1',
    createdAt: '2026-08-04 16:20:10',
    updatedAt: '2026-08-04 16:24:30',
    notes: '2FA and Email verified successfully'
  },
  {
    id: 'WTH-88101',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'BTC',
    amount: 0.10,
    fee: 0.00015,
    receiveAmount: 0.09985,
    usdValue: 9231.20,
    network: 'Bitcoin',
    recipientAddress: 'bc1q9a0077xb901a883102kll99a10x',
    addressNickname: 'Hardware Ledger Nano S',
    isWhitelisted: true,
    status: 'Broadcasted',
    txHash: '0x88203bca0011f290311',
    explorerUrl: 'https://mempool.space/tx/0x88203bca0011f290311',
    createdAt: '2026-08-04 19:10:00',
    updatedAt: '2026-08-04 19:25:00',
    notes: 'Broadcasted to mempool via Oriviant Hot Wallet Node #2'
  },
  {
    id: 'WTH-88100',
    userId: 'ORV-894102',
    userName: 'Alex Vance',
    userEmail: 'trader.alex@oriviant.io',
    asset: 'ETH',
    amount: 1.0,
    fee: 0.0012,
    receiveAmount: 0.9988,
    usdValue: 3476.07,
    network: 'ERC20',
    recipientAddress: '0x91F228ba8811099201a4bc00a12',
    addressNickname: 'Metamask Personal',
    isWhitelisted: false,
    status: 'Under Review',
    createdAt: '2026-08-04 20:00:15',
    updatedAt: '2026-08-04 20:00:15',
    notes: 'Pending compliance review for un-whitelisted recipient'
  }
];

export const INITIAL_ADDRESS_BOOK: AddressBookItem[] = [
  {
    id: 'ADR-1',
    asset: 'USDT',
    network: 'TRC20',
    nickname: 'Binance Corporate Vault',
    address: 'TQ8zX910a204bca711kL009aa4x',
    isWhitelisted: true,
    isFavorite: true,
    createdAt: '2026-05-12'
  },
  {
    id: 'ADR-2',
    asset: 'BTC',
    network: 'Bitcoin',
    nickname: 'Hardware Ledger Nano S',
    address: 'bc1q9a0077xb901a883102kll99a10x',
    isWhitelisted: true,
    isFavorite: true,
    createdAt: '2026-06-01'
  },
  {
    id: 'ADR-3',
    asset: 'ETH',
    network: 'ERC20',
    nickname: 'Metamask Staking Wallet',
    address: '0x91F228ba8811099201a4bc00a12',
    isWhitelisted: false,
    isFavorite: false,
    createdAt: '2026-07-20'
  }
];

export const INITIAL_TRUSTED_DEVICES: TrustedDevice[] = [
  {
    id: 'DEV-1',
    deviceName: 'MacBook Pro 16" (M3 Max)',
    browser: 'Chrome 127.0',
    os: 'macOS Sequoia 15.1',
    location: 'London, United Kingdom',
    ip: '185.122.***.45',
    lastActive: 'Active Now (Current Device)',
    isCurrentDevice: true
  },
  {
    id: 'DEV-2',
    deviceName: 'iPhone 15 Pro Max',
    browser: 'Safari Mobile',
    os: 'iOS 18.0',
    location: 'London, United Kingdom',
    ip: '185.122.***.90',
    lastActive: '2 hours ago',
    isCurrentDevice: false
  },
  {
    id: 'DEV-3',
    deviceName: 'Workstation Desktop',
    browser: 'Firefox Developer 128.0',
    os: 'Windows 11 Pro',
    location: 'Zurich, Switzerland',
    ip: '194.230.***.12',
    lastActive: '3 days ago',
    isCurrentDevice: false
  }
];

export const INITIAL_LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    id: 'LOG-109',
    loginTime: '2026-08-04 20:05:12',
    location: 'London, United Kingdom',
    browser: 'Chrome 127.0',
    os: 'macOS Sequoia 15.1',
    device: 'MacBook Pro 16"',
    ip: '185.122.***.45',
    status: 'Success'
  },
  {
    id: 'LOG-108',
    loginTime: '2026-08-04 17:42:00',
    location: 'London, United Kingdom',
    browser: 'Safari Mobile',
    os: 'iOS 18.0',
    device: 'iPhone 15 Pro Max',
    ip: '185.122.***.90',
    status: 'Success'
  },
  {
    id: 'LOG-107',
    loginTime: '2026-08-02 09:15:30',
    location: 'Frankfurt, Germany',
    browser: 'Chrome 126.0',
    os: 'Windows 11',
    device: 'Unknown PC',
    ip: '82.165.***.11',
    status: 'New Device Detected'
  },
  {
    id: 'LOG-106',
    loginTime: '2026-07-29 14:00:22',
    location: 'London, United Kingdom',
    browser: 'Chrome 127.0',
    os: 'macOS Sequoia',
    device: 'MacBook Pro 16"',
    ip: '185.122.***.45',
    status: 'Success'
  }
];

export const INITIAL_SECURITY_STATE: UserSecurityState = {
  isEmailVerified: true,
  email: 'trader.alex@oriviant.io',
  isPhoneVerified: true,
  phone: '+44 7700 ****92',
  is2FAEnabled: true,
  isPasskeyEnabled: false,
  antiPhishingCode: 'ORIVIANT-SECURE-894',
  isWithdrawalPasswordSet: true,
  isWalletFrozen: false,
  areWithdrawalsLocked: false,
  trustedDevices: INITIAL_TRUSTED_DEVICES,
  loginHistory: INITIAL_LOGIN_HISTORY
};
