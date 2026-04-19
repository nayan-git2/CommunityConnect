import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { scoreUrgency } from '../ai/gemini';
import { classifyReport } from '../ai/huggingface';
import { useAuth } from '../AuthContext';
import { MapPin, Send, Loader2, Camera, X, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ReportFormData {
  reporterName: string;
  phone: string;
  location: string;
  problemType: string;
  description: string;
  peopleAffected: number;
  selfUrgency: 'Low' | 'Medium' | 'High';
}

const SubmitReportPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportFormData>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    setSuccess(false);
    try {
      let photoUrl = '';
      if (photo) {
        const photoRef = ref(storage, `reports/${Date.now()}_${photo.name}`);
        const uploadResult = await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      // 1. Get AI Urgency Score and Category from Gemini
      const aiResult = await scoreUrgency(data.description);
      
      // 2. Optional: Hugging Face Classification
      const hfResult = await classifyReport(data.description);
      
      // 3. Save to Firestore
      await addDoc(collection(db, 'reports'), {
        ...data,
        aiScore: aiResult.score,
        aiReason: aiResult.reason,
        aiCategory: aiResult.category,
        hfClassification: hfResult,
        photoUrl,
        status: 'open',
        reporterUid: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setPhoto(null);
      setPhotoPreview(null);
      reset();
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gray-900 rounded-2xl shadow-lg">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Field Intelligence</h1>
              <p className="text-gray-500 font-medium">Submit real-time community needs for AI analysis</p>
            </div>
          </div>

          {success && (
            <div className="mb-8 p-5 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="font-bold">Report transmitted successfully. AI scoring in progress.</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reporter Identity</label>
                <input
                  {...register('reporterName', { required: 'Name is required' })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="Your full name"
                />
                {errors.reporterName && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.reporterName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Channel</label>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="Phone or radio ID"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Geospatial Location</label>
              <div className="relative">
                <input
                  {...register('location', { required: 'Location is required' })}
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="GPS coordinates or area name"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.location && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Incident Category</label>
                <select
                  {...register('problemType', { required: 'Type is required' })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="">Select category...</option>
                  <option value="Food">Food Shortage</option>
                  <option value="Water">Water Crisis</option>
                  <option value="Medical">Medical Emergency</option>
                  <option value="Shelter">Shelter/Housing</option>
                  <option value="Education">Education Support</option>
                  <option value="Other">Other Incident</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Human Impact</label>
                <input
                  type="number"
                  {...register('peopleAffected', { required: 'Number is required', min: 1 })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="Estimated people affected"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Situation Intelligence</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium resize-none"
                placeholder="Provide detailed context for AI analysis..."
              />
              {errors.description && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Field Urgency Assessment</label>
              <div className="flex flex-wrap gap-3">
                {['Low', 'Medium', 'High'].map((level) => (
                  <label key={level} className="flex-1 min-w-[100px] cursor-pointer group">
                    <input
                      type="radio"
                      value={level}
                      {...register('selfUrgency', { required: true })}
                      className="peer hidden"
                    />
                    <div className={cn(
                      "py-4 rounded-2xl border text-center font-bold transition-all",
                      "peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900",
                      "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                    )}>
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Visual Evidence</label>
              <div className="flex items-center gap-6">
                <label className="flex flex-col items-center justify-center w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden relative group">
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-8 h-8 text-white" onClick={(e) => {
                          e.preventDefault();
                          setPhoto(null);
                          setPhotoPreview(null);
                        }} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Camera className="w-8 h-8 text-gray-300 mb-2 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Capture / Upload</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-gray-900">Visual Documentation</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    High-resolution evidence significantly improves AI urgency scoring and coordinator response time.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 px-6 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 shadow-xl shadow-gray-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Intelligence Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Transmit Intelligence Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitReportPage;
