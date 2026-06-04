"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Keyboard, AlertTriangle, CheckCircle2, XCircle, Volume2, RefreshCw, QrCode } from "lucide-react";

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [qrData, setQrData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const scannerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio synthesizer for premium beep sounds
  const playBeep = (type: "success" | "error") => {
    if (typeof window === "undefined") return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Resume audio context if suspended (browser security)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.16);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime); // Low buzz
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.36);
      }
    } catch (error) {
      console.error("Sound play failed:", error);
    }
  };

  // Dynamically start html5-qrcode scanner
  const startScanner = async () => {
    if (typeof window === "undefined") return;
    setScanning(true);
    setScanResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      // Ensure element exists before running
      const readerElement = document.getElementById("scanner-reader");
      if (!readerElement) return;

      const html5QrCode = new Html5Qrcode("scanner-reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 15, qrbox: { width: 220, height: 220 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success callback
          stopScanner();
          handleValidateQR(decodedText);
        },
        (errorMessage) => {
          // Verbose log filter to prevent clogging console
        }
      );
    } catch (error) {
      console.error("Camera scanner error:", error);
      alert("Could not access camera. Please check permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Stop scanner error:", err);
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    if (activeTab === "camera") {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      // Stop scanner on unmount
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [activeTab]);

  // Validate scanned data against backend
  const handleValidateQR = async (dataPayload: string) => {
    if (!dataPayload.trim()) return;
    
    setValidating(true);
    setScanResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/scanner/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData: dataPayload }),
      });

      const data = await response.json();

      if (response.ok) {
        // VALID ENTRY ✅
        playBeep("success");
        const result = {
          status: "valid",
          message: data.message,
          user: data.user,
        };
        setScanResult(result);
        addToHistory(result);
      } else {
        // ALREADY USED or INVALID
        playBeep("error");
        const isUsed = data.message.includes("ALREADY USED");
        const result = {
          status: isUsed ? "used" : "invalid",
          message: data.message,
          user: data.user || null,
        };
        setScanResult(result);
        addToHistory(result);
      }
    } catch (error) {
      console.error("Validation error:", error);
      playBeep("error");
      const result = {
        status: "invalid",
        message: "Server Connection Error ❌",
        user: null,
      };
      setScanResult(result);
      addToHistory(result);
    } finally {
      setValidating(false);
      setQrData("");
    }
  };

  const addToHistory = (result: any) => {
    const logItem = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      name: result.user ? result.user.name : "Unknown Attendee",
      serialNumber: result.user ? result.user.serialNumber : "N/A",
      status: result.status,
    };
    setRecentScans((prev) => [logItem, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {/* Glow backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <Link href="/">
          <span className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-semibold cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </span>
        </Link>
        <span className="text-xl font-black tracking-wider flex items-center gap-2">
          GATE<span className="text-cyan-400">X</span>
          <span className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full font-bold">SCANNER</span>
        </span>
      </header>

      {/* Main Console Layout */}
      <div className="flex-grow max-w-5xl mx-auto w-full p-6 grid md:grid-cols-12 gap-8 items-start z-10">
        
        {/* Left Column: Scanning Interface */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#07152d]/40 backdrop-blur-md rounded-3xl border border-cyan-500/10 p-6 flex flex-col gap-6">
            
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-black rounded-xl border border-gray-900">
              <button
                onClick={() => setActiveTab("camera")}
                className={`py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "camera"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-4 h-4" /> Camera Scan
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Keyboard className="w-4 h-4" /> Manual Data Input
              </button>
            </div>

            {/* Scanning viewport or manual inputs */}
            {activeTab === "camera" ? (
              <div className="relative">
                <div className="aspect-square w-full max-w-[380px] mx-auto bg-black border border-cyan-500/20 rounded-2xl overflow-hidden relative flex items-center justify-center">
                  
                  {/* Camera Element */}
                  <div id="scanner-reader" className="w-full h-full" />

                  {/* Empty State / Loading */}
                  {!scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 z-20">
                      <QrCode className="w-12 h-12 text-cyan-500 animate-pulse" />
                      <button
                        onClick={startScanner}
                        className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl text-xs hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin" /> Wake Up Camera
                      </button>
                    </div>
                  )}

                  {/* Scanning HUD overlays */}
                  {scanning && (
                    <>
                      <div className="absolute inset-0 border-[3px] border-cyan-500/30 rounded-2xl pointer-events-none z-10" />
                      {/* Animated green laser line */}
                      <div className="absolute left-0 right-0 h-1 bg-green-400/90 shadow-[0_0_10px_#10b981] animate-scan-laser z-10 pointer-events-none" />
                      {/* Corner crop target details */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-[4px] border-l-[4px] border-cyan-400 rounded-tl z-10 pointer-events-none" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-[4px] border-r-[4px] border-cyan-400 rounded-tr z-10 pointer-events-none" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[4px] border-l-[4px] border-cyan-400 rounded-bl z-10 pointer-events-none" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[4px] border-r-[4px] border-cyan-400 rounded-br z-10 pointer-events-none" />
                    </>
                  )}
                </div>

                {scanning && (
                  <button
                    onClick={stopScanner}
                    className="mt-4 mx-auto block text-xs text-gray-500 hover:text-cyan-400 transition-colors font-bold cursor-pointer"
                  >
                    Pause Video Stream
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  placeholder='Paste QR Code JSON string here (e.g. {"serialNumber": "GTX-2026-000001", "name": "..."})'
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  className="w-full h-44 p-4 rounded-2xl bg-black border border-gray-800 focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-gray-600 text-xs font-mono"
                />
                <button
                  onClick={() => handleValidateQR(qrData)}
                  disabled={validating || !qrData.trim()}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Pass...
                    </>
                  ) : (
                    "Validate QR Data"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scan Result Card & Recent Log */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Main Verification Status Card */}
          <div className="bg-[#07152d]/40 backdrop-blur-md rounded-3xl border border-cyan-500/10 p-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Scan Result Card</h2>
            
            {!scanResult && !validating && (
              <div className="border border-dashed border-gray-800 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center gap-2.5">
                <QrCode className="w-10 h-10 text-gray-700 stroke-[1.5]" />
                <p className="text-xs">Awaiting scan data input to verify attendee status.</p>
              </div>
            )}

            {validating && (
              <div className="border border-cyan-500/20 rounded-2xl p-12 text-center text-cyan-400 flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-semibold">Running database validation checks...</p>
              </div>
            )}

            {!validating && scanResult && (
              <div className={`rounded-2xl p-6 border transition-all ${
                scanResult.status === "valid"
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.1)]"
                  : scanResult.status === "used"
                    ? "bg-red-950/20 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.1)]"
                    : "bg-amber-950/20 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
              }`}>
                {/* Result header banner */}
                <div className="flex items-center gap-3 mb-6">
                  {scanResult.status === "valid" ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0 stroke-[2.5]" />
                  ) : scanResult.status === "used" ? (
                    <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 stroke-[2.5]" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 stroke-[2.5]" />
                  )}
                  
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-wider ${
                      scanResult.status === "valid"
                        ? "text-emerald-400"
                        : scanResult.status === "used"
                          ? "text-red-500"
                          : "text-amber-500"
                    }`}>
                      {scanResult.message}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">STATUS RESOLUTION COMPLETE</span>
                  </div>
                </div>

                {/* Scanned User Details */}
                {scanResult.user ? (
                  <div className="space-y-4 text-sm border-t border-gray-800/60 pt-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">ATTENDEE NAME</span>
                      <span className="font-extrabold text-white">{scanResult.user.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block font-semibold">COLLEGE ID</span>
                        <span className="font-bold text-gray-200">{scanResult.user.collegeId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block font-semibold">BRANCH</span>
                        <span className="font-semibold text-gray-300">{scanResult.user.branch}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">SERIAL NUMBER</span>
                      <span className="font-mono font-bold text-cyan-400">{scanResult.user.serialNumber}</span>
                    </div>

                    {scanResult.user.scannedAt && (
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block font-semibold">CHECK-IN TIME</span>
                        <span className="text-xs text-gray-400">
                          {new Date(scanResult.user.scannedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-gray-800/60 pt-4">
                    <p className="text-xs text-gray-400">
                      No attendee data associated with this scanned payload could be resolved in the database.
                    </p>
                  </div>
                )}

                {/* Scan Action retry */}
                {activeTab === "camera" && (
                  <button
                    onClick={startScanner}
                    className="mt-6 w-full py-3 bg-white/5 border border-gray-800 hover:border-cyan-500/50 hover:bg-black rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Scan Next QR Code
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Scans Session Log */}
          <div className="bg-[#07152d]/40 backdrop-blur-md rounded-3xl border border-cyan-500/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Session Log</h2>
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            {recentScans.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No scans logged during this console session.</p>
            ) : (
              <div className="space-y-3">
                {recentScans.map((log) => (
                  <div key={log.id} className="bg-black/40 border border-gray-900 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div className="truncate pr-2">
                      <p className="font-bold text-white truncate">{log.name}</p>
                      <p className="text-[10px] font-mono text-cyan-400">{log.serialNumber}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        log.status === "valid"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.status === "used"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {log.status === "valid" ? "VALID" : log.status === "used" ? "USED" : "INVALID"}
                      </span>
                      <p className="text-[9px] text-gray-500 mt-1 font-mono">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
