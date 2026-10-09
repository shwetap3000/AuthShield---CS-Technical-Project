import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar.tsx';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <Sidebar />
      <div className="flex-1 w-full min-w-0">
        <Outlet />
      </div>
    </div>
  );
};
