import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DiReact } from 'react-icons/di';
import ChangeThemes from '../components/ChangesThemes';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { API } from '../api/api';

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const { verify, user } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract email from token when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error("Authentication required");
      navigate('/login');
      return;
    }
    
    try {
      const decoded = jwtDecode<{ email: string, exp: number }>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        // Token expired
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login?expired=true');
        return;
      }
      
      // Set email from token
      if (decoded.email) {
        setEmail(decoded.email);
      }
    } catch (error) {
      console.error("Token decode error:", error);
      toast.error("Authentication error");
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Redirect if user is already verified
  useEffect(() => {
    if (user && user.isVerified) {
      toast.success("Your account is already verified!");
      if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
        navigate('/admin/home');
      } else {
        navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    
    try {
      await verify({ email, verificationCode });
      toast.success('Your account has been verified!');
      // Navigation will be handled by the verify method in AuthContext
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error(error instanceof Error 
        ? error.message
        : 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email is required to resend verification code');
      return;
    }

    setLoading(true);
    try {
      await API.resendVerificationCode(email);
      toast.success('A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error(error instanceof Error 
        ? error.message 
        : 'Failed to resend verification code. Please try again later.');
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
          <span className="xl:text-xl font-semibold">
            Verify Your Account
          </span>
          <div className="w-full flex flex-col items-stretch gap-3">
            {/* User Email Display */}
            {email && (
              <div className="text-center mb-2">
                <p className="text-sm text-gray-500">Verifying account for:</p>
                <p className="font-medium">{email}</p>
              </div>
            )}
            
            {/* Verification Code Field */}
            <label className="input input-bordered min-w-full flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path d="M3.654 1.328a.5.5 0 0 1 .342-.328l8-2a.5.5 0 0 1 .632.316l2 8a.5.5 0 0 1-.316.632l-8 2a.5.5 0 0 1-.632-.316l-2-8a.5.5 0 0 1 .316-.632zM6.586 2.586a2 2 0 1 1 2.828 2.828l-.707.707L5.88 3.293l.707-.707z"/>
              </svg>
              <input
                type="text"
                className="grow input outline-none focus:outline-none border-none h-auto pl-1 pr-0"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </label>
            
            {/* Verify Button */}
            <div
              onClick={!loading ? handleVerify : undefined}
              className={`btn btn-block btn-primary cursor-pointer ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </div>
            
            <div className="divider text-sm">OR</div>
            
            <div className="w-full flex justify-center items-center gap-4">
              {/* Resend Code */}
              <button 
                onClick={handleResendCode}
                className="link link-primary font-semibold text-xs no-underline"
              >
                Resend Verification Code
              </button>
            </div>
            
            {/* Back to Login */}
            <div className="w-full flex justify-center items-center mt-3">
              <Link 
                to="/login" 
                className="link font-semibold text-xs no-underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
