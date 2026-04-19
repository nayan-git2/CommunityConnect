import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { History, Download, Filter, Search } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

const ReportsHistoryPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const exportToCSV = () => {
    const headers = ['Date', 'Reporter', 'Location', 'Type', 'Urgency', 'Status', 'Description'];
    const rows = reports.map(r => [
      formatDate(r.createdAt),
      r.reporterName,
      r.location,
      r.problemType,
      r.aiScore,
      r.status,
      r.description.replace(/,/g, ';')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `community_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = reports.filter(r => 
    r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.problemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Intelligence Archive</h1>
          <p className="text-gray-500 font-medium">Historical database of community incidents and AI assessments</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
        >
          <Download className="w-5 h-5" />
          Export Intelligence Data
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location, type, or reporter..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 rounded-2xl transition-all shadow-sm">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reporter</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Urgency</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium whitespace-nowrap">{formatDate(report.createdAt)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs">
                        {report.reporterName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{report.reporterName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600 font-medium">{report.location}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {report.problemType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {report.photoUrl ? (
                      <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded-xl overflow-hidden border border-gray-100 hover:scale-110 transition-transform shadow-sm">
                        <img src={report.photoUrl} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </a>
                    ) : (
                      <div className="w-12 h-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <History className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        report.aiScore >= 8 ? "bg-red-500" : report.aiScore >= 5 ? "bg-orange-500" : "bg-green-500"
                      )} />
                      <span className="text-sm font-bold text-gray-900">{report.aiScore}/10</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      report.status === 'open' ? 'bg-yellow-50 text-yellow-600' :
                      report.status === 'assigned' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    )}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No intelligence reports match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsHistoryPage;
