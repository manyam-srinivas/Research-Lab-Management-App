export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          py-2.5
          text-gray-800
          shadow-sm
          outline-none
          transition-all
          duration-200
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-100
          dark:placeholder:text-slate-500
          dark:focus:ring-blue-500/30
          ${error ? "border-red-500 dark:border-red-500" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}