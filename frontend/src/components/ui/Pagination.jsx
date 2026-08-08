// Reusable pagination bar with page numbers and a summary line.

function pageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("...");
    out.push(p);
  });

  return out;
}

export default function Pagination({
  page = 1,
  pages = 1,
  total = 0,
  perPage = 10,
  onPageChange,
}) {
  if (pages <= 1 && total === 0) return null;

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const btn =
    "px-3 py-1.5 rounded-lg text-sm font-medium transition " +
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 " +
    "disabled:opacity-40 disabled:pointer-events-none";
  const active =
    "px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{from}–{to}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          className={btn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>

        {pageList(page, pages).map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-slate-400 dark:text-slate-500">
              …
            </span>
          ) : (
            <button
              key={p}
              className={p === page ? active : btn}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className={btn}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
