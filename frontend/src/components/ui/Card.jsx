export default function Card({
  title,
  children,
  className = "",
  action,
}) {
  return (
    <div
      className={`
        bg-white
        rounded-xl
        shadow-sm
        border
        border-gray-200
        p-6
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
          )}

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}