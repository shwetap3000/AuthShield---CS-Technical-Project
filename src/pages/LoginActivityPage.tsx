import React, { useState, useEffect } from 'react';
import { Activity, Search, Laptop, Smartphone, Server, Globe, ShieldAlert, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { DataTable, Column } from '../components/DataTable.tsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.tsx';
import { apiService } from '../services/api.ts';
import { SecurityEvent } from '../types/index.ts';

interface DisplayActivity {
  id: string;
  user: string;
  timestamp: string;
  status: string;
  ipAddress: string;
  client: string;
  eventType: string;
  description: string;
}

export const LoginActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<DisplayActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs: SecurityEvent[] = await apiService.getSecurityLogs();
      // Filter for login-related events: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT
      const loginEvents = logs.filter(
        (l) => l.eventType === 'LOGIN_SUCCESS' || l.eventType === 'LOGIN_FAILURE' || l.eventType === 'LOGOUT'
      );

      const mapped: DisplayActivity[] = loginEvents.map((ev) => ({
        id: ev.id.length > 8 ? ev.id.slice(-6).toUpperCase() : ev.id,
        user: ev.user,
        timestamp: ev.timestamp.includes('T')
          ? new Date(ev.timestamp).toLocaleString()
          : ev.timestamp,
        status: ev.status,
        ipAddress: ev.ipAddress || '127.0.0.1',
        client: ev.userAgent || 'Web Client',
        eventType: ev.eventType,
        description: ev.description,
      }));

      setActivities(mapped);
    } catch (err: any) {
      setError('Unable to load login activity logs from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filtered = activities.filter(
    (act) =>
      act.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.ipAddress.includes(searchTerm) ||
      act.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeviceIcon = (client: string) => {
    const lower = client.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="w-4 h-4 text-emerald-400" />;
    } else if (lower.includes('curl') || lower.includes('python') || lower.includes('postman')) {
      return <Server className="w-4 h-4 text-purple-400" />;
    }
    return <Laptop className="w-4 h-4 text-blue-400" />;
  };

  const columns: Column<DisplayActivity>[] = [
    {
      header: 'Audit ID',
      accessorKey: 'id',
      className: 'font-mono text-xs text-gray-500 w-24',
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      className: 'font-mono text-xs text-gray-300 w-44',
    },
    {
      header: 'Account / User',
      cell: (item) => (
        <span className="font-mono text-xs text-blue-400 font-medium">{item.user}</span>
      ),
    },
    {
      header: 'Auth Status',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
      className: 'w-28',
    },
    {
      header: 'Client / Agent',
      cell: (item) => (
        <div className="flex items-center gap-2 text-xs">
          {getDeviceIcon(item.client)}
          <span className="text-gray-300 font-mono text-[11px] truncate max-w-[200px]" title={item.client}>
            {item.client}
          </span>
        </div>
      ),
    },
    {
      header: 'Origin IP',
      cell: (item) => (
        <div className="text-xs font-mono text-gray-300">
          <span>{item.ipAddress}</span>
        </div>
      ),
      className: 'w-32',
    },
    {
      header: 'Event Trigger',
      cell: (item) => (
        <span className="font-mono text-[11px] text-gray-300 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
          {item.eventType}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Login Activity History"
        description="Chronological audit log of user access attempts, IP addresses, client agents, and authentication outcomes recorded in MongoDB."
        icon={Activity}
        badge="Live DB Logs"
        action={
          <button
            onClick={fetchActivities}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors font-mono disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logins by user email, IP, agent..."
            className="w-full pl-10 pr-4 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-gray-400">
          <span>
            Events Count: <strong className="text-white">{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Loading, Error, Empty, or Table State */}
      {isLoading ? (
        <LoadingState message="Fetching live authentication logs from MongoDB..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchActivities} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Login Activities Recorded"
          description="Authentication attempts (LOGIN_SUCCESS, LOGIN_FAILURE, and LOGOUT) will populate here in real-time."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyMessage="No login activity records match your query."
        />
      )}

      {/* Security Note */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/60 text-xs font-mono text-gray-400 space-y-1">
        <div className="flex items-center gap-2 text-gray-300 font-semibold">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span>Security Audit Trail</span>
        </div>
        <p className="text-gray-400 leading-relaxed text-[11px]">
          Every authentication attempt writes an immutable document to the MongoDB `SecurityLog` collection. Plaintext passwords and authorization tokens are strictly filtered out before database writes.
        </p>
      </div>
    </div>
  );
};
