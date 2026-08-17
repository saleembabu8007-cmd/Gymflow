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
  const gymName = gym?.name || 'GymFlow Tenant';

  return (
    <div className="min-h-screen bg-neutral-50/60 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        gymName={gymName}
        user={user}
        onLogout={handleLogout}
        onNavigateAdmin={onNavigateAdmin}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10 overflow-x-hidden">
        <Header
          user={user}
          gymName={gymName}
          onOpenQuickAdd={onOpenQuickAdd}
          onOpenSearch={onOpenSearch}
          onNavigateAdmin={onNavigateAdmin}
          title={pageTitle}
          subtitle={pageSubtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
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
