import { AlertCircle, AudioWaveform, Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDoesNotMatch, setPasswordDoesNotMatch] = useState(false);
  const navigate = useNavigate();
  const { register, authLoading } = useAuthStore();
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setPasswordDoesNotMatch(true);
      setFormData((prev) => ({ ...prev, password: "", confirm_password: "" }));
      inputRef?.current?.focus();
      return;
    } else {
      setPasswordDoesNotMatch(false);
    }
    await register(formData, () => navigate("/"));
  };

  return (
    <div className="relative w-full h-screen overflow-auto flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-[url('/images/dave-hoefler-ErXq37PfGQU-unsplash.jpg')] bg-cover bg-center animate-pulse-bg" />
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Register Box */}
      <div className="bg-white relative border border-gray-300 backdrop-blur-md shadow-lg rounded-xl px-8 py-4 w-full max-w-sm">
        <h2 className="text-2xl font-bold mt-2 text-gray-800 text-center">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-500">
          Join <span className="font-semibold text-blue-600">StockWave</span>{" "}
          and simplify your inventory workflow.
        </p>

        {/* Floating Icon */}
        <div className="absolute -top-6 right-[calc(50%-24px)] border border-gray-300 rounded-full flex items-center justify-center bg-white w-12 h-12 shadow">
          <AudioWaveform className="w-5 h-5 text-blue-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="w-full px-6 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Jane Doe"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-6 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. janedoe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-6 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-600">*</span>
            </label>
            <div className="relative w-full mt-1">
              <input
                ref={inputRef}
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 cursor-pointer" />
                ) : (
                  <Eye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-600">*</span>
            </label>
            <div className="relative w-full mt-1">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    confirm_password: e.target.value,
                  }));
                }}
                className="w-full px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 cursor-pointer" />
                ) : (
                  <Eye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
            {passwordDoesNotMatch && (
              <span className="flex items-center w-full gap-2 mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Passwords do not match. Please try again.
              </span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white h-10 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            disabled={authLoading}
          >
            {authLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Create Account"
            )}
          </button>

          {/* 🔹 Already have an account? */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline transition-colors"
            >
              Login here
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-xs text-center text-gray-400 mt-3">
          Let’s get you started with StockWave — manage inventory smarter and
          faster.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
