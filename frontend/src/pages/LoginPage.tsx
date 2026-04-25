import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks';
import { LoginForm } from '@features/auth/components/AuthForms';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      navigate('/music', { replace: true });
    }
  }, [user, token, navigate]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (user && token) {
    return null;
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
