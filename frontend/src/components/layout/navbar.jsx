import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";

import { getProfile } from "../../services/authService";
import InstallAppButton from "./InstallAppButton";
import NotificationBell from "./NotificationBell";

const TITLES = {
  "/dashboard": "Dashboard",
  "/departments": "Departments",
  "/research-groups": "Research Groups",
  "/projects": "Projects",
  "/Tasks": "Tasks",
  "/Milestones": "Milestones",
  "/project-members": "Project Members",
  "/equipment": "Equipment",
  "/equipment-bookings": "Equipment Bookings",
  "/vendors": "Vendors",
  "/procurement": "Procurement",
  "/budgets": "Budgets",
  "/expenses": "Expenses",
  "/documents": "Documents",
  "/notifications": "Notifications",
  "/users": "Users",
  "/activity-logs": "Activity Logs",
  "/profile": "My Profile",
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({ name: "", role: "" });
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getProfile(token);
        setUser(response.user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("rlms:open-search"));
  };

  const pageTitle =
    TITLES[location.pathname] ||
    (location.pathname.startsWith("/projects")
      ? "Projects"
      : "Dashboard");

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
      {/* Left */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {pageTitle}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search trigger */}
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Search (Ctrl+K)"
        >
          <FaSearch />
          <span className="hidden lg:inline">Search…</span>
          <kbd className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={openSearch}
          className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Search"
        >
          <FaSearch />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        <NotificationBell />

        {/* Profile menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FaUserCircle
              size={32}
              className="text-slate-500 dark:text-slate-400"
            />
            <div className="hidden sm:block text-left">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {user.role || ""}
              </p>
            </div>
            <FaChevronDown
              size={10}
              className="hidden sm:block text-slate-400"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden rlms-fade-in">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <FaCog className="text-slate-400" />
                Profile & Settings
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition"
              >
                <FaSignOutAlt />
                Sign out
              </button>
            </div>
          )}
        </div>

        <InstallAppButton />
      </div>
    </header>
  );
}

export default Navbar;
