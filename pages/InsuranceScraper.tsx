
import React, { useState } from 'react';
import { ShieldCheck, Play, Download, Search, AlertCircle, CheckCircle2, Loader2, Database, History } from 'lucide-react';
import { CarrierData, InsurancePolicy } from '../types';
import { checkUserInsuranceAccess, scrapeInsuranceData, downloadCSV } from '../services/mockService';

interface InsuranceScraperProps {
  carriers: CarrierData[];
  onUpdateCarriers: (newData: CarrierData[]) => void;
}

export const InsuranceScraper: React.FC<InsuranceScraperProps> = ({ carriers, onUpdateCarriers }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [foundPolicies, setFoundPolicies] = useState<number>(0);

  const startBatchVerification = async () => {
    if (carriers.length === 0) {
      setLogs(prev => [...prev, "❌ No carriers in database. Scrape some carriers first."]);
      return;
    }

    setIsProcessing(true);
    setLogs(prev => [...prev, "🔍 Verifying API Access..."]);
    
    const access = await checkUserInsuranceAccess('wooohan57@gmail.com');
    if (access.status !== 1) {
      setLogs(prev => [...prev, "❌ API Access Denied."]);
      setIsProcessing(false);
      return;
    }

    setLogs(prev => [...prev, `✅ Authorized. Starting verification for ${carriers.length} carriers...`]);
    
    const updatedCarriers = [...carriers];
    let completed = 0;
    let policiesCount = 0;

    for (let i = 0; i < updatedCarriers.length; i++) {
      const carrier = updatedCarriers[i];
      setLogs(prev => [...prev, `⏳ Fetching policies for DOT# ${carrier.dotNumber}...`]);
      
      try {
        const policies = await scrapeInsuranceData(carrier.dotNumber);
        updatedCarriers[i] = { ...carrier, insurancePolicies: policies };
        policiesCount += policies.length;
        setFoundPolicies(policiesCount);
        setLogs(prev => [...prev, `✨ MC ${carrier.mcNumber}: Found ${policies.length} policies.`]);
      } catch (e) {
        setLogs(prev => [...prev, `⚠️ Error fetching DOT# ${carrier.dotNumber}`]);
      }

      completed++;
      setProgress(Math.round((completed / updatedCarriers.length) * 100));
    }

    onUpdateCarriers(updatedCarriers);
    setIsProcessing(false);
    setLogs(prev => [...prev, "✅ Batch process completed successfully."]);
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Insurance Center</h1>
          <p className="text-slate-400">Deep-dive insurance verification using searchcarriers.com data source.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startBatchVerification}
            disabled={isProcessing || carriers.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            Process All Database Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Queue Size</span>
                <span className="text-2xl font-bold text-white">{carriers.length}</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Found Policies</span>
                <span className="text-2xl font-bold text-green-400">{foundPolicies}</span>
              </div>
            </div>
            
            <div className="mt-6">
               <div className="flex justify-between text-xs mb-2">
                 <span className="text-slate-500 uppercase">Progress</span>
                 <span className="text-indigo-400 font-bold">{progress}%</span>
               </div>
               <div className="w-full bg-slate-950 rounded-full h-1.5">
                 <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
               </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-white">Security & Proxy</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We use rotated user-agents and session persistence to ensure continuous access to insurance databases without triggering rate limits.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6 h-full min-h-0">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <span className="text-slate-500">INSURANCE_LOGS_v2.0</span>
              <History size={14} className="text-slate-600" />
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes('❌') ? 'text-red-400' : log.includes('✅') || log.includes('✨') ? 'text-green-400' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
              {logs.length === 0 && <span className="text-slate-700 italic">Standby...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
