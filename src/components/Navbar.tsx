import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  User,
  LogIn,
  UserPlus,
  Home,
  Menu,
  X,
  Server,
  LogOut,
} from 'lucide-react';
import { apiService } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { SystemHealthData } from '../types/index.ts';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealthData | null>(null);

  useEffect(() => {
    apiService.getHealth().then((data) => setHealth(data));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', {
      state: { notice: 'You have been safely signed out.' },
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(!isAuthenticated
      ? [
          { name: 'Login', path: '/login', icon: LogIn },
          { name: 'Register', path: '/register', icon: UserPlus },
        ]
      : []),
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Login Activity', path: '/login-activity', icon: Activity },
    { name: 'Security Events', path: '/security-events', icon: ShieldAlert },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#030712]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 group-hover:border-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-sans">
                  Auth<span className="text-blue-500">Shield</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-gray-400 hidden sm:block tracking-wide">
                Secure Auth & Brute-Force Detection
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            {/* Public Section */}
            <div className="flex items-center bg-gray-950/60 p-1 rounded-lg border border-gray-800/80">
              {publicLinks.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      active
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <span className="mx-2 text-gray-700">|</span>

            {/* Authenticated Section */}
            <div className="flex items-center bg-gray-950/60 p-1 rounded-lg border border-gray-800/80">
              <span className="px-2 text-[10px] text-gray-500 font-semibold uppercase">
                Console:
              </span>
              {authLinks.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      active
                        ? 'bg-blue-900/60 text-blue-200 font-medium border border-blue-700/60'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Status / Dev Mode Indicators */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/api/health"
              target="_blank"
              title="Click to view live /api/health endpoint response"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-xs text-gray-400 hover:text-gray-200 hover:border-gray-700 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-[11px]">API: {health ? 'Online' : 'Initializing'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/80 text-xs text-blue-200 hover:border-blue-500 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-rose-400 transition-colors font-mono"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-[#030712] px-4 pt-2 pb-6 space-y-4">
          <div>
            <div className="text-[11px] font-mono text-gray-500 uppercase px-2 mb-1">
              Navigation
            </div>
            <div className="space-y-1">
              {publicLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-gray-500 uppercase px-2 mb-1">
              Security Console
            </div>
            <div className="space-y-1">
              {authLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                    isActive(item.path)
                      ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-sm font-mono"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

