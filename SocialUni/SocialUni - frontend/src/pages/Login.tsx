import { useState, useEffect } from 'react';
import ChangeThemes from '../components/ChangesThemes';
import { DiReact } from 'react-icons/di';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { API } from '../api/api';
import { DecodedToken } from '../api/interfaces';
import toast from 'react-hot-toast';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check for expired session parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      toast.error('Your session has expired. Please log in again.');
    }
  }, [location]);

  const handleLogin = async () => {
    // Form validation
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { token } = await API.login({ email, password });
      
      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Determine user role
      const role = String(decoded.role).trim();
      const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

      // Show success message
      toast.success('Login successful!');

      // Redirect based on role with a full page reload to ensure fresh state
      const redirectPath = isAdmin ? '/admin/home' : '/home';
      
      // Use window.location for a full page reload instead of React Router navigation
      window.location.href = redirectPath;
      return; // Stop execution after redirect
    } catch (err) {
      console.error('Login failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Login failed! Please check your credentials.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
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
          <div className="flex items-center gap-1 xl:gap-2">
            <DiReact className="text-4xl sm:text-4xl xl:text-6xl 2xl:text-6xl text-primary animate-spin-slow -ml-3" />
            <span className="text-[18px] leading-[1.2] sm:text-lg xl:text-3xl 2xl:text-3xl font-semibold text-base-content dark:text-neutral-200">
              Social Uni
            </span>
          </div>
          <span className="xl:text-xl font-semibold">
            Hello, 👋 Welcome Back!
          </span>
          <div className="w-full flex flex-col items-stretch gap-3">
            <label className="input input-bordered min-w-full flex items-center gap-2">
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
                type="text"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </label>
            {/* Error message display */}
            {errorMessage && (
              <div className="text-error text-sm mt-1">{errorMessage}</div>
            )}
            <div className="flex items-center justify-between">
              <div className="form-control">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="checkbox w-4 h-4 rounded-md checkbox-primary"
                  />
                  <span className="label-text text-xs">
                    Remember me
                  </span>
                </label>
              </div>
              <a
                href="#"
                className="link link-primary font-semibold text-xs no-underline"
              >
                Forgot Password?
              </a>
            </div>
            <div
              onClick={!loading ? handleLogin : undefined}
              className={`btn btn-block btn-primary cursor-pointer ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </div>
            
            <div className="divider text-sm">OR</div>
            <div className="w-full flex justify-center items-center gap-4">
              <button className="btn btn-circle dark:btn-neutral">
                <img
                  className="w-6"
                  src="/icons8-microsoft.svg"
                  alt="microsoft"
                />
              </button>
              <button className="btn btn-circle dark:btn-neutral">
                <img
                  className="w-6"
                  src="/icons8-google.svg"
                  alt="google"
                />
              </button>
              <button className="btn btn-circle dark:btn-neutral">
                <img
                  className="dark:hidden w-6"
                  src="/icons8-apple-black.svg"
                  alt="apple"
                />
                <img
                  className="hidden dark:block w-6"
                  src="/icons8-apple-white.svg"
                  alt="apple"
                />
              </button>
            </div>
            {/* Register button */}
            <div className="w-full flex justify-center items-center">
              <Link to="/register" className="link link-primary font-semibold text-xs">
                Register a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
