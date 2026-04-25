import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks';
import { RegisterForm } from '@features/auth/components/AuthForms';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      navigate('/music', { replace: true });
    }
  }, [user, token, navigate]);

  if (user && token) {
    return null;
  }

  return (
    <div>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
