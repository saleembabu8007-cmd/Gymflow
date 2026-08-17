import React, { useState, useEffect } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { GymSetupPage } from './pages/auth/GymSetupPage';
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute';
import { SubscriptionEntitlementGuard } from './components/auth/SubscriptionEntitlementGuard';
import { AdminLayout, AdminTab } from './layouts/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminGymsPage } from './pages/admin/AdminGymsPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ExpiredSubscriptionPage } from './pages/ExpiredSubscriptionPage';
import { TodayPage } from './pages/TodayPage';
import { MembersPage } from './pages/MembersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { QuickPaymentModal } from './components/modals/QuickPaymentModal';
import { SendReminderModal } from './components/modals/SendReminderModal';
import { SearchModal } from './components/modals/SearchModal';
import { MemberDetailModal } from './components/modals/MemberDetailModal';
import { EditMemberModal } from './components/modals/EditMemberModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { LogoutConfirmationModal } from './components/modals/LogoutConfirmationModal';
import { useAuth } from './hooks/useAuth';
import { useMembers } from './hooks/useMembers';
import { useSubscription } from './hooks/useSubscription';
import { useServices } from './services/provider';
import { PlatformGymTenant, PlatformStats, Member } from './types';
import { LoadingState } from './components/ui/LoadingState';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AdminAppContent: React.FC<{
  currentPath: string;
  onNavigateTab: (path: string) => void;
  onLogout: () => void;
}> = ({ currentPath, onNavigateTab }) => {
  const { admin } = useServices();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [gyms, setGyms] = useState<PlatformGymTenant[]>([]);
  const [loading, setLoading] = useState(true);

  const adminTab: AdminTab = React.useMemo(() => {
    if (currentPath === '/admin/gyms') return 'gyms';
    if (currentPath === '/admin/subscriptions') return 'subscriptions';
    if (currentPath === '/admin/users') return 'users';
    if (currentPath === '/admin/audit') return 'audit';
    if (currentPath === '/admin/settings') return 'settings';
    return 'overview';
  }, [currentPath]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, g] = await Promise.all([admin.getStats(), admin.getGymTenants()]);
      setStats(s);
      setGyms(g);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (gymId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await admin.updateGymStatus(gymId, newStatus);
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white font-sans">
        <LoadingState message="Loading Platform Admin Control Panel..." />
      </div>
    );
  }

  const handleTabChange = (tab: AdminTab) => {
    const targetPath = tab === 'overview' ? '/admin' : `/admin/${tab}`;
    onNavigateTab(targetPath);
  };

  return (
    <AdminLayout currentTab={adminTab} onTabChange={handleTabChange}>
      {adminTab === 'overview' && (
        <AdminOverviewPage
          stats={stats}
          gyms={gyms}
          onNavigateToGyms={() => handleTabChange('gyms')}
          onNavigateToSubscriptions={() => handleTabChange('subscriptions')}
        />
      )}
      {adminTab === 'gyms' && (
        <AdminGymsPage gyms={gyms} onToggleStatus={handleToggleStatus} />
      )}
      {adminTab === 'subscriptions' && <AdminSubscriptionsPage gyms={gyms} />}
      {adminTab === 'users' && (
        <AdminGymsPage gyms={gyms} onToggleStatus={handleToggleStatus} />
      )}
      {adminTab === 'audit' && <AdminAuditPage />}
      {adminTab === 'settings' && <AdminSettingsPage />}
    </AdminLayout>
  );
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, logout, signUp, refresh } = useAuth();
  const { addMember, markAsPaid, deleteMember, members } = useMembers();
  const { canAccess, loading: subLoading } = useSubscription(user?.gymId);

  // Native HTML5 Path Routing
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const [resetEmail, setResetEmail] = useState<string>('');
  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [quickPaymentMember, setQuickPaymentMember] = useState<Member | null>(null);
  const [reminderMember, setReminderMember] = useState<Member | null>(null);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gymflow_onboarding_completed') === 'false';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      setPathname(to);
    }
  };

  // Global search keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isAuthenticated && canAccess) {
          setIsSearchOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, canAccess]);

  const activeDetailMember = detailMember
    ? members.find((m) => m.id === detailMember.id) || detailMember
    : null;

  const isPlatformAdmin =
    (user?.role as string) === 'PLATFORM_ADMIN' ||
    (user?.role as string) === 'platform_admin' ||
    (user?.role as string) === 'ADMIN';

  // 1. Initial Session Verification Loading
  if (authLoading || (isAuthenticated && user?.gymId && subLoading)) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <LoadingState message="Verifying session and security entitlements..." />
      </div>
    );
  }

  // 2. PLATFORM ADMIN ROUTE BRANCH (/admin, /admin/login, /admin/forgot-password, /admin/reset-password, /admin/gyms, /admin/users, /admin/subscriptions, /admin/audit, /admin/settings)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (isAuthenticated && isPlatformAdmin) {
        navigate('/admin');
        return null;
      }
      return (
        <AdminLoginPage
          onNavigateToGymLogin={() => navigate('/login')}
          onAdminLoginSuccess={() => navigate('/admin')}
          onNavigateToForgotPassword={() => navigate('/admin/forgot-password')}
        />
      );
    }

    if (pathname === '/admin/forgot-password') {
      return (
        <ForgotPasswordPage
          onNavigateToLogin={() => navigate('/admin/login')}
          onNavigateToResetPassword={(email) => {
            setResetEmail(email);
            navigate('/admin/reset-password');
          }}
        />
      );
    }

    if (pathname === '/admin/reset-password') {
      return (
        <ResetPasswordPage
          targetEmail={resetEmail}
          onNavigateToLogin={() => navigate('/admin/login')}
        />
      );
    }

    return (
      <AdminProtectedRoute>
        <AdminAppContent
          currentPath={pathname}
          onNavigateTab={(path) => navigate(path)}
          onLogout={async () => {
            await logout();
            navigate('/admin/login');
          }}
        />
      </AdminProtectedRoute>
    );
  }

  // 3. PUBLIC ROOT ROUTE (/)
  if (pathname === '/') {
    if (isAuthenticated) {
      if (isPlatformAdmin) {
        navigate('/admin');
        return null;
      }
      navigate('/app/today');
      return null;
    }
    return (
      <LandingPage
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToRegister={() => navigate('/signup')}
      />
    );
  }

  // 4. PUBLIC AUTH ROUTES (/login, /signup, /forgot-password, /reset-password)
  if (pathname === '/login') {
    if (isAuthenticated) {
      if (isPlatformAdmin) {
        navigate('/admin');
        return null;
      }
      navigate('/app/today');
      return null;
    }
    return (
      <LoginPage
        onNavigateToForgotPassword={() => navigate('/forgot-password')}
        onNavigateToRegister={() => navigate('/signup')}
        onLoginSuccess={(targetPath) => navigate(targetPath || '/app/today')}
      />
    );
  }

  if (pathname === '/signup' || pathname === '/register') {
    if (isAuthenticated) {
      if (isPlatformAdmin) {
        navigate('/admin');
        return null;
      }
      navigate('/app/today');
      return null;
    }
    return (
      <RegisterPage
        onSignUpSubmit={async (dto) => {
          await signUp(dto);
        }}
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToHome={() => navigate('/')}
      />
    );
  }

  if (pathname === '/forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => navigate('/login')}
        onNavigateToResetPassword={(email) => {
          setResetEmail(email);
          navigate('/reset-password');
        }}
      />
    );
  }

  if (pathname === '/reset-password') {
    return (
      <ResetPasswordPage
        targetEmail={resetEmail}
        onNavigateToLogin={() => navigate('/login')}
      />
    );
  }

  // 5. GYM OWNER APPLICATION BRANCH (/app, /app/today, /app/members, /app/payments, /app/reminders, /app/settings, /app/subscription or /today, /members, etc)
  const isGymOwnerRoute =
    pathname.startsWith('/app') ||
    ['/today', '/members', '/payments', '/reminders', '/settings', '/subscription', '/design-system'].includes(pathname);

  if (isGymOwnerRoute) {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }

    if (isPlatformAdmin) {
      navigate('/admin');
      return null;
    }

    // Post-Authentication Gym Setup Flow
    if (!user?.gymId) {
      return (
        <GymSetupPage
          onComplete={async () => {
            await refresh();
            navigate('/app/today');
          }}
        />
      );
    }

    // Entitlement Guard: Suspended Account
    if (!canAccess) {
      return <ExpiredSubscriptionPage />;
    }

    const normalizedPath = pathname.startsWith('/app') ? pathname : `/app${pathname}`;
    const currentSubPath = (normalizedPath === '/app' || normalizedPath === '/app/') ? '/app/today' : normalizedPath;

    const getPageTitle = () => {
      switch (currentSubPath) {
        case '/app/today':
          return "Today's Collection";
        case '/app/members':
          return 'Members Directory';
        case '/app/payments':
          return 'Payment Ledger';
        case '/app/reminders':
          return 'WhatsApp Reminders';
        case '/app/subscription':
          return 'SaaS Subscription';
        case '/app/settings':
          return 'Gym Settings';
        case '/app/design-system':
          return 'UI System & Tokens';
        default:
          return undefined;
      }
    };

    return (
      <SubscriptionEntitlementGuard
        gymId={user.gymId}
        isPlatformAdmin={isPlatformAdmin}
        onNavigateToSubscription={() => navigate('/app/subscription')}
      >
        <DashboardLayout
          currentPath={currentSubPath}
          onNavigate={(path) => navigate(path)}
          onNavigateAdmin={isPlatformAdmin ? () => navigate('/admin') : undefined}
          onLogout={() => setIsLogoutModalOpen(true)}
          onOpenQuickAdd={() => setIsAddMemberOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          pageTitle={getPageTitle()}
        >
          {currentSubPath === '/app/today' && (
            <TodayPage
              onQuickPay={(m) => setQuickPaymentMember(m)}
              onSendReminder={(m) => setReminderMember(m)}
              onAddMember={() => setIsAddMemberOpen(true)}
              onSelectMember={(m) => setDetailMember(m)}
              onViewAllPayments={() => navigate('/app/payments')}
              onOpenRecordPayment={() => setIsSearchOpen(true)}
            />
          )}

          {currentSubPath === '/app/members' && (
            <MembersPage
              onQuickPay={(m) => setQuickPaymentMember(m)}
              onSendReminder={(m) => setReminderMember(m)}
              onAddMember={() => setIsAddMemberOpen(true)}
              onSelectMember={(m) => setDetailMember(m)}
            />
          )}

          {currentSubPath === '/app/payments' && (
            <PaymentsPage
              onQuickPay={(m) => setQuickPaymentMember(m)}
              onSendReminder={(m) => setReminderMember(m)}
              onSelectMember={(m) => setDetailMember(m)}
              onRecordPayment={() => setIsSearchOpen(true)}
              onSelectMemberById={(memberId) => {
                const target = members.find((m) => m.id === memberId);
                if (target) setDetailMember(target);
              }}
            />
          )}

          {currentSubPath === '/app/reminders' && (
            <RemindersPage
              onSendReminder={(m) => setReminderMember(m)}
              onQuickPay={(m) => setQuickPaymentMember(m)}
              onSelectMember={(m) => setDetailMember(m)}
            />
          )}

          {currentSubPath === '/app/subscription' && <SubscriptionPage />}

          {currentSubPath === '/app/settings' && <SettingsPage />}

          {currentSubPath === '/app/design-system' && <DesignSystemPage />}

          {/* Global Modals */}
          <AddMemberModal
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            onAddMemberSubmit={addMember}
            onViewMember={(member) => {
              setIsAddMemberOpen(false);
              setDetailMember(member);
            }}
          />

          <QuickPaymentModal
            isOpen={!!quickPaymentMember}
            member={quickPaymentMember}
            onClose={() => setQuickPaymentMember(null)}
            onMarkAsPaidSubmit={markAsPaid}
            onPaymentRecorded={() => {}}
          />

          <SendReminderModal
            isOpen={!!reminderMember}
            member={reminderMember}
            onClose={() => setReminderMember(null)}
          />

          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectMember={(m) => setDetailMember(m)}
            onQuickPay={(m) => setQuickPaymentMember(m)}
            onQuickRemind={(m) => setReminderMember(m)}
          />

          <MemberDetailModal
            isOpen={!!activeDetailMember}
            member={activeDetailMember}
            onClose={() => setDetailMember(null)}
            onQuickPay={(m) => {
              setDetailMember(null);
              setQuickPaymentMember(m);
            }}
            onSendReminder={(m) => {
              setDetailMember(null);
              setReminderMember(m);
            }}
            onEditMember={(m) => {
              setDetailMember(null);
              setEditMember(m);
            }}
            onDeleteMember={deleteMember}
          />

          <EditMemberModal
            isOpen={!!editMember}
            member={editMember}
            onClose={() => setEditMember(null)}
          />

          <OnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            onAddMemberSubmit={addMember}
            onComplete={() => {
              setIsOnboardingOpen(false);
              navigate('/app/today');
            }}
          />

          <LogoutConfirmationModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            user={user}
            onConfirmLogout={async () => {
              await logout();
              setIsLogoutModalOpen(false);
              navigate('/login');
            }}
          />
        </DashboardLayout>
      </SubscriptionEntitlementGuard>
    );
  }

  // 6. 404 / UNKNOWN ROUTE FALLBACK
  return (
    <NotFoundPage
      onNavigateHome={() => navigate(isAuthenticated ? (isPlatformAdmin ? '/admin' : '/app/today') : '/')}
    />
  );
};

export default function App() {
  return (
    <RootLayout>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </RootLayout>
  );
}
