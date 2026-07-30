import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { showError, showSuccess } from "../../utils/toast";
function RegisterForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !requestedRole
    ) {
      showError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      const response = await registerUser({
        full_name: fullName,
        email,
        password,
        requested_role: requestedRole,
      });

      showSuccess(response.message);

      navigate("/");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">

      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Create Account
      </h2>

      <p className="text-slate-500 mb-8">
        Register to access the Research Lab Management System
      </p>

      <form
        onSubmit={handleRegister}
        className="space-y-5"
      >

        <div>
          <label className="block mb-2 font-medium">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Requested Role
          </label>

          <select
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="Research Scholar">Research Scholar</option>
            <option value="Faculty">Faculty</option>
            <option value="Lab Staff">Lab Staff</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>

      </form>
    </div>
  );
}

export default RegisterForm;