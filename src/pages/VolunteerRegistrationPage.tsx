import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';

interface VolunteerFormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  skills: string[];
  availability: string;
  languages: string;
}

const VolunteerRegistrationPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VolunteerFormData>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const skillsOptions = ["Medical", "Driving", "Teaching", "Cooking", "Construction", "Translation", "Counselling"];

  const onSubmit = async (data: VolunteerFormData) => {
    setLoading(true);
    setSuccess(false);
    try {
      await addDoc(collection(db, 'volunteers'), {
        ...data,
        isAvailable: true,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      reset();
    } catch (error) {
      console.error("Error registering volunteer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Volunteer Registration</h1>
            <p className="text-gray-500">Join our network of community helpers</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Registration successful! Thank you for joining.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('phone', { required: 'Phone is required' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (City/Area)</label>
              <input
                {...register('location', { required: 'Location is required' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Mumbai, West"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skillsOptions.map(skill => (
                <label key={skill} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={skill}
                    {...register('skills')}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                {...register('availability', { required: true })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Anytime">Anytime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <input
                {...register('languages')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="English, Hindi, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register as Volunteer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRegistrationPage;
