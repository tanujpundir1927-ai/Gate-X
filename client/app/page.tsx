import Link from "next/link";
import { QrCode, ShieldCheck, BarChart3, Mail, ArrowRight, Activity, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Neon Grid effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.07),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-gray-800 bg-black/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <QrCode className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-cyan-500">
            GATE<span className="text-cyan-400 animate-neon-pulse">X</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a>
          <a href="/login" className="hover:text-cyan-400 transition-colors">Admin Portal</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <span className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              Login
            </span>
          </Link>
          <Link href="/register">
            <span className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer">
              Register Pass <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center px-6 max-w-6xl mx-auto py-12 md:py-20 z-10 w-full">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Event Entry System
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Smart QR Based <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 animate-neon-pulse">
                Entry Management
              </span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-lg">
              Eliminate fake passes, duplicate entries, manual attendance spreadsheets, and entry chaos. Security and check-ins, automated instantly.
            </p>

            {/* Quick Action Dashboard Grid */}
            <div className="pt-4 grid grid-cols-2 gap-4 max-w-md">
              <Link href="/register">
                <div className="p-4 rounded-xl glass-card border border-cyan-500/20 hover:border-cyan-500/60 cursor-pointer transition-all flex flex-col justify-between h-28 group">
                  <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Attendees</span>
                  <span className="text-lg font-bold flex items-center justify-between group-hover:text-cyan-300">
                    Register Pass <ArrowRight className="w-4 h-4 text-cyan-400 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link href="/scanner">
                <div className="p-4 rounded-xl glass-card border border-green-500/20 hover:border-green-500/60 cursor-pointer transition-all flex flex-col justify-between h-28 group">
                  <span className="text-xs font-semibold text-green-400 tracking-wider uppercase">Security Staff</span>
                  <span className="text-lg font-bold flex items-center justify-between group-hover:text-green-300">
                    Scanner Panel <ArrowRight className="w-4 h-4 text-green-400 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link href="/login">
                <div className="p-4 rounded-xl glass-card border border-red-500/20 hover:border-red-500/60 cursor-pointer transition-all flex flex-col justify-between h-28 group col-span-2">
                  <span className="text-xs font-semibold text-red-400 tracking-wider uppercase">Organizers</span>
                  <span className="text-lg font-bold flex items-center justify-between group-hover:text-red-300">
                    Admin Dashboard <ArrowRight className="w-4 h-4 text-red-400 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Interactive Ticket Graphic */}
          <div className="md:col-span-5 flex justify-center items-center">
            <div className="relative animate-float">
              {/* Glow backdrop */}
              <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl filter blur-xl pointer-events-none" />
              
              <div className="w-[300px] h-[450px] bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-cyan-500/40 p-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
                {/* Header design */}
                <div className="border-b border-gray-800 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs text-gray-500 tracking-widest font-black uppercase">EVENT TICKET</h3>
                    <h4 className="text-sm font-bold text-white">GATEX TECHFEST</h4>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">2026</span>
                </div>

                {/* Ticket Details */}
                <div className="py-6 space-y-3 flex-grow justify-center flex flex-col">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Name</span>
                    <span className="text-sm font-bold text-gray-200">Tanuj Pundir</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">College ID</span>
                    <span className="text-sm font-semibold text-gray-300">GT-X892-2026</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Pass Serial</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">GTX-2026-000001</span>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="my-2 p-3 bg-white rounded-xl flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    {/* QR Code mockup */}
                    <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                      <rect x="0" y="0" width="20" height="20" fill="currentColor"/>
                      <rect x="5" y="5" width="10" height="10" fill="white"/>
                      <rect x="80" y="0" width="20" height="20" fill="currentColor"/>
                      <rect x="85" y="5" width="10" height="10" fill="white"/>
                      <rect x="0" y="80" width="20" height="20" fill="currentColor"/>
                      <rect x="5" y="85" width="10" height="10" fill="white"/>
                      <rect x="30" y="10" width="10" height="40" fill="currentColor"/>
                      <rect x="50" y="30" width="20" height="10" fill="currentColor"/>
                      <rect x="60" y="60" width="30" height="15" fill="currentColor"/>
                      <rect x="40" y="70" width="10" height="20" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* Status line */}
                <div className="border-t border-gray-800 pt-4 text-center">
                  <span className="text-green-400 font-bold tracking-widest text-xs uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    VALID FOR ENTRY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Cards Section */}
      <section id="features" className="bg-black/50 border-t border-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Engineered for Event Operations</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A complete suite of entry protection features built to operate efficiently at scale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold">Dynamic QR Codes</h3>
              <p className="text-gray-400 text-sm">
                Generates high-definition event passes with uniquely signed, dynamic database-backed QR codes.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold">Double-Scan Block</h3>
              <p className="text-gray-400 text-sm">
                Prevents duplicate entries. The validation system instantly flags passes already checked-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold">Real-time Analytics</h3>
              <p className="text-gray-400 text-sm">
                Monitor registrations, entrance velocity, peak hours, and remaining seats via interactive admin charts.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold">Instant Ticket Delivery</h3>
              <p className="text-gray-400 text-sm">
                Users receive custom email confirmations with their digital event pass, event agenda, and calendar files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-950 bg-black/80 py-8 px-6 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-white tracking-widest text-xs uppercase">GATEX</span>
          </div>
          <p className="text-xs">&copy; 2026 GateX Entry Management System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-cyan-400 transition-colors cursor-pointer">Security Protocol</span>
            <span className="hover:text-cyan-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
