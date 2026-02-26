import React from 'react';
import { Header } from './Header';

interface AppShellProps { children: React.ReactNode }

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-page-texture flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
