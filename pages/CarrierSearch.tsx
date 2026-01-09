
import React, { useState } from 'react';
import { Search, Eye, X, MapPin, Phone, Mail, Hash, Truck, UserCheck, Calendar, ShieldCheck, Download, Filter } from 'lucide-react';
import { CarrierData } from '../types';
import { downloadCSV } from '../services/mockService';

interface CarrierSearchProps {
  carriers: CarrierData[];
}

export const CarrierSearch: React.FC<CarrierSearchProps> = ({ carriers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierData | null>(null);

  const filteredCarriers = carriers.filter(c => 
    c.mcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (filteredCarriers.length > 0) {
      downloadCSV(filteredCarriers);
    }
  };

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Carrier Database</h1>
          <p className="text-sm text-slate-400">Search and manage all extracted FMCSA records.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExport}
            disabled={filteredCarriers.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
          >
            <Download size={16} />
            Export Results
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search by MC#, DOT#, or Legal Name..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xl text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          <Filter size={12} />
          {filteredCarriers.length} Carriers Found
        </div>
      </div>

      {/* Database Table */}
      <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 backdrop-blur sticky top-0 z-10 border-b border-slate-700">
              <tr>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">MC Number</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Legal Name</th>
                <th className="hidden lg:table-cell p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Entity</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="hidden sm:table-cell p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Email</th>
                <th className="p-4 md:p-5 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCarriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <div className="p-4 bg-slate-900 rounded-full">
                        <Search size={32} />
                      </div>
                      <p className="text-lg font-medium">No records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCarriers.map((carrier, idx) => (
                  <tr key={idx} className="hover:bg-indigo-500/5 group transition-colors">
                    <td className="p-4 md:p-5 font-mono text-indigo-400 font-bold">{carrier.mcNumber}</td>
                    <td className="p-4 md:p-5">
                      <div className="font-semibold text-white truncate max-w-[120px] md:max-w-[200px]">{carrier.legalName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px] md:max-w-[200px]">{carrier.dbaName || '-'}</div>
                    </td>
                    <td className="hidden lg:table-cell p-4 md:p-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${carrier.entityType.includes('BROKER') ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {carrier.entityType}
                      </span>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className={`flex items-center gap-2 ${carrier.status.includes('NOT AUTHORIZED') ? 'text-red-400' : 'text-green-400'}`}>
                        <ShieldCheck size={14} className="shrink-0" />
                        <span className="text-[10px] md:text-xs font-medium max-w-[80px] md:max-w-[120px] truncate" title={carrier.status}>{carrier.status}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell p-4 md:p-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail size={14} className="text-slate-600 shrink-0" />
                        <span className="truncate max-w-[100px] md:max-w-[150px] text-xs">{carrier.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <button 
                        onClick={() => setSelectedCarrier(carrier)}
                        className="p-2 bg-slate-700/50 hover:bg-green-600 text-green-400 hover:text-white rounded-lg transition-all group-hover:scale-110"
                        title="View Full Profile"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal Popup */}
      {selectedCarrier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[95vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header */}
            <div className="p-5 md:p-8 border-b border-slate-800 bg-slate-800/50 flex justify-between items-start">
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                    <h2 className="text-xl md:text-3xl font-bold text-white truncate max-w-[200px] md:max-w-md">{selectedCarrier.legalName}</h2>
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-tight shrink-0 ${selectedCarrier.status.includes('NOT AUTHORIZED') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {selectedCarrier.status.includes('NOT AUTHORIZED') ? 'Inactive' : 'Active Authority'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium truncate">{selectedCarrier.dbaName || 'No Registered DBA'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCarrier(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Identification Column */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Hash size={14} /> Identification
                    </h3>
                    <div className="space-y-3 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">MC/MX#</span>
                        <span className="text-white font-mono text-xs md:text-sm">{selectedCarrier.mcNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">DOT#</span>
                        <span className="text-white font-mono text-xs md:text-sm">{selectedCarrier.dotNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">DUNS#</span>
                        <span className="text-white font-mono text-xs md:text-sm">{selectedCarrier.dunsNumber || '--'}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <UserCheck size={14} /> Operations
                    </h3>
                    <div className="space-y-3 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">Entity Type</span>
                        <span className="text-white text-[11px] md:text-sm font-semibold">{selectedCarrier.entityType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">Power Units</span>
                        <span className="text-white text-[11px] md:text-sm font-semibold">{selectedCarrier.powerUnits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px] md:text-xs">Drivers</span>
                        <span className="text-white text-[11px] md:text-sm font-semibold">{selectedCarrier.drivers}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Contact & Address Column */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin size={14} /> Physical Address
                    </h3>
                    <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                      <p className="text-white text-xs md:text-sm leading-relaxed">{selectedCarrier.physicalAddress}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Phone size={14} /> Contact Details
                    </h3>
                    <div className="space-y-3 bg-slate-800/30 p-4 rounded-2xl border border-slate-800 overflow-hidden">
                      <div className="flex items-center gap-3">
                        <Phone size={14} className="text-indigo-400 shrink-0" />
                        <span className="text-white text-xs md:text-sm">{selectedCarrier.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                        <span className="text-white text-[11px] md:text-sm break-all leading-tight">{selectedCarrier.email || 'No email found'}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Compliance Column - Fixing font size and layout for small spaces */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Calendar size={14} /> Compliance Dates
                    </h3>
                    <div className="space-y-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 text-[9px] uppercase font-bold">MCS-150 Date</span>
                        <span className="text-white text-[11px] md:text-xs font-semibold">{selectedCarrier.mcs150Date}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 text-[9px] uppercase font-bold">VMT Mileage</span>
                        <div className="max-h-24 overflow-y-auto text-white text-[11px] md:text-xs font-medium scrollbar-hide bg-slate-900/40 p-2 rounded-lg leading-snug">
                          {selectedCarrier.mcs150Mileage}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 text-[9px] uppercase font-bold">OOS Date</span>
                        <span className="text-red-400 text-[11px] md:text-xs font-bold">{selectedCarrier.outOfServiceDate || 'NONE'}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       Cargo Carried
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCarrier.cargoCarried.length > 0 ? (
                        selectedCarrier.cargoCarried.slice(0, 8).map((cargo, idx) => (
                          <span key={idx} className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md text-[9px] border border-indigo-500/20 whitespace-nowrap">
                            {cargo}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">No specific cargo data</span>
                      )}
                    </div>
                  </section>
                </div>

              </div>

              {/* Extended Info Footer */}
              <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Operation Classifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCarrier.operationClassification.length > 0 ? selectedCarrier.operationClassification.map((op, i) => (
                        <span key={i} className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full text-[10px]">
                          {op}
                        </span>
                      )) : <span className="text-slate-600 text-xs">N/A</span>}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Carrier Operation</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCarrier.carrierOperation.length > 0 ? selectedCarrier.carrierOperation.map((op, i) => (
                        <span key={i} className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full text-[10px]">
                          {op}
                        </span>
                      )) : <span className="text-slate-600 text-xs">N/A</span>}
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 md:p-6 bg-slate-950/50 border-t border-slate-800 flex flex-col md:flex-row justify-end gap-3 md:gap-4">
              <button 
                onClick={() => setSelectedCarrier(null)}
                className="order-2 md:order-1 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all text-sm"
              >
                Close
              </button>
              <button 
                onClick={() => downloadCSV([selectedCarrier])}
                className="order-1 md:order-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <Download size={18} /> Export Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
