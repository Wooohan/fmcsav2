
import React, { useState } from 'react';
import { Search, Eye, X, MapPin, Phone, Mail, Hash, Truck, UserCheck, Calendar, ShieldCheck, Download, Filter, Shield, Loader2 } from 'lucide-react';
import { CarrierData, InsurancePolicy } from '../types';
import { downloadCSV, scrapeInsuranceData } from '../services/mockService';

interface CarrierSearchProps {
  carriers: CarrierData[];
  onUpdateCarriers: (newData: CarrierData[]) => void;
}

export const CarrierSearch: React.FC<CarrierSearchProps> = ({ carriers, onUpdateCarriers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierData | null>(null);
  const [isFetchingInsurance, setIsFetchingInsurance] = useState(false);

  const filteredCarriers = carriers.filter(c => 
    c.mcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFetchInsurance = async () => {
    if (!selectedCarrier) return;
    setIsFetchingInsurance(true);
    try {
      const policies = await scrapeInsuranceData(selectedCarrier.dotNumber);
      const updatedCarrier = { ...selectedCarrier, insurancePolicies: policies };
      
      // Update local state for modal
      setSelectedCarrier(updatedCarrier);
      
      // Update global state in App.tsx
      const globalUpdated = carriers.map(c => 
        c.mcNumber === selectedCarrier.mcNumber ? updatedCarrier : c
      );
      onUpdateCarriers(globalUpdated);
    } catch (e) {
      console.error("Insurance fetch failed", e);
    } finally {
      setIsFetchingInsurance(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Carrier Database</h1>
          <p className="text-sm text-slate-400">Manage {carriers.length} extracted FMCSA records.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => downloadCSV(filteredCarriers)}
            disabled={filteredCarriers.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
          >
            <Download size={16} /> Export Results
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search MC#, DOT#, or Name..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 backdrop-blur sticky top-0 z-10 border-b border-slate-700">
              <tr>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase text-slate-500">MC Number</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase text-slate-500">Legal Name</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase text-slate-500">Insurance</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase text-slate-500">Status</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCarriers.map((carrier, idx) => (
                <tr key={idx} className="hover:bg-indigo-500/5 group transition-colors">
                  <td className="p-4 md:p-5 font-mono text-indigo-400 font-bold">{carrier.mcNumber}</td>
                  <td className="p-4 md:p-5">
                    <div className="font-semibold text-white truncate max-w-[200px]">{carrier.legalName}</div>
                  </td>
                  <td className="p-4 md:p-5">
                    {carrier.insurancePolicies ? (
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                        {carrier.insurancePolicies.length} Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">Unverified</span>
                    )}
                  </td>
                  <td className="p-4 md:p-5">
                    <div className={`flex items-center gap-2 ${carrier.status.includes('NOT AUTHORIZED') ? 'text-red-400' : 'text-green-400'}`}>
                      <ShieldCheck size={14} className="shrink-0" />
                      <span className="text-[10px] font-medium truncate max-w-[100px]">{carrier.status}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <button 
                      onClick={() => setSelectedCarrier(carrier)}
                      className="p-2 bg-slate-700/50 hover:bg-green-600 text-green-400 hover:text-white rounded-lg transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCarrier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in duration-300">
            
            <div className="p-5 md:p-8 border-b border-slate-800 bg-slate-800/50 flex justify-between items-start">
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-1">{selectedCarrier.legalName}</h2>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${selectedCarrier.status.includes('NOT AUTHORIZED') ? 'bg-red-500' : 'bg-green-500'}`}>
                      {selectedCarrier.status}
                    </span>
                    {selectedCarrier.insurancePolicies && (
                      <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-[9px] uppercase font-black">Insured</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCarrier(null)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3"><Hash size={14} className="inline mr-1" /> IDs</h3>
                    <div className="space-y-2 bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-[11px] md:text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">MC#</span><span className="text-white font-mono">{selectedCarrier.mcNumber}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">DOT#</span><span className="text-white font-mono">{selectedCarrier.dotNumber}</span></div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3"><Phone size={14} className="inline mr-1" /> Contact</h3>
                    <div className="space-y-2 bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-[11px] md:text-xs overflow-hidden">
                       <div className="text-white truncate">{selectedCarrier.phone}</div>
                       <div className="text-indigo-400 truncate break-all">{selectedCarrier.email || 'No email found'}</div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3"><Calendar size={14} className="inline mr-1" /> Compliance</h3>
                    <div className="space-y-3 bg-slate-800/30 p-4 rounded-xl border border-slate-800 text-[10px] md:text-[11px]">
                      <div><div className="text-slate-500 mb-0.5">MCS-150 DATE</div><div className="text-white font-bold">{selectedCarrier.mcs150Date}</div></div>
                      <div><div className="text-slate-500 mb-0.5">VMT MILEAGE</div><div className="text-white line-clamp-2 leading-tight">{selectedCarrier.mcs150Mileage}</div></div>
                      <div><div className="text-slate-500 mb-0.5">OOS DATE</div><div className="text-red-400 font-bold">{selectedCarrier.outOfServiceDate || 'NONE'}</div></div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Shield size={14} className="inline mr-1" /> Insurance</h3>
                      {!selectedCarrier.insurancePolicies && (
                        <button 
                          onClick={handleFetchInsurance}
                          disabled={isFetchingInsurance}
                          className="text-[9px] bg-indigo-600 hover:bg-indigo-500 px-2 py-0.5 rounded text-white font-bold flex items-center gap-1"
                        >
                          {isFetchingInsurance ? <Loader2 size={10} className="animate-spin" /> : <Shield size={10} />}
                          FETCH DATA
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedCarrier.insurancePolicies ? (
                        selectedCarrier.insurancePolicies.map((p, i) => (
                          <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px]">
                            <div className="flex justify-between font-bold mb-1">
                              <span className="text-green-400">{p.type}</span>
                              <span className="text-indigo-400">${Number(p.coverageAmount).toLocaleString()}</span>
                            </div>
                            <div className="text-white mb-0.5">{p.carrier}</div>
                            <div className="flex justify-between text-slate-500 italic">
                              <span>#{p.policyNumber}</span>
                              <span>Eff: {p.effectiveDate}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                          <Shield size={24} className="mx-auto text-slate-700 mb-2 opacity-20" />
                          <p className="text-[10px] text-slate-600">Verification Required</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

              </div>
            </div>

            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-4">
              <button onClick={() => setSelectedCarrier(null)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium">Close</button>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <Download size={16} /> Export Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
