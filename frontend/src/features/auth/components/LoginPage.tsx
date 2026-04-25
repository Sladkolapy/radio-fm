import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '@features/auth/store/authSlice';
import AuthLayout from '@features/auth/ui/AuthLayout';
import { clearError } from '@features/auth/store/authSlice';

interface LoginPageProps {
  error?: string;
}

export default function LoginPage({ error }: LoginPageProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent, username: string, password: string) => {
    e.preventDefault();
    dispatch(clearError());

    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        navigate('/music');
      })
      .catch((err) => {
        console.error('Login failed:', err);
      });
  };

  return <AuthLayout type="login" error={error} onSubmit={handleSubmit} />;
}