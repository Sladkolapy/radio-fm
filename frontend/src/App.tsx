import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { checkAuth } from '@features/auth/store/authSlice';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import MainPage from '@pages/MainPage';
import AdminPage from '@pages/AdminPage';
import CreateTrackPage from '@pages/CreateTrackPage';
import EditTrackPage from '@pages/EditTrackPage';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !user) {
      dispatch(checkAuth());
    }
  }, []);

  const isAuthenticated = !!(token && user);
  const isAdmin = user?.role === 'admin';

  if (isLoading && localStorage.getItem('token')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/music" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/music" />}
      />
      <Route
        path="/music"
        element={<MainPage />}
      />
      <Route
        path="/music/new"
        element={isAuthenticated ? <CreateTrackPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/music/:id/edit"
        element={isAuthenticated ? <EditTrackPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={isAdmin ? <AdminPage /> : <Navigate to="/music" />}
      />
      <Route path="/" element={<Navigate to="/music" />} />
    </Routes>
  );
};

export default App;
