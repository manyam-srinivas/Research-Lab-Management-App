import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../../services/authService";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setMessage(response.message);
        setStatus("success");
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          "Verification failed."
        );
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "loading" ? (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-500">Verifying...</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Email Verified
            </h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
