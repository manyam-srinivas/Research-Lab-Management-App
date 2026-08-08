import { useNavigate } from "react-router-dom";
import {
  FaProjectDiagram,
  FaTasks,
  FaFlagCheckered,
  FaCalendarAlt,
  FaBell,
} from "react-icons/fa";

import StatusBadge from "../ui/StatusBadge";

const TYPE_META = {
  Project: { icon: <FaProjectDiagram />, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  Task: { icon: <FaTasks />, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  Milestone: { icon: <FaFlagCheckered />, color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10" },
  "Equipment Booking": { icon: <FaCalendarAlt />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
  Notification: { icon: <FaBell />, color: "text-sky-500 bg-sky-50 dark:bg-sky-500/10" },
};

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

export default function RecentActivity({ items, loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
          Recent Activity
        </h3>
        <button
          onClick={() => navigate("/activity-logs")}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No recent activity yet
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => {
            const meta = TYPE_META[item.type] || TYPE_META.Project;

            return (
              <li key={`${item.type}-${item.id}-${i}`}>
                <button
                  onClick={() => navigate(item.link || "/dashboard")}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${meta.color}`}
                  >
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                      {item.subtitle || item.type} · {timeAgo(item.created_at)}
                    </span>
                  </span>
                  {item.status && <StatusBadge status={item.status} size="sm" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
