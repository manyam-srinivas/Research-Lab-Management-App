import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaFlask,
  FaMoneyBillWave
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide">
          RLMS
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Research Lab
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">

        <SidebarItem
          icon={<FaTachometerAlt />}
          text="Dashboard"
        />

        <SidebarItem
          icon={<FaProjectDiagram />}
          text="Projects"
        />

        <SidebarItem
          icon={<FaUsers />}
          text="Research Groups"
        />

        <SidebarItem
          icon={<FaTasks />}
          text="Tasks"
        />

        <SidebarItem
          icon={<FaFlask />}
          text="Equipment"
        />

        <SidebarItem
          icon={<FaMoneyBillWave />}
          text="Budget"
        />

      </nav>

    </aside>
  );
}

function SidebarItem({ icon, text }) {
  return (
    <button
      className="
        flex
        items-center
        gap-4
        w-full
        px-6
        py-4
        text-left
        hover:bg-slate-800
        transition
        duration-200
      "
    >
      <span className="text-lg">
        {icon}
      </span>

      <span>
        {text}
      </span>
    </button>
  );
}

export default Sidebar;