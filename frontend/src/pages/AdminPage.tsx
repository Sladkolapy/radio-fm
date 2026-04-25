import React from 'react';
import { AdminPanel } from '@features/admin/components/AdminPanel';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <AdminPanel />
    </div>
  );
};

export default AdminPage;