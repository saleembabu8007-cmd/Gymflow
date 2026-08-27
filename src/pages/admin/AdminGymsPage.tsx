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
import { LoadingState } from '../../components/ui/LoadingState';
import { FilterChips } from '../../components/ui/FilterChips';
import { GymDetailModal } from '../../components/modals/GymDetailModal';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/classNames';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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
    <div className="space-y-4 font-sans max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Customer Gym Accounts</h1>
          <p className="text-[length:var(--text-caption-size)] text-neutral-500 mt-0.5">
            Manage all tenant gym accounts, subscription statuses, and operational access
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-admin-gyms"
              placeholder="Search gym, owner, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-[var(--radius-lg)] text-[length:var(--text-body-size)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--color-brand-500)] shadow-sm"
            />
          </div>

          <FilterChips
            options={[
              { id: 'ALL', label: `All Statuses (${gyms.length})` },
              { id: 'ACTIVE', label: `Active (${gyms.filter((g) => g.status === 'ACTIVE').length})` },
              { id: 'SUSPENDED', label: `Suspended (${gyms.filter((g) => g.status === 'SUSPENDED').length})` }
            ]}
            activeId={filterStatus}
            onChange={(val) => setFilterStatus(val as any)}
          />
        </div>
      </div>

      {/* Gym Tenants Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-[length:var(--text-body-size)] text-neutral-700">
            <thead className="text-[length:var(--text-caption-size)] text-neutral-500 font-semibold border-b border-neutral-200 bg-neutral-50/50">
              <tr>
                <th className="px-5 py-3.5">Gym Tenant</th>
                <th className="px-5 py-3.5">Owner Details</th>
                <th className="px-5 py-3.5">Members</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                    No customer gym accounts match your search query.
                  </td>
                </tr>
              ) : (
                filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="text-[length:var(--text-body-size)] truncate">{gym.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono font-normal">
                            ID: {gym.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-800">{gym.ownerName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{gym.ownerEmail}</div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant="neutral">{gym.memberCount} members</Badge>
                    </td>

                    <td className="px-5 py-4 font-mono text-neutral-500 text-[length:var(--text-caption-size)]">
                      {formatDate(gym.createdAt, { format: 'medium' })}
                    </td>

                    <td className="px-5 py-4">
                      {gym.status === 'ACTIVE' ? (
                        <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>ACTIVE</Badge>
                      ) : (
                        <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>SUSPENDED</Badge>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          id={`btn-view-gym-${gym.id}`}
                          onClick={() => setSelectedGym(gym)}
                          className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-[var(--radius-md)] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                          title="View Gym Details"
                        >
                          <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
