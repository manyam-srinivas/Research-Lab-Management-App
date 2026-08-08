import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble } from "react-icons/fa";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../../services/notificationService";

function timeAgo(value) {
  if (!value) return "";

  const then = new Date(value.replace(" ", "T"));
  const diff = Date.now() - then.getTime();
  if (Number.isNaN(diff) || diff < 0) return "";

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value.replace(" ", "T")).toLocaleDateString();
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      const res = await getUnreadCount(token);
      setUnread(res.count || 0);
    } catch {
      /* ignore transient failures */
    }
  }, [token]);

  const openMenu = async () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(token);
      setNotifications(res.notifications || []);
      setUnread(res.notifications.filter((n) => !n.is_read).length);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  // Poll for new notifications every 30 seconds.
  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 30000);
    return () => clearInterval(id);
  }, [refreshCount]);

  // Close on outside click.
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleOpen = async (n) => {
    if (!n.is_read) {
      try {
        await markAsRead(token, n.id);
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    navigate("/notifications");
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead(token);
      setUnread(0);
      setNotifications((list) =>
        list.map((n) => ({ ...n, is_read: true }))
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={openMenu}
        className="relative text-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Notifications"
      >
        <FaBell />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden rlms-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
              >
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-400">
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                No notifications yet
              </p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !n.is_read
                      ? "bg-blue-50/60 dark:bg-blue-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.is_read
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-800 transition"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
