import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { matchVolunteers } from '../ai/gemini';
import { sendAssignmentEmail } from '../utils/notifications';
import { Users, Search, Loader2, Check, Star, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import VolunteerProfileModal from '../components/VolunteerProfileModal';

const VolunteerMatchingPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const qReports = query(collection(db, 'reports'), where('status', '==', 'open'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qVolunteers = query(collection(db, 'volunteers'), where('isAvailable', '==', true));
    const unsubscribeVolunteers = onSnapshot(qVolunteers, (snapshot) => {
      setVolunteers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeReports();
      unsubscribeVolunteers();
    };
  }, []);

  const handleFindMatch = async () => {
    if (!selectedReportId) return;
    setLoading(true);
    setMatches([]);
    
    const report = reports.find(r => r.id === selectedReportId);
    try {
      const result = await matchVolunteers(report, volunteers);
      setMatches(result.matches || []);
    } catch (error) {
      console.error("Matching error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (volunteerMatch: any) => {
    setAssigningId(volunteerMatch.id);
    try {
      const report = reports.find(r => r.id === selectedReportId);
      const volunteer = volunteers.find(v => v.id === volunteerMatch.id);

      // 1. Update report status
      await updateDoc(doc(db, 'reports', selectedReportId), {
        status: 'assigned',
        assignedVolunteerId: volunteerMatch.id,
        updatedAt: serverTimestamp()
      });

      // 2. Update volunteer status
      await updateDoc(doc(db, 'volunteers', volunteerMatch.id), {
        isAvailable: false,
        assignedTaskId: selectedReportId
      });

      // 3. Create assignment record
      await addDoc(collection(db, 'assignments'), {
        reportId: selectedReportId,
        volunteerId: volunteerMatch.id,
        assignedAt: serverTimestamp(),
        status: 'active'
      });

      // 4. Send Email Notification
      if (volunteer && volunteer.email) {
        await sendAssignmentEmail(volunteer.email, volunteer.name, report);
      }

      // Clear selection
      setSelectedReportId('');
      setMatches([]);
      alert("Volunteer assigned successfully and notified via email!");
    } catch (error) {
      console.error("Assignment error:", error);
    } finally {
      setAssigningId(null);
    }
  };

  const handleViewProfile = (match: any) => {
    const fullVolunteer = volunteers.find(v => v.id === match.id);
    if (fullVolunteer) {
      setSelectedVolunteer(fullVolunteer);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gray-900 rounded-2xl shadow-lg">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">AI Matching Engine</h1>
              <p className="text-gray-500 font-medium">Neural optimization for volunteer deployment</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Select Active Incident</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <select
                    className="w-full pl-5 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                    value={selectedReportId}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                  >
                    <option value="">Choose an incident report...</option>
                    {reports.map(r => (
                      <option key={r.id} value={r.id}>
                        [{r.problemType}] {r.location} (Urgency: {r.aiScore}/10)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <MoreHorizontal className="w-5 h-5 text-gray-400 rotate-90" />
                  </div>
                </div>
                <button
                  onClick={handleFindMatch}
                  disabled={!selectedReportId || loading}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-xl shadow-gray-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Compute Matches
                </button>
              </div>
            </div>

            {loading && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                  <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-display font-bold text-gray-900">Analyzing Personnel Data</p>
                  <p className="text-gray-500 font-medium max-w-md mx-auto">Gemini AI is cross-referencing skills, availability, and geospatial proximity for optimal matching.</p>
                </div>
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    Top Recommended Personnel
                  </h2>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3 Matches Found</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {matches.map((match, idx) => (
                    <div key={idx} className="group bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl">
                            {match.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-gray-900 text-xl">{match.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {match.matchScore}% Compatibility
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium italic">"{match.reason}"</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewProfile(match)}
                          className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                          title="View Intelligence Profile"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleAssign(match)}
                          disabled={assigningId === match.id}
                          className="flex-1 lg:flex-none px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200"
                        >
                          {assigningId === match.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          Deploy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <VolunteerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        volunteer={selectedVolunteer}
      />
    </div>
  );
};

export default VolunteerMatchingPage;
