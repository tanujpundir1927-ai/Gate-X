export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center text-white">
      
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">
        
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
          GateX Login
        </h1>

        <form className="flex flex-col gap-5">
          
          <input
            type="email"
            placeholder="Enter Email"
            className="p-4 rounded-xl bg-black border border-gray-700 focus:outline-none focus:border-cyan-500"
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="p-4 rounded-xl bg-black border border-gray-700 focus:outline-none focus:border-cyan-500"
          />

          <button
            className="bg-cyan-500 hover:bg-cyan-600 transition p-4 rounded-xl font-semibold text-lg"
          >
            Login
          </button>

        </form>

      </div>

    </main>
  );
}