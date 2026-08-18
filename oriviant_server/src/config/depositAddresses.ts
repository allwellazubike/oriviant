/**
 * The only assets Oriviant accepts deposits in, and the addresses they land on.
 *
 * This is the single source of truth. The frontend used to hardcode both the
 * asset list (eight coins, six of which we cannot receive) and the addresses
 * themselves, which meant a user could file a deposit for an asset nobody
 * watches — money sent to nowhere. The API now serves this list and rejects
 * anything outside it, so adding or rotating an address is a one-file change
 * that both frontends pick up without a redeploy of their own.
 */

export interface DepositAsset {
  symbol: string;
  name: string;
  /** The chain funds must be sent on. Sending on any other chain loses them. */
  network: string;
  networkLabel: string;
  address: string;
  minDeposit: number;
  /** Confirmations we wait for before an admin should approve. */
  requiredConfirmations: number;
  estimatedArrival: string;
}

export const DEPOSIT_ASSETS: DepositAsset[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'TRC20',
    networkLabel: 'Tron (TRC20)',
    address: 'TWNRfaxRcvT566zfPN9MmEPwsviiSA44qH',
    minDeposit: 10,
    requiredConfirmations: 19,
    estimatedArrival: '~3 minutes',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'BTC',
    networkLabel: 'Bitcoin Network',
    address: 'bc1q3h5fswmlfaxj252at9dqshwk2lkrunvg7dlsg3',
    minDeposit: 0.0002,
    requiredConfirmations: 2,
    estimatedArrival: '~30 minutes',
  },
];

export const SUPPORTED_DEPOSIT_SYMBOLS = DEPOSIT_ASSETS.map((a) => a.symbol);

export const getDepositAsset = (symbol: unknown): DepositAsset | undefined => {
  if (typeof symbol !== 'string') return undefined;
  const wanted = symbol.trim().toUpperCase();
  return DEPOSIT_ASSETS.find((a) => a.symbol === wanted);
};
