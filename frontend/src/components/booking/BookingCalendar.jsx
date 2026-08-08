import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  Rejected: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  Completed: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function BookingCalendar({ bookings, equipment }) {
  const today = new Date();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const [equipmentFilter, setEquipmentFilter] = useState("");

  const equipmentName = (id) =>
    equipment.find((e) => e.id === id)?.name || `#${id}`;

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startPad = first.getDay();
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0
    ).getDate();

    const list = [];
    for (let i = 0; i < startPad; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++)
      list.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [cursor]);

  const filtered = bookings.filter(
    (b) =>
      !equipmentFilter ||
      String(b.equipment_id) === String(equipmentFilter)
  );

  const bookingsByDay = useMemo(() => {
    const map = {};
    filtered.forEach((b) => {
      if (!b.start_time) return;
      const d = new Date(b.start_time.replace(" ", "T"));
      if (Number.isNaN(d.getTime())) return;
      const key = d.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [filtered]);

  const prevMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const fmtTime = (v) => {
    if (!v) return "";
    const d = new Date(v.replace(" ", "T"));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:text-blue-600 hover:border-blue-400 dark:hover:text-blue-400 transition">
            <FaChevronLeft />
          </button>
          <h3 className="w-40 text-center font-semibold text-slate-800 dark:text-slate-100">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:text-blue-600 hover:border-blue-400 dark:hover:text-blue-400 transition">
            <FaChevronRight />
          </button>
          <button onClick={() => setCursor(startOfMonth(today))} className="ml-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Today
          </button>
        </div>

        <select
          value={equipmentFilter}
          onChange={(e) => setEquipmentFilter(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All equipment</option>
          {equipment.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full border ${cls}`} />
            {status}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((d) => (
          <div key={d} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {d}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-20" />;
          }

          const key = date.toDateString();
          const dayBookings = bookingsByDay[key] || [];
          const isToday = sameDay(date, today);

          return (
            <div
              key={key}
              className={`min-h-20 rounded-xl border p-1.5 transition ${
                isToday
                  ? "border-blue-400 bg-blue-50/60 dark:border-blue-500/50 dark:bg-blue-500/10"
                  : "border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                {date.getDate()}
              </span>

              <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    title={`${equipmentName(b.equipment_id)} · ${fmtTime(b.start_time)}–${fmtTime(b.end_time)} · ${b.status}`}
                    className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[b.status] || STATUS_COLORS.Pending}`}
                  >
                    {equipmentName(b.equipment_id)} {fmtTime(b.start_time)}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <p className="px-1 text-[10px] text-slate-400">
                    +{dayBookings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
