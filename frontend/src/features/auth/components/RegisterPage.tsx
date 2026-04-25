import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '@features/auth/store/authSlice';
import AuthLayout from '@features/auth/ui/AuthLayout';
import { clearError } from '@features/auth/store/authSlice';
import { User } from '@shared/types';

interface RegisterPageProps {
  error?: string;
}

export default function RegisterPage({ error }: RegisterPageProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent, username: string, password: string) => {
    e.preventDefault();
    dispatch(clearError());

    dispatch(register({ username, password }))
      .unwrap()
      .then(() => {
        navigate('/music');
      })
      .catch((err) => {
        console.error('Registration failed:', err);
      });
  };

  return (
    <AuthLayout type="register" error={error} onSubmit={handleSubmit} />
  );
}