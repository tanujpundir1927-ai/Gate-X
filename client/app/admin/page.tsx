"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, CheckCircle, XCircle, Search, Filter, RefreshCw, 
  LogOut, ArrowLeft, ShieldCheck, BarChart4, TrendingUp, Calendar 
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    usedEntries: 0,
    remainingEntries: 0,
    todayRegistrations: 0,
    timeline: [],
    trends: []
  });
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Route security & Fetch initial data
  useEffect(() => {
    const token = localStorage.getItem("gatexAdminToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthChecked(true);
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.status === 401) {
        handleLogout();
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch Users
      await fetchUsers(token, search, filterStatus);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (token: string, searchQuery: string, statusQuery: string) => {
    try {
      const url = new URL("http://localhost:5000/api/admin/users");
      if (searchQuery) url.searchParams.append("search", searchQuery);
      if (statusQuery !== "all") url.searchParams.append("status", statusQuery);

      const usersRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.status === 401) {
        handleLogout();
        return;
      }
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  // Handle live searches and status filtering
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    const token = localStorage.getItem("gatexAdminToken") || "";
    fetchUsers(token, query, filterStatus);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    const token = localStorage.getItem("gatexAdminToken") || "";
    fetchUsers(token, search, status);
  };

  // Reset a user's scanned status back to unused
  const handleResetUserScan = async (userId: string) => {
    const token = localStorage.getItem("gatexAdminToken") || "";
    if (!token) return;

    setResettingId(userId);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // Refresh local dashboard data
        fetchDashboardData(token);
      } else {
        alert("Failed to reset scan status");
      }
    } catch (error) {
      console.error("Reset scan error:", error);
    } finally {
      setResettingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gatexAdminToken");
    router.push("/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Authorizing administrative access...
      </div>
    );
  }

  // Calculate scan percentage
  const scanRate = stats.totalUsers > 0 
    ? Math.round((stats.usedEntries / stats.totalUsers) * 100) 
    : 0;

  // Donut chart math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scanRate / 100) * circumference;

  // Bar chart math (Past 7 days)
  const maxRegCount = stats.timeline && stats.timeline.length > 0 
    ? Math.max(...stats.timeline.map((t: any) => t.count), 5) 
    : 5;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {/* Background neon radial blur */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04),transparent_75%)] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-gray-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <span className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-xs font-semibold cursor-pointer border border-gray-800 rounded-lg px-2.5 py-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Landing
            </span>
          </Link>
          <span className="text-xl font-black tracking-wider">
            GATE<span className="text-cyan-400">X</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE CONSOLE
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-950/20 hover:bg-red-500 hover:text-black border border-red-500/30 rounded-xl px-4 py-2 text-xs font-bold text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </header>

      {/* Loading state overlay */}
      {loading && (
        <div className="flex-grow flex items-center justify-center font-mono text-cyan-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Synching with database server...
        </div>
      )}

      {!loading && (
        <main className="flex-grow max-w-6xl w-full mx-auto p-6 space-y-8 z-10">
          
          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Registrations */}
            <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-cyan-500/20 group-hover:text-cyan-500/30 transition-colors">
                <Users className="w-8 h-8 stroke-[1.5]" />
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Total Registrations</span>
              <p className="text-3xl font-black text-white mt-2 font-mono">{stats.totalUsers}</p>
              <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                <span className="text-cyan-400 font-bold font-mono">+{stats.todayRegistrations}</span> today
              </div>
            </div>

            {/* Scanned Checkins */}
            <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
                <CheckCircle className="w-8 h-8 stroke-[1.5]" />
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Checked-In</span>
              <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">{stats.usedEntries}</p>
              <div className="mt-2 text-[10px] text-gray-400">
                Velocity check-in rate: <span className="text-emerald-400 font-bold font-mono">{scanRate}%</span>
              </div>
            </div>

            {/* Remaining entries */}
            <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-amber-500/20 group-hover:text-amber-500/30 transition-colors">
                <XCircle className="w-8 h-8 stroke-[1.5]" />
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Remaining Entries</span>
              <p className="text-3xl font-black text-amber-500 mt-2 font-mono">{stats.remainingEntries}</p>
              <div className="mt-2 text-[10px] text-gray-400">
                Awaiting check-in at gate
              </div>
            </div>

            {/* Today's Registrations */}
            <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-purple-500/20 group-hover:text-purple-500/30 transition-colors">
                <Calendar className="w-8 h-8 stroke-[1.5]" />
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Today's Signups</span>
              <p className="text-3xl font-black text-purple-400 mt-2 font-mono">{stats.todayRegistrations}</p>
              <div className="mt-2 text-[10px] text-gray-400">
                New accounts created
              </div>
            </div>

          </div>

          {/* Interactive Analytics charts */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Chart 1: Entry Trends (Donut) */}
            <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-gray-900 pb-3">
                <h3 className="text-xs text-gray-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Entry Velocity Trends
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE RATIO</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around py-6 gap-6">
                {/* SVG Donut */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-95" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_#10b981]"
                    />
                  </svg>
                  
                  {/* Absolute Centered Text */}
                  <div className="absolute text-center">
                    <p className="text-3xl font-black font-mono text-emerald-400">{scanRate}%</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Scanned</p>
                  </div>
                </div>

                {/* Details side table */}
                <div className="space-y-4 text-xs min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Checked In
                    </span>
                    <span className="font-bold text-white font-mono">{stats.usedEntries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded bg-gray-700 inline-block" /> Unscanned
                    </span>
                    <span className="font-bold text-white font-mono">{stats.remainingEntries}</span>
                  </div>
                  <div className="border-t border-gray-900 pt-3 flex items-center justify-between">
                    <span className="text-gray-500">Total Passes</span>
                    <span className="font-black text-cyan-400 font-mono">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Daily Registrations (SVG Bar Chart) */}
            <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 border-b border-gray-900 pb-3">
                <h3 className="text-xs text-gray-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <BarChart4 className="w-4 h-4 text-cyan-400" /> Daily Signup Distribution
                </h3>
                <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">7 DAY LOG</span>
              </div>

              {/* Custom SVG Bar Graph */}
              <div className="w-full h-44 mt-4 flex items-end justify-between px-2 relative">
                {stats.timeline && stats.timeline.map((item: any, idx: number) => {
                  // Calculate height percent
                  const heightPercent = maxRegCount > 0 ? (item.count / maxRegCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 group flex-grow text-center">
                      <div className="relative w-full flex items-end justify-center h-28">
                        {/* Hover Tooltip tooltip */}
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-cyan-500 text-black text-[9px] font-black py-0.5 px-1.5 rounded transition-all font-mono z-20">
                          {item.count}
                        </span>
                        
                        {/* Bar */}
                        <div
                          className="w-5 sm:w-8 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md hover:from-cyan-400 hover:to-cyan-300 transition-all filter hover:drop-shadow-[0_0_8px_#06b6d4] cursor-pointer"
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        />
                      </div>
                      
                      {/* X Label */}
                      <span className="text-[9px] text-gray-500 font-bold tracking-wider uppercase font-mono mt-1">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* User Management Database Console */}
          <div className="bg-[#07152d]/40 backdrop-blur-md rounded-3xl border border-cyan-500/10 p-6 space-y-6">
            
            {/* Table Header Filter panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Database Registry 
                <span className="text-xs text-gray-500 font-normal font-mono">({users.length} loaded)</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search query box */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by Name, ID, Serial..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-gray-900 focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-gray-600 text-xs font-semibold"
                  />
                </div>

                {/* Filter Selector tabs */}
                <div className="flex bg-black p-1 rounded-xl border border-gray-900 w-full sm:w-auto">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-grow sm:flex-grow-0 ${
                      filterStatus === "all" ? "bg-cyan-500 text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange("used")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-grow sm:flex-grow-0 ${
                      filterStatus === "used" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Scanned
                  </button>
                  <button
                    onClick={() => handleFilterChange("unused")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-grow sm:flex-grow-0 ${
                      filterStatus === "unused" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Unused
                  </button>
                </div>
              </div>
            </div>

            {/* Attendee Data Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-900 bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-900 text-gray-500 font-extrabold uppercase bg-black/80">
                    <th className="p-4">Attendee / Serial</th>
                    <th className="p-4">College ID / Branch</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-950">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-600 font-mono">
                        No registries resolved. Awaiting student check-ins.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-cyan-500/5 transition-colors">
                        {/* Name & Serial */}
                        <td className="p-4 space-y-1">
                          <p className="font-extrabold text-white text-sm">{user.name}</p>
                          <p className="text-[10px] font-mono text-cyan-400 font-bold">{user.serialNumber}</p>
                        </td>

                        {/* ID & Branch */}
                        <td className="p-4 space-y-0.5 text-gray-300">
                          <p className="font-bold">{user.collegeId}</p>
                          <p className="text-[10px] text-gray-500">{user.branch}</p>
                        </td>

                        {/* Email */}
                        <td className="p-4 text-gray-400 font-semibold">{user.email}</td>

                        {/* Scan status */}
                        <td className="p-4">
                          {user.used ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3 stroke-[2.5]" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <XCircle className="w-3 h-3 stroke-[2.5]" /> Unused Pass
                            </span>
                          )}
                          {user.scannedAt && (
                            <p className="text-[9px] text-gray-500 mt-1 font-mono">
                              {new Date(user.scannedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </td>

                        {/* Action buttons (Reset scan) */}
                        <td className="p-4 text-right">
                          {user.used ? (
                            <button
                              onClick={() => handleResetUserScan(user._id)}
                              disabled={resettingId === user._id}
                              className="px-3 py-1.5 bg-red-950/20 hover:bg-red-500 hover:text-black border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                            >
                              {resettingId === user._id ? (
                                <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
                              ) : null}
                              Reset Scan
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider select-none pr-3">
                              Clear Entry
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
