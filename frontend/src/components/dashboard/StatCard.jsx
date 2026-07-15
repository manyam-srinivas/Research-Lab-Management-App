function StatCard({ title, value, icon, color }) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-md
        p-6
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default StatCard;