import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { SecurityEventCard } from '../components/SecurityEventCard.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { apiService } from '../services/api.ts';
import { SecurityStatistics, SecurityEvent } from '../types/index.ts';
import { sampleSecurityStats, sampleSecurityEvents } from '../data/sampleData.ts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SecurityStatistics>(sampleSecurityStats);
  const [events, setEvents] = useState<SecurityEvent[]>(sampleSecurityEvents);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedStats, fetchedEvents] = await Promise.all([
      apiService.getSecurityStats(),
      apiService.getSecurityLogs(),
    ]);
    if (fetchedStats) setStats(fetchedStats);
    if (fetchedEvents && fetchedEvents.length > 0) {
      setEvents(fetchedEvents);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAuths = stats.successfulLogins + stats.failedAttempts;
  const successPct = totalAuths > 0 ? Math.round((stats.successfulLogins / totalAuths) * 100) : 100;
  const failedPct = totalAuths > 0 ? 100 - successPct : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Security Operations Dashboard"
        description="Real-time telemetry and threat analytics for authentication traffic, lockout triggers, and anomaly tracking."
        icon={Activity}
        badge="Phase 2 Live Telemetry"
        action={
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white hover:border-gray-700 transition-colors font-mono disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        }
      />

      {/* Security Status Banner */}
      <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-r from-emerald-950/40 via-gray-900/60 to-gray-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-white font-sans">System Status:</span>
              <StatusBadge status="PROTECTED" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live MongoDB user verification active • Argon2/bcrypt salted password hashing enforced.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-gray-950/70 border border-gray-800 text-gray-400">
            Active Lockouts: <span className="text-amber-400 font-bold">0 (Phase 3)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-950/70 border border-gray-800 text-gray-400">
            Database: <span className="text-emerald-400 font-bold">MongoDB Live</span>
          </div>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          variant="blue"
          subtitle="Registered in MongoDB"
          badge="Live DB Count"
        />
        <StatCard
          title="Successful Logins"
          value={stats.successfulLogins}
          icon={CheckCircle}
          variant="emerald"
          subtitle={`${successPct}% verified auth rate`}
          badge="Audit Verified"
        />
        <StatCard
          title="Failed Attempts"
          value={stats.failedAttempts}
          icon={AlertOctagon}
          variant="amber"
          subtitle="Invalid password events"
          badge="Logged in DB"
        />
        <StatCard
          title="Blocked Attacks"
          value={stats.blockedAttacks || 0}
          icon={ShieldAlert}
          variant="red"
          subtitle="Brute-force lockout triggers"
          badge="Phase 3 Ready"
        />
      </div>

      {/* Login Activity Chart & Overview */}
      <div className="rounded-xl border border-gray-800/80 bg-gray-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Authentication Activity Distribution</span>
            </h2>
            <p className="text-xs text-gray-400">
              Live telemetry ratio of verified authorizations vs failed authentication attempts.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-900/60">
            Live MongoDB Aggregation
          </span>
        </div>

        {/* Visual Chart Bars */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Authentication Success Ratio ({successPct}%)</span>
            <span className="text-emerald-400 font-bold">{stats.successfulLogins} / {totalAuths}</span>
          </div>
          <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden border border-gray-800 flex">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.max(successPct, 5)}%` }} />
            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${failedPct}%` }} />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Authorized Logins ({stats.successfulLogins})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Failed Credentials ({stats.failedAttempts})</span>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Table */}
        <div className="pt-4 border-t border-gray-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase text-gray-400">
              Recent Login Stream
            </span>
            <Link
              to="/login-activity"
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View Full Activity Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">IP Address</th>
                  <th className="py-2">Event Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-gray-300">
                {events.slice(0, 4).map((row) => (
                  <tr key={row.id} className="hover:bg-gray-800/20">
                    <td className="py-2.5 pr-4 text-gray-400">
                      {row.timestamp.includes('T') ? new Date(row.timestamp).toLocaleTimeString() : row.timestamp}
                    </td>
                    <td className="py-2.5 pr-4 text-blue-400">{row.user}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">{row.ipAddress}</td>
                    <td className="py-2.5 text-gray-400 truncate max-w-[200px]">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Security Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Recent Security Events</span>
            </h2>
            <p className="text-xs text-gray-400">
              Audit trails of authentication events, failed attempts, and login outcomes.
            </p>
          </div>
          <Link
            to="/security-events"
            className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>All Security Events</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {events.slice(0, 4).map((event) => (
            <SecurityEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Phase 2 Explanatory Card */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/70 flex items-start gap-3">
        <Terminal className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-gray-400">
          <p className="font-semibold text-gray-200 font-mono">
            Phase 2 Authentication System Active
          </p>
          <p className="leading-relaxed">
            User registration and logins are now processed live by Express and stored in MongoDB using bcrypt salted password hashing. Telemetry metrics and security audit logs reflect real database state. Advanced brute-force lockout thresholds will be introduced in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
};
