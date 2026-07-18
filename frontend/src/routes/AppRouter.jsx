import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Projects from "../pages/Projects/Projects";
import ResearchGroups from "../pages/ResearchGroups/ResearchGroups";
import ProtectedRoute from "./ProtectedRoute";
import Departments from "../pages/Departments/Departments";
import Equipment from "../pages/Equipment/Equipment";
import Vendors from "../pages/Vendors/Vendors";
import Procurement from "../pages/Procurement/Procurement";
import Budget from "../pages/Budget/Budget";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

  <Route path="/" element={<Login />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/projects"
    element={
      <ProtectedRoute>
        <Projects />
      </ProtectedRoute>
    }
  />
  <Route
  path="/research-groups"
  element={<ResearchGroups />}
  />
  <Route
  path="/departments"
  element={<Departments />}
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

</Routes>
    </BrowserRouter>
  );
}

export default AppRouter;