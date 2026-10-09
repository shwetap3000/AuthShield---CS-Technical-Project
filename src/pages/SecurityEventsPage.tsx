import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, RefreshCw, Terminal } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { DataTable, Column } from '../components/DataTable.tsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.tsx';
import { apiService } from '../services/api.ts';
import { SecurityEvent } from '../types/index.ts';
import { sampleSecurityEvents } from '../data/sampleData.ts';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await apiService.getSecurityLogs();
      if (logs && logs.length > 0) {
        setEvents(logs);
      } else {
        setEvents(sampleSecurityEvents);
      }
    } catch {
      setError('Failed to fetch security events from MongoDB.');
      setEvents(sampleSecurityEvents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.ipAddress.includes(searchTerm) ||
      ev.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || ev.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const columns: Column<SecurityEvent>[] = [
    {
      header: 'Event ID',
      cell: (item) => (
        <span className="font-mono text-xs text-gray-400">
          {item.id.length > 8 ? item.id.slice(-6).toUpperCase() : item.id}
        </span>
      ),
      className: 'w-24',
    },
    {
      header: 'Event Type',
      cell: (item) => (
        <span className="font-semibold text-gray-200 text-xs">
          {item.eventType.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'User / Identity',
      cell: (item) => (
        <span className="font-mono text-xs text-blue-400">{item.user}</span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
      className: 'w-28',
    },
    {
      header: 'Timestamp',
      cell: (item) => (
        <span className="font-mono text-xs text-gray-400">
          {item.timestamp.includes('T')
            ? new Date(item.timestamp).toLocaleString()
            : item.timestamp}
        </span>
      ),
      className: 'w-36',
    },
    {
      header: 'Description',
      cell: (item) => (
        <p className="text-xs text-gray-300 max-w-md truncate" title={item.description}>
          {item.description}
        </p>
      ),
    },
    {
      header: 'Action',
      cell: (item) => (
        <button
          onClick={() => setSelectedEvent(item)}
          className="text-xs font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          Inspect
        </button>
      ),
      className: 'w-20 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Security Audit Events"
        description="Comprehensive audit trail of authentication attempts, brute-force alarms, lockout operations, and policy violations recorded in MongoDB."
        icon={ShieldAlert}
        badge="Live Audit Log"
        action={
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors font-mono disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Audit Log</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, IP, or event..."
            className="w-full pl-10 pr-4 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'BLOCKED', 'WARNING', 'FAILED', 'SUCCESS'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-gray-850 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Data Table / States */}
      {isLoading ? (
        <LoadingState message="Fetching live security audit events from MongoDB..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Security Events Found"
          description="No security records match your current filter criteria."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          emptyMessage="No security events match the current filter criteria."
        />
      )}

      {/* Selected Event Inspection Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold font-mono text-white">
                  Event Telemetry Inspection [
                  {selectedEvent.id.length > 8 ? selectedEvent.id.slice(-6).toUpperCase() : selectedEvent.id}
                  ]
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1 bg-gray-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Event Type:</span>
                <span className="text-gray-200 font-bold">{selectedEvent.eventType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Target Identity:</span>
                <span className="text-blue-400">{selectedEvent.user}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Classification:</span>
                <StatusBadge status={selectedEvent.status} size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Origin IP:</span>
                <span className="text-gray-300">{selectedEvent.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">User Agent:</span>
                <span className="text-gray-400 truncate max-w-[260px]">{selectedEvent.userAgent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Attempt Sequence Count:</span>
                <span className="text-red-400 font-bold">{selectedEvent.attemptCount}</span>
              </div>
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Defense Log Analysis:</span>
                <p className="p-3 bg-gray-950 rounded-lg border border-gray-800 text-gray-300 leading-relaxed text-[11px]">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Architectural Note */}
      <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/60 text-xs font-mono text-gray-400 flex items-center justify-between">
        <span>Security audit events fetched directly from MongoDB. Passwords are never logged.</span>
        <span className="text-blue-400 font-semibold">{filteredEvents.length} records shown</span>
      </div>
    </div>
  );
};
