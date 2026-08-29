import React, { useState } from 'react';
import { Users, Search, Shield, UserCheck, Mail, Building2 } from 'lucide-react';
import { PlatformGymTenant } from '../../types';
import { SearchInput } from '../../components/ui/SearchInput';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/classNames';

interface AdminUsersPageProps {
  gyms: PlatformGymTenant[];
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ gyms }) => {
  const [search, setSearch] = useState('');

  // Extract owner profiles from gym tenants list
  const users = gyms.map((g) => ({
    id: g.id,
    name: g.ownerName,
    email: g.ownerEmail,
    role: 'GYM_OWNER',
    gymName: g.name,
    gymStatus: g.status,
    phone: g.phone,
    createdAt: g.createdAt,
  }));

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.gymName.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="space-y-5 select-none font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
            Platform Users
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registered gym owners and administrative accounts across the platform
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onSearchChange={setSearch}
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 stroke-[1.5]" />}
            title="No platform users found"
            description={search ? `No user matches "${search}".` : 'No registered users in the database.'}
            actionLabel={search ? 'Clear Search' : undefined}
            onAction={search ? () => setSearch('') : undefined}
            className="py-12"
          />
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
            >
              {/* User Identity */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                      {user.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                      {user.role}
                    </span>
                    <StatusBadge status={user.gymStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono mt-0.5 flex-wrap">
                    <span>{user.email}</span>
                    <span>·</span>
                    <span>Club: {user.gymName}</span>
                    {user.phone && (
                      <>
                        <span>·</span>
                        <span>{user.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="shrink-0 self-end sm:self-center text-right">
                <span className="text-[11px] font-mono text-neutral-500">
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
