import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, MapPin, Users, History, LogOut, UserPlus, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['coordinator'] },
    { label: 'Submit Report', path: '/submit', icon: MapPin, roles: ['field_worker', 'coordinator'] },
    { label: 'Volunteer Matching', path: '/match', icon: Users, roles: ['coordinator'] },
    { label: 'Reports History', path: '/reports', icon: History, roles: ['coordinator'] },
    { label: 'Volunteer Registration', path: '/volunteer', icon: UserPlus, roles: ['field_worker', 'coordinator'] },
  ];

  const filteredItems = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">CommunityConnect</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-100 mx-4" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
