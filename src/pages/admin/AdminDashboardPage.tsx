import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Activity,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useServices } from '../../services/provider';
import { PlatformGymTenant, PlatformStats } from '../../types';
import { LoadingState } from '../../components/ui/LoadingState';

interface AdminDashboardPageProps {
  onLogout: () => void;
  onSwitchToOwnerView?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  onSwitchToOwnerView,
}) => {
  const { admin } = useServices();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [gyms, setGyms] = useState<PlatformGymTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, gymsRes] = await Promise.all([
        admin.getStats(),
        admin.getGymTenants(),
      ]);
      setStats(statsRes);
      setGyms(gymsRes);
    } catch (e) {
      console.error('Failed to load admin platform data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (gymId: string, currentStatus: string) => {
    setUpdatingId(gymId);
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await admin.updateGymStatus(gymId, newStatus);
      await loadAdminData();
    } catch (e) {
      console.error('Failed to update gym status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      g.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || g.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <LoadingState message="Loading Platform Admin Control Panel..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Platform Admin Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-tight">
                GymFlow Platform Admin
              </span>
              <span className="text-[10px] text-rose-400 font-medium">SaaS Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToOwnerView && (
              <button
                type="button"
                onClick={onSwitchToOwnerView}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Switch to Gym Owner Portal
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Logout Platform Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-medium mb-1">Total Customer Gyms</div>
              <div className="text-2xl font-extrabold text-white">{stats?.totalGyms || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-medium mb-1">Active Subscriptions</div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {stats?.activeSubscriptions || 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-medium mb-1">Estimated MRR</div>
              <div className="text-2xl font-extrabold text-white">
                ₹{(stats?.mrr || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-rose-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-medium mb-1">Suspended Accounts</div>
              <div className="text-2xl font-extrabold text-rose-400">{stats?.suspendedGyms || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Customer Gyms Table Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Customer Gym Accounts</h2>
              <p className="text-xs text-neutral-400">Manage tenant subscription statuses and accounts</p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search gym, owner, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Gym Tenant</th>
                  <th className="px-4 py-3">Owner Contact</th>
                  <th className="px-4 py-3">SaaS Plan</th>
                  <th className="px-4 py-3">Tenant Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div>{gym.name}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">
                            ID: {gym.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-neutral-200">{gym.ownerName}</div>
                      <div className="text-[10px] text-neutral-400">{gym.ownerEmail}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-semibold">
                        {gym.subscriptionPlan}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {gym.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px]">
                          <XCircle className="w-3 h-3" /> SUSPENDED
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(gym.id, gym.status)}
                        disabled={updatingId === gym.id}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          gym.status === 'ACTIVE'
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {updatingId === gym.id
                          ? 'Updating...'
                          : gym.status === 'ACTIVE'
                          ? 'Suspend Gym'
                          : 'Activate Gym'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
