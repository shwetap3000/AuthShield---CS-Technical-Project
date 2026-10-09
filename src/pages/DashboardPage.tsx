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
  Lock,
  Unlock,
  Play,
  Flame,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { SecurityEventCard } from '../components/SecurityEventCard.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { apiService } from '../services/api.ts';
import { SecurityStatistics, SecurityEvent, LockedAccount } from '../types/index.ts';
import { sampleSecurityStats, sampleSecurityEvents } from '../data/sampleData.ts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SecurityStatistics>(sampleSecurityStats);
  const [events, setEvents] = useState<SecurityEvent[]>(sampleSecurityEvents);
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulation Lab state
  const [simTargetEmail, setSimTargetEmail] = useState('target@cyber.edu');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<{ message: string; success: boolean } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedStats, fetchedEvents, fetchedLocked] = await Promise.all([
      apiService.getSecurityStats(),
      apiService.getSecurityLogs(),
      apiService.getLockedAccounts(),
    ]);
    if (fetchedStats) setStats(fetchedStats);
    if (fetchedEvents && fetchedEvents.length > 0) {
      setEvents(fetchedEvents);
    }
    if (fetchedLocked) {
      setLockedAccounts(fetchedLocked);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateAttack = async () => {
    if (!simTargetEmail.trim()) return;
    setSimRunning(true);
    setSimResult(null);

    const res = await apiService.simulateBruteForceAttack(simTargetEmail.trim(), 5);
    setSimRunning(false);
    setSimResult({
      success: res.success,
      message: res.message || 'Simulation executed.',
    });

    // Refresh telemetry immediately
    await loadData();
  };

  const handleUnlockAccount = async (email: string) => {
    const res = await apiService.unlockAccount(email, 'Security Operations Console manual override');
    if (res.success) {
      setSimResult({
        success: true,
        message: `Account ${email} unlocked successfully. Failure counter reset to 0.`,
      });
      await loadData();
    }
  };

  const totalAuths = stats.successfulLogins + stats.failedAttempts;
  const successPct = totalAuths > 0 ? Math.round((stats.successfulLogins / totalAuths) * 100) : 100;
  const failedPct = totalAuths > 0 ? 100 - successPct : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Security Operations Dashboard"
        description="Real-time telemetry and threat analytics for authentication traffic, rolling brute-force detection, and account lockout enforcement."
        icon={Activity}
        badge="Phase 3 Live Defense"
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
      <div
        className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          stats.activeLockouts > 0
            ? 'border-red-900/60 bg-gradient-to-r from-red-950/50 via-gray-900/60 to-gray-900/40'
            : 'border-emerald-900/40 bg-gradient-to-r from-emerald-950/40 via-gray-900/60 to-gray-900/40'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-xl border ${
              stats.activeLockouts > 0
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {stats.activeLockouts > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-white font-sans">Defense Status:</span>
              <StatusBadge status={stats.activeLockouts > 0 ? 'ALERT' : 'PROTECTED'} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats.activeLockouts > 0
                ? `Active Threat Mitigated: ${stats.activeLockouts} account(s) currently locked out under rolling brute-force defense policy.`
                : 'All accounts secure • Rolling 15-minute brute-force detection window active in MongoDB.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-gray-950/70 border border-gray-800 text-gray-400">
            Active Lockouts:{' '}
            <span
              className={`font-bold ${stats.activeLockouts > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}
            >
              {stats.activeLockouts}
            </span>
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
          subtitle="Rolling window tracked"
          badge="Logged in DB"
        />
        <StatCard
          title="Blocked Attacks"
          value={stats.blockedAttacks || 0}
          icon={ShieldAlert}
          variant="red"
          subtitle="Brute-force lockout triggers"
          badge="Defenses Engaged"
        />
      </div>

      {/* Brute-Force Testing Lab / Attack Simulation Component */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Brute-Force Attack Simulation & Lockout Test Lab
              </h2>
              <p className="text-xs text-gray-400">
                Demonstrate genuine cybersecurity defense in real time: trigger consecutive dictionary login failures and observe automatic account lockout.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-900/60 shrink-0">
            Phase 3 Defense Lab
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono text-gray-400">Target User Account Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={simTargetEmail}
                onChange={(e) => setSimTargetEmail(e.target.value)}
                placeholder="target@cyber.edu"
                className="flex-1 px-3.5 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setSimTargetEmail('analyst@cyber.edu')}
                className="px-2.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-[11px] font-mono text-gray-300 whitespace-nowrap"
              >
                Use Analyst
              </button>
              <button
                type="button"
                onClick={() => setSimTargetEmail('target@cyber.edu')}
                className="px-2.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-[11px] font-mono text-gray-300 whitespace-nowrap"
              >
                Use Target
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleSimulateAttack}
              disabled={simRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${simRunning ? 'animate-spin' : ''}`} />
              <span>{simRunning ? 'Simulating 5 Attacks...' : 'Simulate 5 Rapid Failed Attempts'}</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs font-mono leading-relaxed flex items-center justify-between gap-2 ${
              simResult.success
                ? 'bg-red-950/40 border-red-800/80 text-red-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{simResult.message}</span>
            </div>
            <button
              onClick={() => handleUnlockAccount(simTargetEmail)}
              className="px-2.5 py-1 rounded bg-gray-900 border border-red-700 text-white text-[11px] hover:bg-red-900 transition-colors shrink-0"
            >
              Clear Lockout Now
            </button>
          </div>
        )}

        {/* Currently Locked Accounts Table */}
        {lockedAccounts.length > 0 && (
          <div className="pt-3 border-t border-gray-800">
            <h3 className="text-xs font-mono font-semibold uppercase text-red-400 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Currently Locked Accounts ({lockedAccounts.length})</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="py-1.5 pr-4">User</th>
                    <th className="py-1.5 pr-4">Failed Logins</th>
                    <th className="py-1.5 pr-4">Lockout Expiry</th>
                    <th className="py-1.5 pr-4">Time Remaining</th>
                    <th className="py-1.5 text-right">Defense Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {lockedAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-800/20">
                      <td className="py-2 pr-4 text-red-400 font-semibold">{acc.email}</td>
                      <td className="py-2 pr-4">{acc.failedLoginAttempts} attempts</td>
                      <td className="py-2 pr-4 text-gray-400">
                        {new Date(acc.lockUntil).toLocaleTimeString()}
                      </td>
                      <td className="py-2 pr-4 text-amber-400 font-bold">
                        ~{acc.remainingMinutes} min left
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleUnlockAccount(acc.email)}
                          className="px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-850 border border-gray-700 text-gray-200 text-[11px] font-semibold transition-colors"
                        >
                          Manual Release
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
            <span className="text-emerald-400 font-bold">
              {stats.successfulLogins} / {totalAuths}
            </span>
          </div>
          <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden border border-gray-800 flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.max(successPct, 5)}%` }}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${failedPct}%` }}
            />
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
                      {row.timestamp.includes('T')
                        ? new Date(row.timestamp).toLocaleTimeString()
                        : row.timestamp}
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
              <span>Recent Security Events & Anomaly Triggers</span>
            </h2>
            <p className="text-xs text-gray-400">
              Audit trails of authentication events, failed attempts, and brute-force lockouts.
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

      {/* Phase 3 Explanatory Card */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/70 flex items-start gap-3">
        <Terminal className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-gray-400">
          <p className="font-semibold text-gray-200 font-mono">
            Phase 3 Defense Mechanism Active: Brute-Force Detection & Automatic Account Lockout
          </p>
          <p className="leading-relaxed">
            The authentication gateway monitors failed credentials per account within a rolling 15-minute window. Upon the 5th failed attempt, the account is atomically locked in MongoDB for 15 minutes, rejecting any credentials until expiry. All detection milestones (<code>BRUTE_FORCE_DETECTED</code>, <code>ACCOUNT_LOCKED</code>, <code>ACCOUNT_UNLOCKED</code>) are recorded to the immutable audit log.
          </p>
        </div>
      </div>
    </div>
  );
};

