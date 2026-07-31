function StatCard({ title, value, icon, color }) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        bg-white
        border
        border-gray-200
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Decorative Background */}
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {value}
          </h2>

        </div>

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-2xl
            text-white
            shadow-md
            transition-transform
            duration-300
            group-hover:scale-110
          "
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default StatCard;