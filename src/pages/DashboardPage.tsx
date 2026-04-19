import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  AlertCircle, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Map as MapIcon, 
  Activity,
  ArrowUpRight,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

// Fix Leaflet icon issue
const icon = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to fix map size in iframes
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
};

const DashboardPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    volunteers: 0,
    resolved: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
      
      const criticalCount = reportsData.filter((r: any) => r.aiScore >= 8).length;
      const resolvedCount = reportsData.filter((r: any) => r.status === 'resolved').length;
      
      setStats(prev => ({
        ...prev,
        total: reportsData.length,
        critical: criticalCount,
        resolved: resolvedCount
      }));
    });

    return () => unsubscribe();
  }, []);

  // Mock Trend Data for Recharts
  const trendData = useMemo(() => [
    { name: 'Mon', value: 4 },
    { name: 'Tue', value: 7 },
    { name: 'Wed', value: 5 },
    { name: 'Thu', value: 12 },
    { name: 'Fri', value: 9 },
    { name: 'Sat', value: 15 },
    { name: 'Sun', value: 10 },
  ], []);

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 font-medium">Intelligence-driven community response dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <Activity className="w-4 h-4 animate-pulse" />
            LIVE SYSTEM ACTIVE
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        {[
          { label: 'Total Incidents', value: stats.total, icon: Clock, color: 'blue', trend: '+12%' },
          { label: 'Critical Needs', value: stats.critical, icon: AlertCircle, color: 'red', trend: 'High Priority' },
          { label: 'Active Volunteers', value: 24, icon: Users, color: 'purple', trend: '8 Available' },
          { label: 'Resolved Cases', value: stats.resolved, icon: CheckCircle, color: 'green', trend: '84% Rate' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", 
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-green-50 text-green-600'
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-tight mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-display font-bold text-gray-900">{stat.value}</p>
                <ArrowUpRight className="w-4 h-4 text-green-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}

        {/* Map Section - Spans 3 columns on large screens */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col relative group">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-gray-400" />
              <h2 className="font-display font-bold text-gray-900">Geospatial Intelligence</h2>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 z-0 relative">
            <MapContainer center={[19.076, 72.877]} zoom={12} className="w-full h-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <MapResizer />
              {reports.map((report) => (
                <Marker key={report.id} position={[19.076 + (Math.random() - 0.5) * 0.1, 72.877 + (Math.random() - 0.5) * 0.1]}>
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          report.aiScore >= 8 ? "bg-red-500" : report.aiScore >= 5 ? "bg-orange-500" : "bg-green-500"
                        )} />
                        <h3 className="font-bold text-gray-900">{report.problemType}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{report.location}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Urgency</span>
                        <span className="text-sm font-bold text-gray-900">{report.aiScore}/10</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <h2 className="font-display font-bold text-gray-900">Incident Trends</h2>
            </div>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} dy={10} />
                <YAxis hide />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Weekly Summary</p>
            <p className="text-sm text-gray-600 font-medium">System reports a <span className="text-blue-600 font-bold">24% increase</span> in medical needs this week.</p>
          </div>
        </div>

        {/* Critical Feed */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900 text-xl">High-Priority Feed</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All Reports</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {reports.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)).slice(0, 6).map((report) => (
              <div key={report.id} className="group p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    report.aiScore >= 8 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {report.problemType}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase">Urgency</span>
                    <span className="text-xl font-display font-bold text-gray-900">{report.aiScore}/10</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{report.location}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{report.description}</p>
                
                {report.photoUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden h-32 border border-gray-100 shadow-sm">
                    <img src={report.photoUrl} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                    Deploy Volunteer
                  </button>
                  <button className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-gray-600 hover:border-gray-300 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
