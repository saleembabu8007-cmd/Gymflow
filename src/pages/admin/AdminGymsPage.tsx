import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  User,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { GymDetailModal } from '../../components/modals/GymDetailModal';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/classNames';

interface AdminGymsPageProps {
  gyms: PlatformGymTenant[];
  onToggleStatus: (gymId: string, currentStatus: string) => Promise<void>;
}

export const AdminGymsPage: React.FC<AdminGymsPageProps> = ({ gyms, onToggleStatus }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [selectedGym, setSelectedGym] = useState<PlatformGymTenant | null>(null);

  const filteredGyms = gyms.filter((g) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      g.name.toLowerCase().includes(query) ||
      g.ownerName.toLowerCase().includes(query) ||
      g.ownerEmail.toLowerCase().includes(query) ||
      g.phone.includes(query);

    const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Customer Gym Accounts</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage all tenant gym accounts, subscription statuses, and operational access
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-admin-gyms"
              placeholder="Search gym, owner, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            id="select-filter-admin-gyms"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">All Statuses ({gyms.length})</option>
            <option value="ACTIVE">Active ({gyms.filter((g) => g.status === 'ACTIVE').length})</option>
            <option value="SUSPENDED">Suspended ({gyms.filter((g) => g.status === 'SUSPENDED').length})</option>
          </select>
        </div>
      </div>

      {/* Gym Tenants Table */}
      <div className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="text-zinc-500 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Gym Tenant</th>
                <th className="px-5 py-3.5">Owner Details</th>
                <th className="px-5 py-3.5">Members</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No customer gym accounts match your search query.
                  </td>
                </tr>
              ) : (
                filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="text-sm truncate">{gym.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono font-normal">
                            ID: {gym.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-200">{gym.ownerName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{gym.ownerEmail}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200 font-bold font-mono text-[11px] border border-zinc-700">
                        {gym.memberCount} members
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-zinc-400">
                      {formatDate(gym.createdAt, { format: 'medium' })}
                    </td>

                    <td className="px-5 py-4">
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

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          id={`btn-view-gym-${gym.id}`}
                          onClick={() => setSelectedGym(gym)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          title="View Gym Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gym Detail Modal Drawer */}
      {selectedGym && (
        <GymDetailModal
          isOpen={!!selectedGym}
          onClose={() => setSelectedGym(null)}
          gym={selectedGym}
          onToggleStatus={onToggleStatus}
        />
      )}
    </div>
  );
};
