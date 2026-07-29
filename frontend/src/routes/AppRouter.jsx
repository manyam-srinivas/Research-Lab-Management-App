import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PERMISSIONS } from "../utils/rbac";
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
import ActivityLogs from "../pages/activityLogs/ActivityLogs";
import Register from "../pages/Register/Register";
import Users from "../pages/Users/Users";
import ProtectedRoute from "../routes/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />
<Route path="/register" element={<Register />} />

        {/* Protected Routes */}         
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          // Dashboard
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute roles={PERMISSIONS.DASHBOARD_VIEW}>
            <Dashboard />
          </ProtectedRoute> } 
          />

          // projects

          <Route 
          path="/projects" 
          element={<ProtectedRoute roles={PERMISSIONS.PROJECT_VIEW}>
            <Projects />
          </ProtectedRoute> }
          />

          // departments
          <Route
              path="/departments"
              element={
                 <ProtectedRoute roles={PERMISSIONS.DEPARTMENT_VIEW}>
                    <Departments />
                  </ProtectedRoute>
                      }
          />

          // research groups
          <Route
            path="/research-groups"
            element={<ProtectedRoute roles={PERMISSIONS.RESEARCH_GROUP_VIEW}>
              <ResearchGroups />
            </ProtectedRoute> }
          />

          // equipment
          <Route
            path="/equipment"
            element={
                <ProtectedRoute roles={PERMISSIONS.EQUIPMENT_VIEW}>
                  <Equipment />
                </ProtectedRoute>
                    }                 
          />

          // vendors
          <Route
            path="/vendors"
            element={<ProtectedRoute roles={PERMISSIONS.VENDOR_VIEW}>
              <Vendors />
            </ProtectedRoute> }
          />

           // procurement
          <Route
            path="/procurement"
            element={<ProtectedRoute roles={PERMISSIONS.PROCUREMENT_VIEW}>
              <Procurement />
            </ProtectedRoute> }
          />

          // Budget
          <Route
            path="/budgets"
            element={<ProtectedRoute roles={PERMISSIONS.BUDGET_VIEW}>
              <Budget />
            </ProtectedRoute> }
          />

          // Expenses
          <Route
            path="/expenses"
            element={
              <ProtectedRoute roles={PERMISSIONS.EXPENSE_VIEW}>
               <Expenses />
             </ProtectedRoute>
                    }
           />

          // Documents          
          <Route
            path="/documents"
            element={
              <ProtectedRoute roles={PERMISSIONS.DOCUMENT_VIEW}>
                <Documents />
              </ProtectedRoute>
            }
          />
  
          // Project Members
          <Route
            path="/project-members"
            element={
              <ProtectedRoute roles={PERMISSIONS.PROJECT_MEMBER_VIEW}>
                <ProjectMembers />
              </ProtectedRoute>
            }
          />
          
          //Milestones
          <Route
           path="/Milestones"
           element={
             <ProtectedRoute roles={PERMISSIONS.MILESTONE_VIEW}>
              <Milestones />
             </ProtectedRoute>
                    }
          />

          // Equipment Bookings
            <Route
            path="/equipment-bookings"
            element={
             <ProtectedRoute roles={PERMISSIONS.EQUIPMENT_BOOKING_VIEW}>
               <EquipmentBookings />
             </ProtectedRoute>
                    }
            />

          // Notifications
          <Route
            path="/notifications"
             element={
              <ProtectedRoute roles={PERMISSIONS.NOTIFICATION_VIEW}>
               <Notifications />
              </ProtectedRoute>
                     }
          />

          <Route
  path="/users"
  element={
    <ProtectedRoute roles={PERMISSIONS.USER_VIEW}>
      <Users />
    </ProtectedRoute>
  }
/>

       // Activity Logs

          <Route
          path="/activity-logs"
          element={
           <ProtectedRoute roles={PERMISSIONS.ACTIVITY_LOG_VIEW}>
            <ActivityLogs />
           </ProtectedRoute>
                  }  
          />

       // Tasks
           <Route
            path="/Tasks"
            element={
             <ProtectedRoute roles={PERMISSIONS.TASK_VIEW}>
              <Tasks />
            </ProtectedRoute>
              }
           />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;