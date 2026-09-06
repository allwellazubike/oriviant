import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, RefreshCw, Zap, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { PracticeScenario } from '../../types/academy';

interface PracticeSimulationProps {
  scenario: PracticeScenario;
  onCompleted: (scenarioId: string) => void;
  onClose: () => void;
}

export const PracticeSimulation: React.FC<PracticeSimulationProps> = ({
  scenario,
  onCompleted,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [entryPrice, setEntryPrice] = useState<number>(scenario.currentPrice);
  const [stopLoss, setStopLoss] = useState<number>(scenario.currentPrice * 0.95);
  const [takeProfit, setTakeProfit] = useState<number>(scenario.currentPrice * 1.10);
  const [positionSizeUsdt, setPositionSizeUsdt] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(5);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Risk Calculation Math
  const riskAmountUsdt = Math.abs((entryPrice - stopLoss) / entryPrice) * positionSizeUsdt * leverage;
  const rewardAmountUsdt = Math.abs((takeProfit - entryPrice) / entryPrice) * positionSizeUsdt * leverage;
  const riskRewardRatio = riskAmountUsdt > 0 ? (rewardAmountUsdt / riskAmountUsdt).toFixed(2) : '0';
  const totalAccountRiskPercent = ((riskAmountUsdt / 10000) * 100).toFixed(1);

  const isOptimalSetup = Number(totalAccountRiskPercent) <= 3.0 && Number(riskRewardRatio) >= 1.5;

  const handleSubmitSimulation = () => {
    setIsSubmitted(true);
    onCompleted(scenario.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-app-card border border-app rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-app pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-extrabold uppercase">
              <Zap className="w-3.5 h-3.5" /> Interactive Trading Simulation
            </div>
            <h2 className="text-lg sm:text-xl font-black text-app mt-1">{scenario.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app text-xs font-bold">
            Close Simulation
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-app-sec leading-relaxed">
          {scenario.description}
        </p>

        {!isSubmitted ? (
          <div className="space-y-6">
            
            {/* Live Scenario Parameters */}
            <div className="p-4 rounded-2xl bg-app-sec/40 border border-app grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-app-sec text-[10px] uppercase font-bold block">Pair</span>
                <strong className="text-app font-black text-sm">{scenario.coinSymbol}</strong>
              </div>
              <div>
                <span className="text-app-sec text-[10px] uppercase font-bold block">Current Price</span>
                <strong className="text-emerald-500 font-black text-sm">${scenario.currentPrice.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-app-sec text-[10px] uppercase font-bold block">Account Cash</span>
                <strong className="text-app font-black text-sm">$10,000 USDT</strong>
              </div>
              <div>
                <span className="text-app-sec text-[10px] uppercase font-bold block">Mode</span>
                <strong className="text-accent font-black text-sm">Risk-Free Demo</strong>
              </div>
            </div>

            {/* Interactive Options or Sliders */}
            {scenario.options ? (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-app uppercase tracking-wider block">
                  Select Optimal Trading Decision:
                </label>
                {scenario.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-2xl text-xs sm:text-sm text-left font-bold border transition-all ${
                      selectedOption === idx
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                        : 'bg-app-card text-app border-app hover:border-accent/40'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              /* Risk Management Parameter Calculator */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  <div className="space-y-1.5">
                    <label className="font-bold text-app">Entry Price ($)</label>
                    <input
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-app-sec text-app border border-app font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-app">Stop Loss ($)</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-app-sec text-app border border-app font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-app">Take Profit ($)</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-app-sec text-app border border-app font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-app">Margin Amount ($ USDT)</label>
                    <input
                      type="number"
                      value={positionSizeUsdt}
                      onChange={(e) => setPositionSizeUsdt(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-app-sec text-app border border-app font-mono font-bold"
                    />
                  </div>

                </div>

                {/* Risk Math Preview Card */}
                <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-app-sec uppercase block">Max Loss</span>
                    <strong className="text-red-500 font-extrabold">${riskAmountUsdt.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-app-sec uppercase block">Target Profit</span>
                    <strong className="text-emerald-500 font-extrabold">${rewardAmountUsdt.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-app-sec uppercase block">Risk:Reward</span>
                    <strong className="text-accent font-extrabold">1 : {riskRewardRatio}</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitSimulation}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20"
            >
              Execute Simulated Order & Review Risk
            </button>

          </div>
        ) : (
          /* SUBMITTED FEEDBACK & EVALUATION */
          <div className="space-y-6">
            
            <div className={`p-6 rounded-3xl text-center space-y-2 border ${
              isOptimalSetup 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}>
              <div className="w-12 h-12 rounded-full bg-app-card mx-auto flex items-center justify-center font-bold text-2xl shadow-inner">
                {isOptimalSetup ? '⚡' : '⚠️'}
              </div>
              <h3 className="text-xl font-black">
                {isOptimalSetup ? 'Optimal Risk Execution!' : 'Sub-Optimal Risk Exposure Identified'}
              </h3>
              <p className="text-xs font-semibold">
                Risk-to-Reward Ratio: <strong className="font-extrabold">1 : {riskRewardRatio}</strong> • Account Risk: <strong className="font-extrabold">{totalAccountRiskPercent}%</strong>
              </p>
            </div>

            {/* Detailed Feedback Tips */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <h4 className="font-extrabold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Why this execution was structured well:
                </h4>
                <p className="text-app-sec">{scenario.feedbackTips.optimal}</p>
              </div>

              {!isOptimalSetup && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <h4 className="font-extrabold text-amber-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Potential risk flaws to avoid in real markets:
                  </h4>
                  <p className="text-app-sec">{scenario.feedbackTips.flawed}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-app">
              <button
                onClick={() => setIsSubmitted(false)}
                className="flex-1 py-3 rounded-2xl bg-app-sec text-app font-bold text-xs hover:bg-app-sec/80 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Re-run Simulation
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-accent text-white font-extrabold text-xs shadow-lg shadow-accent/20"
              >
                Complete & Back to Academy
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
