import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Globe, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VolunteerProfileModalProps {
  volunteer: any;
  isOpen: boolean;
  onClose: () => void;
}

const VolunteerProfileModal: React.FC<VolunteerProfileModalProps> = ({ volunteer, isOpen, onClose }) => {
  if (!volunteer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
          >
            {/* Header */}
            <div className="bg-purple-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {volunteer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{volunteer.name}</h2>
                  <p className="text-purple-100 flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3" /> {volunteer.location || 'Location not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{volunteer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{volunteer.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills && volunteer.skills.length > 0 ? (
                    volunteer.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {volunteer.languages && volunteer.languages.length > 0 ? (
                    volunteer.languages.map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No languages listed</p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Availability
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {volunteer.availability || 'Availability details not provided'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VolunteerProfileModal;
