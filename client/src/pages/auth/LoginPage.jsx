import { AudioWaveform, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user_id, login, authLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData, () => navigate("/"));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-[url('/images/dave-hoefler-ErXq37PfGQU-unsplash.jpg')] bg-cover bg-center animate-pulse-bg" />
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Login Box */}
      <div className="bg-white relative border border-gray-300 backdrop-blur-md shadow-lg rounded-xl p-8 w-full max-w-sm space-y-5">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Login</h2>
        <p className="text-center text-sm text-gray-500">
          Welcome back to{" "}
          <span className="font-semibold text-blue-600">StockWave</span> — your
          smart inventory assistant.
        </p>

        {/* Floating Icon */}
        <div className="absolute -top-6 right-[calc(50%-24px)] border border-gray-300 rounded-full flex items-center justify-center bg-white w-12 h-12 shadow">
          <AudioWaveform className="w-5 h-5 text-blue-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <label htmlFor="">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }));
            }}
            className="w-full px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="">
            Password <span className="text-red-600">*</span>
          </label>
          <div className="relative w-full">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-6 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
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

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-blue-600" />
              Remember me
            </label>
            <button className="text-blue-600 cursor-pointer hover:underline transition-all duration-150">
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
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
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-xs text-center text-gray-400 mt-3">
          Thank you for choosing StockWave. Let’s manage your inventory smarter,
          faster, and easier.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
