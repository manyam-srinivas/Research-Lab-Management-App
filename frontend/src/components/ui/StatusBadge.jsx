// Color-coded pill badge for statuses and priorities across the app.
// Unknown values fall back to a neutral slate style.

const STYLES = {
  // Project statuses
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Archived: "bg-slate-200 text-slate-600 dark:bg-slate-600/30 dark:text-slate-300",

  // Task / milestone / booking statuses
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "In Progress": "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  Blocked: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Purchased: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",

  // Priorities
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  Medium: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",

  // Equipment statuses
  Available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Booked: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "Under Maintenance": "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  Retired: "bg-slate-200 text-slate-600 dark:bg-slate-600/30 dark:text-slate-300",

  // Notification / account states
  Read: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  Unread: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  ActiveUser: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Inactive: "bg-slate-200 text-slate-600 dark:bg-slate-600/30 dark:text-slate-300",
};

export default function StatusBadge({ status, size = "md" }) {
  const label = status || "—";
  const style = STYLES[label] || STYLES.Draft;

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${style} ${sizes[size]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
