import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks';
import { logout } from '@features/auth/store/authSlice';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/music', label: 'Music', icon: '🎵' },
  { path: '/library', label: 'Library', icon: '📚' },
  { path: '/admin', label: 'Admin', icon: '🛡️' }
];

export default function AuthLayout() {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 p-6"
        >
          <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="text-3xl">🎵</span>
            <span>Music Player</span>
          </h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {user && (
            <div className="mt-8 p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Logged in as:</p>
              <p className="text-white font-medium">{user.username}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-8 px-4 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors"
          >
            Logout
          </button>
        </motion.div>

        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}