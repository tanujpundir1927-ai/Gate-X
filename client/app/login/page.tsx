"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, KeyRound, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to admin
    const token = localStorage.getItem("gatexAdminToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password) {
      setErrorMessage("Please enter the administrator password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("gatexAdminToken", data.token);
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Incorrect admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.04),transparent_75%)] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-gray-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-semibold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-xl font-black tracking-wider">
          GATE<span className="text-cyan-400">X</span>
        </span>
      </header>

      {/* Main content panel */}
      <div className="flex-grow flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-sm bg-[#07152d]/30 backdrop-blur-md p-8 rounded-3xl border border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.02)]">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-sm">
              Please enter access passcode to authorize this session.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs mb-6 flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-red-500/50 focus:outline-none transition-all placeholder:text-gray-600 text-sm font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-400 text-black py-4 rounded-xl text-sm font-black tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Passcode...
                </>
              ) : (
                "Authorize Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
