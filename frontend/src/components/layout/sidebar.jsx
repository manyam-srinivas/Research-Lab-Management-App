import { NavLink } from "react-router-dom";
import { FaTools } from "react-icons/fa";
import { FaTruck } from "react-icons/fa"
import { FaShoppingCart } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaFlask,
  FaMoneyBillWave,
  FaBuilding
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
  to="/dashboard"
/>
<SidebarItem
  icon={<FaBuilding />}
  text="Departments"
  to="/departments"
/>
<SidebarItem
  icon={<FaProjectDiagram />}
  text="Projects"
  to="/projects"
/>

<SidebarItem
  icon={<FaUsers />}
  text="Research Groups"
  to="/research-groups"
/>

<SidebarItem
  icon={<FaTasks />}
  text="Tasks"
  to="#"
/>


<SidebarItem
  icon={<FaWallet />}
  text="Budgets"
  to="/budgets"
/>
<SidebarItem
  icon={<FaTools />}
  text="Equipment"
  to="/equipment"
/>
<SidebarItem
    icon={<FaTruck />}
    text="Vendors"
    to="/vendors"
/>
<SidebarItem
    icon={<FaShoppingCart />}
    text="Procurement"
    to="/procurement"
/>


      </nav>

    </aside>
  );
}

function SidebarItem({ icon, text, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 w-full px-6 py-4 transition duration-200 ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-white hover:bg-slate-800"
        }`
      }
    >
      <span className="text-lg">{icon}</span>

      <span>{text}</span>
    </NavLink>
  );
}

export default Sidebar;