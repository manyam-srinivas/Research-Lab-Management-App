import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaProjectDiagram,
  FaUsers,
  FaTools,
  FaFlask,
  FaBuilding,
  FaSearch,
} from "react-icons/fa";

import { searchAll } from "../../services/searchService";

const GROUPS = [
  { key: "projects", label: "Projects", icon: <FaProjectDiagram />, to: (r) => "/projects" },
  { key: "users", label: "Users", icon: <FaUsers />, to: () => "/users" },
  { key: "equipment", label: "Equipment", icon: <FaTools />, to: () => "/equipment" },
  { key: "research_groups", label: "Research Groups", icon: <FaFlask />, to: () => "/research-groups" },
  { key: "departments", label: "Departments", icon: <FaBuilding />, to: () => "/departments" },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  // Flatten results into a single navigable list.
  const flat = useMemo(() => {
    if (!results) return [];
    const out = [];
    GROUPS.forEach((g) => {
      (results[g.key] || []).forEach((item) =>
        out.push({ group: g, item })
      );
    });
    return out;
  }, [results]);

  // Debounced search.
  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await searchAll(token, q);
        setResults(res);
        setActive(0);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(id);
  }, [query, open, token]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("rlms:open-search", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("rlms:open-search", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        const target = flat[active];
        if (target) go(target);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const go = (target) => {
    setOpen(false);
    navigate(target.group.to(target.item));
  };

  if (!open) return null;

  const hasResults = flat.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden rlms-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <FaSearch className="text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, people, equipment…"
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <p className="p-6 text-center text-sm text-slate-400">
              Searching…
            </p>
          )}

          {!loading && !hasResults && (
            <p className="p-6 text-center text-sm text-slate-400">
              {query.trim().length < 2
                ? "Type at least 2 characters to search"
                : "No results found"}
            </p>
          )}

          {!loading && hasResults &&
            GROUPS.map((g) => {
              const items = results?.[g.key] || [];
              if (items.length === 0) return null;

              return (
                <div key={g.key} className="mb-2">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {g.label}
                  </p>
                  {items.map((item) => {
                    const idx = flat.findIndex(
                      (f) => f.group.key === g.key && f.item.id === item.id
                    );
                    const isActive = idx === active;
                    const title =
                      item.title || item.full_name || item.name;
                    const subtitle =
                      item.email || item.status || item.role || "";

                    return (
                      <button
                        key={item.id}
                        onClick={() => go({ group: g, item })}
                        onMouseEnter={() => setActive(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`text-base ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {g.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {title}
                          </span>
                          {subtitle && (
                            <span
                              className={`block truncate text-xs ${
                                isActive
                                  ? "text-blue-100"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {subtitle}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
