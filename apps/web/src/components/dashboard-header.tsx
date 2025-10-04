import React from 'react';

interface DashboardHeaderProps {
  systemStatus: string;
}

export function DashboardHeader({ systemStatus }: DashboardHeaderProps) {
  return (
    <header className="bg-background shadow-sm border-b border-border p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Estado del sistema:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            systemStatus === 'operational'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}>
            {systemStatus === 'operational' ? 'Operativo' : 'No operativo'}
          </span>
        </div>
      </div>
    </header>
  );
}