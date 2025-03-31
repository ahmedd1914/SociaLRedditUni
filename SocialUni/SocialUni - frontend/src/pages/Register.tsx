import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChangeThemes from "../components/ChangesThemes";
import { DiReact } from "react-icons/di";
import { jwtDecode } from "jwt-decode";
import { API } from "../api/api";
import { DecodedToken } from "../api/interfaces";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      // Show validation errors
      const errorMessage = Object.values(errors)[0];
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    
    try {
      // Clear any existing token before registration
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      
      // Register the user
      const token = await API.register({ username, email, password });
      
      // Verify token before storing
      if (!token) {
        throw new Error("Registration failed - no token received");
      }
      
      // Store the new token
      localStorage.setItem("token", token);
      
      try {
        // Decode and check token
        const decoded = jwtDecode<DecodedToken>(token);
        
        toast.success("Registration successful!");
        
        // Redirect based on role
        if (decoded.role === "ROLE_ADMIN" || decoded.role === "ADMIN") {
          navigate("/admin/home");
        } else {
          // Redirect to verification page
          navigate("/verify");
        }
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        toast.error("Registration successful, but there was an issue with authentication");
        navigate("/verify");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      
      // Show error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
      
      // Clear any invalid token
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-0 m-0">
      <div className="w-full min-h-screen flex justify-center items-center bg-base-200 relative">
        {/* Theme Toggle */}
        <div className="absolute top-5 right-5 z-[99]">
          <ChangeThemes />
        </div>
        <div className="w-full h-screen xl:h-auto xl:w-[30%] 2xl:w-[25%] 3xl:w-[20%] bg-base-100 rounded-lg shadow-md flex flex-col items-center p-5 pb-7 gap-8 pt-20 xl:pt-7">
          {/* Header / Logo */}
          <div className="flex items-center gap-1 xl:gap-2">
            <DiReact className="text-4xl sm:text-4xl xl:text-6xl 2xl:text-6xl text-primary animate-spin-slow -ml-3" />
            <span className="text-[18px] leading-[1.2] sm:text-lg xl:text-3xl 2xl:text-3xl font-semibold text-base-content dark:text-neutral-200">
              Social Uni
            </span>
          </div>
          <span className="xl:text-xl font-semibold">Create your account</span>

          <div className="w-full flex flex-col items-stretch gap-3">
            {/* Username Field */}
            <label className="input input-bordered min-w-full flex items-center gap-2">
              {/* Example user icon (replace if you have your own) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm9-1c-.001-.212-.229-1-5-1-4.776 0-4.999.784-5 1h10Z" />
                <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
              <input
                type="text"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            {/* Email Field */}
            <label className="input input-bordered min-w-full flex items-center gap-2">
              {/* Same email icon from login snippet */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input
                type="email"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* Password Field */}
            <label className="input input-bordered flex items-center gap-2">
              {/* Lock icon from login snippet */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 1 1-7.9 1.46l-1.96 1.96a.5.5 0 0 1-.35.14H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V8.21a.5.5 0 0 1 .15-.35l3.96-3.96A4 4 0 0 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {/* Confirm Password Field */}
            <label className="input input-bordered flex items-center gap-2">
              {/* Lock icon repeated or a slightly different icon if you prefer */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 1 1-7.9 1.46l-1.96 1.96a.5.5 0 0 1-.35.14H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V8.21a.5.5 0 0 1 .15-.35l3.96-3.96A4 4 0 0 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {/* Link to login */}
            <div className="flex items-center justify-between">
              <Link
                to="/login"
                className="link link-primary font-semibold text-xs no-underline"
              >
                Already have an account? Log In
              </Link>
            </div>

            {/* Submit button */}
            <div
              onClick={!loading ? handleSignup : undefined}
              className={`btn btn-block btn-primary cursor-pointer ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </div>

            <div className="divider text-sm">OR</div>

            {/* Social login buttons */}
            <div className="w-full flex justify-center items-center gap-4">
              <button className="btn btn-circle dark:btn-neutral">
                <img
                  className="w-6"
                  src="/icons8-microsoft.svg"
                  alt="Microsoft"
                />
              </button>
              <button className="btn btn-circle dark:btn-neutral">
                <img className="w-6" src="/icons8-google.svg" alt="Google" />
              </button>
              <button className="btn btn-circle dark:btn-neutral">
                <img
                  className="dark:hidden w-6"
                  src="/icons8-apple-black.svg"
                  alt="Apple"
                />
                <img
                  className="hidden dark:block w-6"
                  src="/icons8-apple-white.svg"
                  alt="Apple"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
