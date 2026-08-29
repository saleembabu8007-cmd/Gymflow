import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
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
    <div className="space-y-5 select-none font-sans max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
            Customer Gyms
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage tenant gym accounts, subscription states, and operational access
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-full sm:w-56">
            <SearchInput
              value={search}
              onSearchChange={setSearch}
              placeholder="Search gym, owner..."
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-[var(--radius-md)] border border-neutral-200/80">
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-[var(--radius-sm)] transition-all cursor-pointer',
                  filterStatus === st
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                )}
              >
                {st === 'ALL' ? `All (${gyms.length})` : st === 'ACTIVE' ? `Active (${gyms.filter((g) => g.status === 'ACTIVE').length})` : `Suspended (${gyms.filter((g) => g.status === 'SUSPENDED').length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gym Tenants Divided List */}
      <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
        {filteredGyms.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8 stroke-[1.5]" />}
            title="No gym tenants found"
            description={search ? `No gym matches "${search}".` : 'No customer gyms match the selected filter.'}
            actionLabel={search ? 'Clear Search' : undefined}
            onAction={search ? () => setSearch('') : undefined}
            className="py-12"
          />
        ) : (
          filteredGyms.map((gym) => (
            <div
              key={gym.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
            >
              {/* Gym & Owner Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar name={gym.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                      {gym.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                      {gym.memberCount} members
                    </span>
                    <StatusBadge status={gym.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono mt-0.5 flex-wrap">
                    <span>{gym.ownerName}</span>
                    <span>·</span>
                    <span>{gym.ownerEmail}</span>
                    {gym.phone && (
                      <>
                        <span>·</span>
                        <span>{gym.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Trailing Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedGym(gym)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Inspect
                </Button>

                <Button
                  variant={gym.status === 'ACTIVE' ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => onToggleStatus(gym.id, gym.status)}
                >
                  {gym.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gym Detail Modal */}
      {selectedGym && (
        <GymDetailModal
          isOpen={true}
          onClose={() => setSelectedGym(null)}
          gym={selectedGym}
          onToggleStatus={onToggleStatus}
        />
      )}
    </div>
  );
};
