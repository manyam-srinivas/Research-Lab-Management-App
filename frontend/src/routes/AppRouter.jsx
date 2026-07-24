import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardLayout from "../pages/DashboardLayout";
import Milestones from "../pages/milestones/Milestones";
import Projects from "../pages/Projects/Projects";
import ResearchGroups from "../pages/ResearchGroups/ResearchGroups";
import Departments from "../pages/Departments/Departments";
import Equipment from "../pages/Equipment/Equipment";
import Vendors from "../pages/Vendors/Vendors";
import Procurement from "../pages/Procurement/Procurement";
import Budget from "../pages/Budget/Budget";
import Expenses from "../pages/Expense/Expense";
import Documents from "../pages/Documents/Documents";
import ProjectMembers from "../pages/ProjectMembers/ProjectMembers";
import Tasks from "../pages/tasks/Tasks";
import EquipmentBookings from "../pages/equipmentBookings/EquipmentBookings";
import Notifications from "../pages/notifications/Notifications";

import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/departments" element={<Departments />} />

          <Route
            path="/research-groups"
            element={<ResearchGroups />}
          />

          <Route
            path="/equipment"
            element={<Equipment />}
          />

          <Route
            path="/vendors"
            element={<Vendors />}
          />

          <Route
            path="/procurement"
            element={<Procurement />}
          />

          <Route
            path="/budgets"
            element={<Budget />}
          />

          <Route
            path="/expenses"
            element={<Expenses />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/project-members"
            element={<ProjectMembers />}
          />
          <Route
            path="/milestones"
            element={<Milestones />}
          />
          <Route
            path="/tasks"
            element={<Tasks />}
          />
          <Route
            path="/equipment-bookings"
            element={<EquipmentBookings />}
          />
          <Route
           path="/notifications"
           element={<Notifications />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;