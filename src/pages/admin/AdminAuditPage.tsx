import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, FileText } from 'lucide-react';
import { useServices } from '../../services/provider';
import { AuditLogEntry } from '../../services/interfaces';
import { formatDate } from '../../utils/dateUtils';
import { LoadingState } from '../../components/ui/LoadingState';
import { FilterChips } from '../../components/ui/FilterChips';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AdminAuditPage: React.FC = () => {
  const { audit } = useServices();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('ALL');

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

  return (
    <div className="space-y-4 font-sans max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Platform Audit Log</h1>
          <p className="text-[length:var(--text-caption-size)] text-neutral-500 mt-0.5">
            Immutable record of all platform administrative actions and security events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FilterChips
            options={[
              { id: 'ALL', label: 'All Events' },
              { id: 'SECURITY', label: 'Security' },
              { id: 'BILLING', label: 'Billing' },
              { id: 'ACCESS', label: 'Access' }
            ]}
            activeId={filter}
            onChange={(val) => setFilter(val as any)}
          />
        </div>
      </div>

      <div className="pt-2">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading platform audit logs..." />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No audit log entries recorded yet.
          </div>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-[length:var(--text-body-size)] text-neutral-700">
                <thead className="text-[length:var(--text-caption-size)] text-neutral-500 font-semibold border-b border-neutral-200 bg-neutral-50/50">
                  <tr>
                    <th className="px-5 py-3.5">Action Event</th>
                    <th className="px-5 py-3.5">Entity Type</th>
                    <th className="px-5 py-3.5">Entity ID</th>
                    <th className="px-5 py-3.5">Gym Tenant ID</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors font-mono">
                      <td className="px-5 py-4 font-bold text-neutral-900">
                        <Badge variant="danger">{log.action}</Badge>
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-800 font-sans">
                        {log.entityType}
                      </td>
                      <td className="px-5 py-4 text-neutral-500">
                        {log.entityId || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-neutral-500">
                        {log.gymId || 'System'}
                      </td>
                      <td className="px-5 py-4 text-neutral-500 text-[length:var(--text-caption-size)] text-right">
                        {formatDate(log.createdAt, { format: 'medium' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
