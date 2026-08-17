import { IAuditService, AuditLogEntry } from './interfaces';
import { supabase } from './supabaseClient';

export class AuditService implements IAuditService {
  private logs: AuditLogEntry[] = [
    {
      id: 'audit-001',
      gymId: 'e7b94921-998f-4318-971a-289eb6e21b8b',
      actorId: '550e8400-e29b-41d4-a716-446655440000',
      actorName: 'Vikram Sharma',
      action: 'RECORD_PAYMENT',
      entityType: 'PAYMENT',
      entityId: 'pay-001',
      details: { amount: 1500, method: 'UPI' },
      createdAt: new Date().toISOString(),
    },
  ];

  async getLogs(gymId?: string): Promise<AuditLogEntry[]> {
    if (supabase) {
      try {
        let query = (supabase as any).from('audit_logs').select('*');
        if (gymId) {
          query = query.eq('gym_id', gymId);
        }
        const { data } = await query.order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            gymId: d.gym_id,
            actorId: d.actor_id,
            actorName: d.details?.actor_name || 'System User',
            action: d.action,
            entityType: d.entity_type,
            entityId: d.entity_id,
            details: d.details || {},
            createdAt: d.created_at,
          }));
        }
      } catch (e) {
        console.warn('Audit fetch error:', e);
      }
    }

    if (gymId) {
      return this.logs.filter((l) => l.gymId === gymId);
    }
    return [...this.logs];
  }

  async logAction(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await (supabase as any).from('audit_logs').insert({
          gym_id: entry.gymId || null,
          actor_id: entry.actorId || null,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId || null,
          details: { ...entry.details, actor_name: entry.actorName },
        });
      } catch (e) {
        console.warn('Failed to insert audit log in Supabase:', e);
      }
    }

    this.logs.unshift(newLog);
    return newLog;
  }
}

export const auditService = new AuditService();
