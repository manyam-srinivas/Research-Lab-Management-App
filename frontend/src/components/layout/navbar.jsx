import { FaBell, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-8">

      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        <button className="text-2xl text-slate-600 hover:text-blue-600 transition">
          <FaBell />
        </button>

        <div className="flex items-center gap-2">

          <FaUserCircle
            size={36}
            className="text-slate-600"
          />

          <div>

            <p className="font-semibold">
              Admin
            </p>

            <p className="text-sm text-slate-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;