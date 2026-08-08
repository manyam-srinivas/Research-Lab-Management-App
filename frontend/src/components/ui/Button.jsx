const variants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100",
  success:
    "bg-green-600 hover:bg-green-700 text-white",
  danger:
    "bg-red-600 hover:bg-red-700 text-white",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`
        px-4
        py-2
        rounded-xl
        font-medium
        transition-all
        duration-200
        shadow-sm
        hover:shadow-md
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}