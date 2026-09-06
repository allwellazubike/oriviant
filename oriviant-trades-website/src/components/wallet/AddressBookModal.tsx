import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Check, 
  Copy,
  Tag
} from 'lucide-react';
import { AddressBookItem } from '../../types/wallet';

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressBook: AddressBookItem[];
  onAddAddress: (asset: string, network: string, nickname: string, address: string, isWhitelisted?: boolean) => void;
  onDeleteAddress: (id: string) => void;
  onToggleWhitelist: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  addressBook,
  onAddAddress,
  onDeleteAddress,
  onToggleWhitelist,
  onToggleFavorite,
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newAsset, setNewAsset] = useState<string>('USDT');
  const [newNetwork, setNewNetwork] = useState<string>('TRC20');
  const [newNickname, setNewNickname] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newWhitelisted, setNewWhitelisted] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname || !newAddress) return;
    onAddAddress(newAsset, newNetwork, newNickname, newAddress, newWhitelisted);
    setNewNickname('');
    setNewAddress('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-app-card border border-app shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-app flex items-center justify-between bg-app-sub/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-app">Withdrawal Address Book</h2>
              <p className="text-xs text-app-sec">Manage trusted destination wallets & whitelists</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-app-sec hover:text-app">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-app-sub/20 border-b border-app flex items-center justify-between">
          <span className="text-xs font-bold text-app-sec">
            {addressBook.length} Saved Addresses
          </span>
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingNew ? 'Cancel' : 'Add New Address'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add New Address Form Drawer */}
          {isAddingNew && (
            <form onSubmit={handleFormSubmit} className="p-4 rounded-2xl bg-app-sub/50 border border-accent/30 space-y-3 animate-in fade-in">
              <div className="text-xs font-extrabold text-app flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" />
                <span>Save New Crypto Address</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-app-sec uppercase mb-1">Asset</label>
                  <select
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-app-card border border-app font-bold text-app"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                    <option value="BNB">BNB</option>
                    <option value="XRP">XRP</option>
                    <option value="DOGE">DOGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-app-sec uppercase mb-1">Network</label>
                  <input
                    type="text"
                    value={newNetwork}
                    onChange={(e) => setNewNetwork(e.target.value)}
                    placeholder="e.g. TRC20, ERC20"
                    className="w-full px-3 py-2 rounded-xl bg-app-card border border-app font-bold text-app"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-[10px] font-bold text-app-sec uppercase">Label / Nickname</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="e.g. Binance Vault, Cold Ledger"
                  className="w-full px-3 py-2 rounded-xl bg-app-card border border-app font-bold text-app"
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-[10px] font-bold text-app-sec uppercase">Blockchain Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="0x... or T..."
                  className="w-full px-3 py-2 rounded-xl bg-app-card border border-app font-mono font-bold text-app"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="whitelistCheck"
                  checked={newWhitelisted}
                  onChange={(e) => setNewWhitelisted(e.target.checked)}
                  className="rounded border-app text-accent focus:ring-accent"
                />
                <label htmlFor="whitelistCheck" className="text-xs font-bold text-app flex items-center gap-1.5 cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Whitelist this address (bypasses future delay checks)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all"
              >
                Save to Address Book
              </button>
            </form>
          )}

          {/* List of Addresses */}
          {addressBook.length === 0 ? (
            <div className="text-center py-12 text-app-sec space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">No saved addresses found. Add one for quick withdrawals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addressBook.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-app-sub/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-app-sec transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1 hover:scale-110 transition-transform ${item.isFavorite ? 'text-amber-400' : 'text-app-sec/40'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      <span className="text-sm font-extrabold text-app">{item.nickname}</span>

                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-accent/15 text-accent">
                        {item.asset} ({item.network})
                      </span>

                      {item.isWhitelisted && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>WHITELISTED</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-app-sec break-all">
                      <span>{item.address}</span>
                      <button
                        onClick={() => handleCopy(item.id, item.address)}
                        className="p-1 hover:text-accent transition-colors shrink-0"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onToggleWhitelist(item.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
                        item.isWhitelisted 
                          ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' 
                          : 'border-app text-app-sec hover:text-app'
                      }`}
                    >
                      {item.isWhitelisted ? 'Whitelisted' : 'Whitelist'}
                    </button>

                    <button
                      onClick={() => onDeleteAddress(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
