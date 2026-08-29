import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../hooks/useAuth';
import { useGym } from '../hooks/useGym';
import { useMembers } from '../hooks/useMembers';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateAdmin?: () => void;
  onLogout?: () => void;
  onOpenQuickAdd?: () => void;
  onOpenSearch?: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onNavigateAdmin,
  onLogout,
  onOpenQuickAdd,
  onOpenSearch,
  pageTitle,
  pageSubtitle,
}) => {
  const { user, logout } = useAuth();
  const { gym } = useGym();
  const { overdueMembers, dueTodayMembers, dueSoonMembers } = useMembers();

  const handleLogout = onLogout || logout;
  const pendingCount = overdueMembers.length + dueTodayMembers.length + dueSoonMembers.length;
  const gymName = gym?.name || 'Gym Workspace';

  return (
    <div className="h-screen bg-[var(--color-bg-app)] flex overflow-hidden font-sans">
      {/* Desktop Sidebar (Fixed 240px) */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        gymName={gymName}
        user={user}
        onLogout={handleLogout}
        onNavigateAdmin={onNavigateAdmin}
        pendingCount={pendingCount}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          gymName={gymName}
          onOpenQuickAdd={onOpenQuickAdd}
          onOpenSearch={onOpenSearch}
          onNavigateAdmin={onNavigateAdmin}
          title={pageTitle}
          subtitle={pageSubtitle}
        />

        <div className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8">
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Intentional Bottom Navigation */}
      <BottomNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        gymName={gymName}
        user={user}
        onLogout={handleLogout}
        onOpenQuickAdd={onOpenQuickAdd}
        onOpenSearch={onOpenSearch}
        pendingCount={pendingCount}
      />
    </div>
  );
};
