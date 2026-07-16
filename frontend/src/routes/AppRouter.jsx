import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Projects from "../pages/Projects/Projects";

import ProtectedRoute from "./ProtectedRoute";

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

</Routes>
    </BrowserRouter>
  );
}

export default AppRouter;