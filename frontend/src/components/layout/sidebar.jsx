import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBuilding,
  FaFlask,
  FaUserCog,
  FaProjectDiagram,
  FaTasks,
  FaFlagCheckered,
  FaUserFriends,
  FaTools,
  FaCalendarAlt,
  FaFileAlt,
  FaTruck,
  FaShoppingCart,
  FaWallet,
  FaMoneyBillWave,
  FaBell,
  FaHistory,
} from "react-icons/fa";

import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";

function SidebarItem({ icon, text, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3.5 mx-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{text}</span>
    </NavLink>
  );
}

function NavGroup({ label, children }) {
  return (
    <div className="mt-5">
      <p className="px-7 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 dark:bg-slate-950 text-white overflow-y-auto flex flex-col border-r border-slate-800 dark:border-slate-800/70">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide">
          RLMS
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Research Lab Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pb-6">
        <NavGroup label="Overview">
          {hasRole(...PERMISSIONS.DASHBOARD_VIEW) && (
            <SidebarItem
              icon={<FaTachometerAlt />}
              text="Dashboard"
              to="/dashboard"
            />
          )}
        </NavGroup>

        <NavGroup label="Organization">
          {hasRole(...PERMISSIONS.DEPARTMENT_VIEW) && (
            <SidebarItem
              icon={<FaBuilding />}
              text="Departments"
              to="/departments"
            />
          )}
          {hasRole(...PERMISSIONS.RESEARCH_GROUP_VIEW) && (
            <SidebarItem
              icon={<FaFlask />}
              text="Research Groups"
              to="/research-groups"
            />
          )}
          {hasRole(...PERMISSIONS.USER_VIEW) && (
            <SidebarItem
              icon={<FaUserCog />}
              text="Users"
              to="/users"
            />
          )}
        </NavGroup>

        <NavGroup label="Projects">
          {hasRole(...PERMISSIONS.PROJECT_VIEW) && (
            <SidebarItem
              icon={<FaProjectDiagram />}
              text="Projects"
              to="/projects"
            />
          )}
          {hasRole(...PERMISSIONS.TASK_VIEW) && (
            <SidebarItem
              icon={<FaTasks />}
              text="Tasks"
              to="/Tasks"
            />
          )}
          {hasRole(...PERMISSIONS.MILESTONE_VIEW) && (
            <SidebarItem
              icon={<FaFlagCheckered />}
              text="Milestones"
              to="/Milestones"
            />
          )}
          {hasRole(...PERMISSIONS.PROJECT_MEMBER_VIEW) && (
            <SidebarItem
              icon={<FaUserFriends />}
              text="Project Members"
              to="/project-members"
            />
          )}
        </NavGroup>

        <NavGroup label="Resources">
          {hasRole(...PERMISSIONS.EQUIPMENT_VIEW) && (
            <SidebarItem
              icon={<FaTools />}
              text="Equipment"
              to="/equipment"
            />
          )}
          {hasRole(...PERMISSIONS.EQUIPMENT_BOOKING_VIEW) && (
            <SidebarItem
              icon={<FaCalendarAlt />}
              text="Equipment Bookings"
              to="/equipment-bookings"
            />
          )}
          {hasRole(...PERMISSIONS.DOCUMENT_VIEW) && (
            <SidebarItem
              icon={<FaFileAlt />}
              text="Documents"
              to="/documents"
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
        </NavGroup>

        <NavGroup label="Finance">
          {hasRole(...PERMISSIONS.BUDGET_VIEW) && (
            <SidebarItem
              icon={<FaWallet />}
              text="Budgets"
              to="/budgets"
            />
          )}
          {hasRole(...PERMISSIONS.EXPENSE_VIEW) && (
            <SidebarItem
              icon={<FaMoneyBillWave />}
              text="Expenses"
              to="/expenses"
            />
          )}
        </NavGroup>

        <NavGroup label="Communication">
          {hasRole(...PERMISSIONS.NOTIFICATION_VIEW) && (
            <SidebarItem
              icon={<FaBell />}
              text="Notifications"
              to="/notifications"
            />
          )}
        </NavGroup>

        <NavGroup label="System">
          {hasRole(...PERMISSIONS.ACTIVITY_LOG_VIEW) && (
            <SidebarItem
              icon={<FaHistory />}
              text="Activity Logs"
              to="/activity-logs"
            />
          )}
        </NavGroup>
      </nav>

      <div className="p-6 pt-2 border-t border-slate-800 text-xs text-slate-500">
        RLMS v1.0
      </div>
    </aside>
  );
}

export default Sidebar;
