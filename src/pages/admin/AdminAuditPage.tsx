import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, FileText } from 'lucide-react';
import { useServices } from '../../services/provider';
import { AuditLogEntry } from '../../services/interfaces';
import { formatDate } from '../../utils/dateUtils';
import { LoadingState } from '../../components/ui/LoadingState';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/classNames';

export const AdminAuditPage: React.FC = () => {
  const { audit } = useServices();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    audit
      .getLogs()
      .then((records) => {
        if (isMounted) {
          setLogs(records || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLogs([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [audit]);

  const filteredLogs = logs.filter((log) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      (log.entityId || '').toLowerCase().includes(query) ||
      (log.gymId || '').toLowerCase().includes(query)
    );
  });

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('INSERT') || act.includes('ADD')) {
      return 'bg-[var(--color-success-50)] text-[var(--color-success-700)] border-[var(--color-success-200)]';
    }
    if (act.includes('DELETE') || act.includes('SUSPEND') || act.includes('REMOVE')) {
      return 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border-[var(--color-danger-200)]';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('CHANGE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  };

  return (
    <div className="space-y-5 select-none font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
            Platform Audit Log
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable ledger of administrative operations and security events
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onSearchChange={setSearch}
            placeholder="Search action or entity..."
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] p-12">
          <LoadingState message="Loading platform audit entries..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs">
          <EmptyState
            icon={<ShieldCheck className="w-8 h-8 stroke-[1.5]" />}
            title="No audit logs found"
            description={search ? `No log matches "${search}".` : 'No audit entries recorded yet.'}
            actionLabel={search ? 'Clear Search' : undefined}
            onAction={search ? () => setSearch('') : undefined}
            className="py-12"
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-neutral-50/80 transition-colors"
            >
              {/* Event Details */}
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0',
                    getActionColor(log.action)
                  )}
                >
                  {log.action}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate block">
                    {log.entityType} <span className="font-mono text-neutral-400 font-normal">#{log.entityId?.slice(0, 8)}</span>
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono block truncate mt-0.5">
                    Tenant: {log.gymId ? `gym_${log.gymId.slice(0, 8)}` : 'global_platform'}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 self-end sm:self-center">
                <span className="text-[11px] font-mono text-neutral-500">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
