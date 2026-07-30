import { NavLink } from "react-router-dom";
import { FaTools } from "react-icons/fa";
import { FaTruck } from "react-icons/fa"
import { FaShoppingCart } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";

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
    <aside className="w-64 h-screen bg-slate-900 text-white overflow-y-auto">

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

        {hasRole(...PERMISSIONS.DASHBOARD_VIEW) && (
  <SidebarItem
    icon={<FaTachometerAlt />}
    text="Dashboard"
    to="/dashboard"
  />
)}

        {hasRole(...PERMISSIONS.DEPARTMENT_MANAGE) && (
  <SidebarItem
    icon={<FaBuilding />}
    text="Departments"
    to="/departments"
  />
)}
{hasRole(...PERMISSIONS.PROJECT_VIEW) && (
  <SidebarItem
    icon={<FaProjectDiagram />}
    text="Projects"
    to="/projects"
  />
)}

{hasRole(...PERMISSIONS.RESEARCH_GROUP_VIEW) && (
  <SidebarItem
    icon={<FaUsers />}
    text="Research Groups"
    to="/research-groups"
  />
)}

{hasRole(...PERMISSIONS.TASK_VIEW) && (
  <SidebarItem
    icon={<FaTasks />}
    text="Tasks"
    to="/tasks"
  />
)}
{hasRole(...PERMISSIONS.BUDGET_VIEW) && (
  <SidebarItem
    icon={<FaWallet />}
    text="Budgets"
    to="/budgets"
  />
)}
{hasRole(...PERMISSIONS.EQUIPMENT_VIEW) && (
  <SidebarItem
    icon={<FaTools />}
    text="Equipment"
    to="/equipment"
  />
)}
{hasRole(...PERMISSIONS.VENDOR_MANAGE) && (
  <SidebarItem
    icon={<FaTruck />}
    text="Vendors"
    to="/vendors"
  />
)}
{hasRole(...PERMISSIONS.PROCUREMENT_VIEW) && (
  <SidebarItem
    icon={<FaShoppingCart />}
    text="Procurement"
    to="/procurement"
  />
)}
{hasRole(...PERMISSIONS.EXPENSE_VIEW) && (
  <SidebarItem
    icon={<FaMoneyBillWave />}
    text="Expenses"
    to="/expenses"
  />
)}
{hasRole(...PERMISSIONS.DOCUMENT_VIEW) && (
  <SidebarItem
    icon={<FaFileAlt />}
    text="Documents"
    to="/documents"
  />
)}
{hasRole(...PERMISSIONS.PROJECT_MEMBER_VIEW) && (
  <SidebarItem
    icon={<FaUsers />}
    text="Project Members"
    to="/project-members"
  />
)}
{hasRole(...PERMISSIONS.MILESTONE_VIEW) && (
  <SidebarItem
    icon={<FaFlag />}
    text="Milestones"
    to="/milestones"
  />
)}
{hasRole(...PERMISSIONS.EQUIPMENT_BOOKING_VIEW) && (
  <SidebarItem
    icon={<FaTasks />}
    text="Equipment Bookings"
    to="/equipment-bookings"
  />
)}
{hasRole(...PERMISSIONS.NOTIFICATION_VIEW) && (
  <SidebarItem
    icon={<FaFlag />}
    text="Notifications"
    to="/notifications"
  />
)}
{hasRole("Admin") && (
  <SidebarItem
    icon={<FaUsers />}
    text="Users"
    to="/users"
  />
)}
{hasRole(...PERMISSIONS.USER_VIEW) && (
  <SidebarItem
    icon={<FaFlag />}
    text="Activity Logs"
    to="/activity-logs"
  />
)}
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