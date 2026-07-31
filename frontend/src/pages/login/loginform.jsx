import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/toast";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      login(data.user, data.token);

      showSuccess("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      showError(
        error.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome Back 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Sign in to continue to your account
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >

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

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Create Account
          </Link>
        </p>

      </form>

    </Card>
  );
}

export default LoginForm;