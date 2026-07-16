import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

import { getProfile } from "../../services/authService";

function Navbar() {

  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    role: "",
  });

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await getProfile(token);

        setUser(response.user);

      } catch (error) {

        console.error(error);

      }

    };

    fetchProfile();

  }, []);

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };

  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-8">

      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-6">

        <button className="text-2xl text-slate-600 hover:text-blue-600 transition">
          <FaBell />
        </button>

        <div className="flex items-center gap-3">

          <FaUserCircle
            size={36}
            className="text-slate-600"
          />

          <div>

            <p className="font-semibold">
              {user.name}
            </p>

            <p className="text-sm text-slate-500">
              {user.role}
            </p>

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 transition"
        >
          <FaSignOutAlt size={22} />
        </button>

      </div>

    </header>
  );
}

export default Navbar;