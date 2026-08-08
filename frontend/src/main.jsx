import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

// Apply the saved theme before first paint to avoid a flash of the
// wrong color scheme.
const savedTheme = localStorage.getItem("theme");

if (
  savedTheme === "dark" ||
  (!savedTheme &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);