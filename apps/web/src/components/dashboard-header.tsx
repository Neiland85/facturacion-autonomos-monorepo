import React from 'react';

interface DashboardHeaderProps {
  systemStatus: string;
}

export function DashboardHeader({ systemStatus }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Estado del sistema:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            systemStatus === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {systemStatus === 'operational' ? 'Operativo' : 'No operativo'}
          </span>
        </div>
      </div>
    </header>
  );
}