import React from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { logout } from '@features/auth/store/authSlice';
import { useNavigate, NavLink } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        <div className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 p-6">
          <h1 className="text-2xl font-bold text-white mb-8">PingMusic</h1>

          <nav className="space-y-2">
            <NavLink
              to="/music"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              Music
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              Admin
            </NavLink>
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
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
