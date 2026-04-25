import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { checkAuth, logout } from '@features/auth/store/authSlice';
import { LoginForm } from '@features/auth/components/AuthForms';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isLoading, token } = useAppSelector((state) => state.auth);

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    console.log('LoginPage: Redux store token:', token);
    console.log('LoginPage: Redux store user:', user);
    console.log('LoginPage: Redux store isLoading:', isLoading);

    if (token && !user) {
      console.log('LoginPage: Token found, fetching user profile');
      dispatch(checkAuth());
    } else if (user && token) {
      console.log('LoginPage: User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [dispatch, token, user, navigate, from]);

  useEffect(() => {
    console.log('LoginPage: useEffect called - user:', user, 'isLoading:', isLoading, 'token:', token);

    if (user && !isLoading && token) {
      console.log('LoginPage: User is authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from, token]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;