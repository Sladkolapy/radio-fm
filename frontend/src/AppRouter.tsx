import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import MusicPage from './features/music/components/MusicPage';
import LibraryPage from './features/music/components/LibraryPage';
import AdminPage from './features/admin/components/AdminPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MusicPage />
  },
  {
    path: '/music',
    element: <MusicPage />
  },
  {
    path: '/library',
    element: (
      <ProtectedRoute>
        <LibraryPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '*',
    element: <Navigate to="/music" replace />
  }
]);

function AppRouterProvider() {
  return (
    <Provider store={store}>
      <AppRouterProvider />
    </Provider>
  );
}

export default AppRouterProvider;