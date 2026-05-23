export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-cyan-400">GateX</h1>

        <div className="flex gap-4">
          <button className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition">
            Login
          </button>

          <button className="px-5 py-2 rounded-lg border border-cyan-500 hover:bg-cyan-500 transition">
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        
        <h2 className="text-6xl font-extrabold leading-tight">
          Smart QR Based <br />
          Event Entry System
        </h2>

        <p className="mt-6 text-gray-400 max-w-2xl text-lg">
          Secure college fest entry with unique QR verification,
          one-time scan access, live guard validation and anti-fake
          pass protection.
        </p>

        <div className="mt-10 flex gap-6">
          <button className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition text-lg font-semibold">
            Get Started
          </button>

          <button className="px-8 py-4 rounded-xl border border-gray-600 hover:border-cyan-500 transition text-lg">
            Learn More
          </button>
        </div>
      </section>

    </main>
  );
}