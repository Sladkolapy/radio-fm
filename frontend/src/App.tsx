import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import MainPage from '@pages/MainPage';
import AdminPage from '@pages/AdminPage';
import CreateTrackPage from '@pages/CreateTrackPage';
import EditTrackPage from '@pages/EditTrackPage';

const App: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const storedToken = localStorage.getItem('token');

  console.log('App.tsx: Redux token:', token);
  console.log('App.tsx: Stored token:', storedToken);

  const hasAuth = token || storedToken;

  return (
    <Routes>
      <Route
        path="/login"
        element={!hasAuth ? <LoginPage /> : <Navigate to="/music" />}
      />
      <Route
        path="/register"
        element={!hasAuth ? <RegisterPage /> : <Navigate to="/music" />}
      />
      <Route
        path="/music"
        element={hasAuth ? <MainPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={hasAuth ? <AdminPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/music/new"
        element={hasAuth ? <CreateTrackPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/music/:id/edit"
        element={hasAuth ? <EditTrackPage /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/music" />} />
    </Routes>
  );
};

export default App;