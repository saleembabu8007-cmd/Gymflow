import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, FileText } from 'lucide-react';
import { useServices } from '../../services/provider';
import { AuditLogEntry } from '../../services/interfaces';
import { formatDate } from '../../utils/dateUtils';
import { LoadingState } from '../../components/ui/LoadingState';

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

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Audit Activity</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            System-wide operational log trail for security and financial auditability
          </p>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-admin-audit"
            placeholder="Search action, entity, gym ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="text-zinc-500 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Action Event</th>
                  <th className="px-5 py-3.5">Entity Type</th>
                  <th className="px-5 py-3.5">Entity ID</th>
                  <th className="px-5 py-3.5">Gym Tenant ID</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-rose-400 border border-zinc-700 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300 font-sans">{log.entityType}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{log.entityId || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{log.gymId || 'System'}</td>
                    <td className="px-5 py-3.5 text-zinc-400 text-right">
                      {formatDate(log.createdAt, { format: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
