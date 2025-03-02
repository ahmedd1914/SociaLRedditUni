import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DiReact } from 'react-icons/di';
import ChangeThemes from '../components/ChangesThemes';
import toast from 'react-hot-toast';
import { verifyUser } from '../api/ApiCollection';

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = async () => {
    try {
      // If your backend needs an email too, you can prompt for that or store it in state
      const response = await verifyUser({ email: '', verificationCode });
      console.log('Verification successful:', response);
      toast.success('Your account has been verified!');
      // Navigate to login or wherever makes sense after verification
      navigate('/login');
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Invalid verification code. Please try again.');
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
            {/* Verification Code Field */}
            <label className="input input-bordered min-w-full flex items-center gap-2">
              {/* Icon (You can replace with any verification or key icon) */}
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
              onClick={handleVerify}
              className="btn btn-block btn-primary cursor-pointer"
            >
              Verify
            </div>
            <div className="divider text-sm">OR</div>
            <div className="w-full flex justify-center items-center gap-4">
              {/* Example if you have a resend code function or route */}
              <Link to="/resend" className="link link-primary font-semibold text-xs no-underline">
                Resend Verification Code
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
