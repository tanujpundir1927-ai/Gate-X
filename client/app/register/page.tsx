"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Mail, User, Shield, GraduationCap, Building, QrCode, FileDown, CheckCircle, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegeId: "",
    branch: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const ticketRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.collegeId ||
      !formData.branch ||
      !formData.password
    ) {
      setErrorMessage("Please Fill All Fields");
      return;
    }

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://gate-x-p00t.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setRegisteredUser({
        name: formData.name,
        email: formData.email,
        collegeId: formData.collegeId,
        branch: formData.branch,
        serialNumber: data.serialNumber,
        qrCode: data.qrCode,
      });

      // Clear Form
      setFormData({
        name: "",
        email: "",
        collegeId: "",
        branch: "",
        password: "",
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#000000",
        scale: 3, // higher scale for printable quality
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `gatex-pass-${registeredUser.serialNumber}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to export image pass");
    }
  };

  const downloadAsPDF = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#000000",
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`gatex-pass-${registeredUser.serialNumber}.pdf`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to export PDF pass");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_70%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-gray-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <Link href="/">
          <span className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </span>
        </Link>
        <span className="text-xl font-black tracking-wider">
          GATE<span className="text-cyan-400">X</span>
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center p-6 z-10">
        {!registeredUser ? (
          /* Registration Form */
          <div className="w-full max-w-md bg-[#07152d]/40 backdrop-blur-md p-8 rounded-3xl border border-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.03)]">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Register Attendee Pass
              </h1>
              <p className="text-gray-400 text-sm">
                Register to receive your unique event QR pass instantly.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                <span className="font-bold">Error:</span> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter College Email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              {/* College ID */}
              <div className="relative">
                <GraduationCap className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  placeholder="College ID (e.g. ROLL-2026-102)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              {/* Branch */}
              <div className="relative">
                <Building className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="Branch (e.g. CSE / IT / ECE)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Shield className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Passcode"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-gray-600 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl text-base font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processing Registration...
                  </>
                ) : (
                  "Generate Pass"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Ticket Pass Preview & Actions */
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 w-full justify-center">
              <CheckCircle className="w-5 h-5 stroke-[2.5]" /> Pass generated successfully! Check your email.
            </div>

            {/* Glassmorphic digital ticket */}
            <div
              ref={ticketRef}
              id="gatex-ticket-card"
              className="w-full bg-black border-2 border-cyan-500 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between"
              style={{ minHeight: "520px" }}
            >
              {/* Ticket header */}
              <div className="border-b border-gray-800 pb-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 tracking-widest font-black uppercase">OFFICIAL PASS</span>
                  <h2 className="text-base font-black text-white">GATEX TECHFEST</h2>
                </div>
                <div className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  OCT 2026
                </div>
              </div>

              {/* Decorative notches */}
              <div className="absolute left-[-10px] top-[75px] w-5 h-5 bg-black rounded-full border-r border-cyan-500" />
              <div className="absolute right-[-10px] top-[75px] w-5 h-5 bg-black rounded-full border-l border-cyan-500" />

              {/* Pass details */}
              <div className="py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">ATTENDEE</span>
                    <p className="text-sm font-extrabold text-white truncate">{registeredUser.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">COLLEGE ID</span>
                    <p className="text-sm font-bold text-gray-200 truncate">{registeredUser.collegeId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">BRANCH</span>
                    <p className="text-sm font-semibold text-gray-300 truncate">{registeredUser.branch}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">SERIAL NUMBER</span>
                    <p className="text-sm font-mono font-bold text-cyan-400">{registeredUser.serialNumber}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">EMAIL ADDRESS</span>
                  <p className="text-xs text-gray-300 truncate">{registeredUser.email}</p>
                </div>
              </div>

              {/* Centered QR Code */}
              <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-2xl border border-gray-800">
                <img
                  src={registeredUser.qrCode}
                  alt="Entry QR Code"
                  className="w-40 h-40 bg-white p-2.5 rounded-xl shadow-lg"
                />
                <span className="text-[10px] text-gray-400 font-mono mt-2">SCAN FOR VERIFICATION</span>
              </div>

              {/* Status bar */}
              <div className="border-t border-gray-800 pt-4 mt-2 text-center">
                <p className="text-green-400 font-black text-sm tracking-widest uppercase">
                  VALID FOR ENTRY
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={downloadAsImage}
                className="py-3 px-4 rounded-xl bg-gray-900 border border-cyan-500/30 hover:border-cyan-500 hover:bg-black text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" /> Save Image
              </button>
              <button
                onClick={downloadAsPDF}
                className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Save PDF
              </button>
            </div>

            {/* Reset / Register Another Pass */}
            <button
              onClick={() => setRegisteredUser(null)}
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors font-semibold py-2 cursor-pointer"
            >
              Register Another Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
}