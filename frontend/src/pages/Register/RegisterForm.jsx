import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { showError, showSuccess } from "../../utils/toast";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

function RegisterForm() {
  const navigate = useNavigate();

  const [verificationLink, setVerificationLink] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const response = await registerUser({
        full_name: fullName,
        email,
        password,
        requested_role: requestedRole,
      });

      showSuccess(response.message);

      // Demo mode: no SMTP configured, so the verification link is
      // returned in the response. Show it so the user can verify.
      if (response.verification_link && !response.email_sent) {
        setVerificationLink(response.verification_link);
        return;
      }

      navigate("/");
    } catch (error) {
      showError(
        error.response?.data?.message ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = () => {
    if (!verificationLink) return;

    window.open(verificationLink, "_blank");
    navigate("/");
  };

  if (verificationLink) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Almost Done!
          </h1>
          <p className="text-slate-500 mt-2">
            Verify your email to complete registration.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-slate-700">
          <p className="mb-2">
            In demo mode, no email is sent. Click below to verify your
            email directly:
          </p>
          <button
            onClick={handleVerifyClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm"
          >
            Verify My Email
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Create Account
        </h1>

        <p className="text-slate-500 mt-2">
          Register to access the Research Lab Management System
        </p>
      </div>

      <form
        onSubmit={handleRegister}
        className="space-y-5"
      >

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Requested Role
          </label>

          <select
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="Research Scholar">Research Scholar</option>
            <option value="Faculty">Faculty</option>
            <option value="Lab Staff">Lab Staff</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign In
          </Link>
        </p>

      </form>

    </Card>
  );
}

export default RegisterForm;