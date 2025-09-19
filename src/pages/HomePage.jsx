import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      {/* Logo / Title */}
      <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
        CollabCode
      </h1>

      {/* Short Description */}
      <p className="text-lg md:text-2xl max-w-xl text-center mb-10 opacity-90">
        Write, run, and share code together in real-time.  
        A simple and powerful collaborative coding workspace.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4">
      
        <Link
          to="/login"
          className="bg-blue-900/50 border border-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-800/60 transition"
        >
          Login
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-white/70">
        © {new Date().getFullYear()} CollabCode. All rights reserved.
      </footer>
    </div>
  );
}

