import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiBars3CenterLeft } from 'react-icons/hi2';
import { DiReact } from 'react-icons/di';
import { HiSearch, HiOutlineBell } from 'react-icons/hi';
import { RxEnterFullScreen, RxExitFullScreen } from 'react-icons/rx';
import { jwtDecode } from 'jwt-decode';
import ChangeThemes from './ChangesThemes';
import toast from 'react-hot-toast';
import { menu } from './menu/data';
import MenuItem from './menu/MenuItem';
import { logoutUser, getCurrentUser } from '../api/ApiCollection'; 
import { DecodedToken, UsersDto, Role } from '../api/interfaces';



const Navbar = () => {
  const [isFullScreen, setIsFullScreen] = React.useState(true);
  const element = document.getElementById('root');
  const [isDrawerOpen, setDrawerOpen] = React.useState(false);
  const [user, setUser] = React.useState<UsersDto | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const defaultAvatar = "https://avatars.githubusercontent.com/u/74099030?v=4";

  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  React.useEffect(() => {
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      element?.requestFullscreen({ navigationUI: 'auto' });
    }
  }, [element, isFullScreen]);

  React.useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Don't redirect to login, just set user to null
        setUser(null);
        return;
      }

      try {
        // Use the getCurrentUser function for a more graceful handling
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If getCurrentUser returns null, create a minimal user from token
          const decoded: DecodedToken = jwtDecode(token);
          const userId = parseInt(decoded.sub, 10);
          
          // Create a minimal user object from the token data
          setUser({
            id: userId,
            username: decoded.sub || "User",
            email: decoded.email || "",
            role: decoded.role as Role || Role.USER,
            fname: "",
            lname: "",
            enabled: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            imgUrl: ""
          });
          
          // Show a toast but don't redirect to login
          toast.error('Limited profile data available');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Authentication error');
        setUser(null);
      }
    };

    loadUserData();
  }, [navigate]);

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token exists, just redirect to login
      navigate('/login');
      return;
    }

    try {
      // First, immediately clear token from localStorage to prevent further requests
      localStorage.removeItem('token');
      
      // Reset all auth-related state
      setUser(null);
      setImageError(false);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Then, try to blacklist the token on server (but we don't wait for it)
      logoutUser().catch(error => {
        console.error('Background logout error:', error);
        // We don't show this error to the user since they're already logged out locally
      });
      
      // Immediately redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      
      // Ensure token is removed even if there's an error
      localStorage.removeItem('token');
      
      // Always redirect to login page
      navigate('/login');
    }
  };

  // Helper function to determine profile path based on current route and user role
  const getProfilePath = () => {
    // Get user role from token instead of just checking URL
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const role = String(decoded?.role || "").trim();
        const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        
        // Return the appropriate path based on role
        return isAdmin ? '/admin/profile' : '/profile';
      } catch (error) {
        console.error('Error decoding token for profile path:', error);
      }
    }
    
    // Fallback to URL-based detection if token check fails
    return location.pathname.includes('/admin') ? '/admin/profile' : '/profile';
  };

  return (
    // navbar screen
    <div className="fixed z-[3] top-0 left-0 right-0 bg-base-100 w-full flex justify-between px-3 xl:px-4 py-3 xl:py-5 gap-4 xl:gap-0">
      {/* container */}
      <div className="flex gap-3 items-center">
        {/* for mobile */}
        <div className="drawer w-auto p-0 mr-1 xl:hidden">
          <input
            id="drawer-navbar-mobile"
            type="checkbox"
            className="drawer-toggle"
            checked={isDrawerOpen}
            onChange={toggleDrawer}
          />
          <div className="p-0 w-auto drawer-content">
            <label
              htmlFor="drawer-navbar-mobile"
              className="p-0 btn btn-ghost drawer-button"
            >
              <HiBars3CenterLeft className="text-2xl" />
            </label>
          </div>
          <div className="drawer-side z-[99]">
            <label
              htmlFor="drawer-navbar-mobile"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <div className="menu p-4 w-auto min-h-full bg-base-200 text-base-content">
              <Link
                to={'/'}
                className="flex items-center gap-1 xl:gap-2 mt-1 mb-5"
              >
                <DiReact className="text-3xl sm:text-4xl xl:text-4xl 2xl:text-6xl text-primary animate-spin-slow" />
                <span className="text-[16px] leading-[1.2] sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-base-content dark:text-neutral-200">
                  React Dashboard
                </span>
              </Link>
              {menu.map((item, index) => (
                <MenuItem
                  onClick={toggleDrawer}
                  key={index}
                  catalog={item.catalog}
                  listItems={item.listItems}
                />
              ))}
            </div>
          </div>
        </div>

        {/* navbar logo */}
        <Link to={'/home'} className="flex items-center gap-1 xl:gap-2">
          <DiReact className="text-3xl sm:text-4xl xl:text-4xl 2xl:text-6xl text-primary animate-spin-slow" />
          <span className="text-[16px] leading-[1.2] sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-base-content dark:text-neutral-200">
            Social Uni
          </span>
        </Link>
      </div>

      {/* navbar items to right */}
      <div className="flex items-center gap-0 xl:gap-1 2xl:gap-2 3xl:gap-5">
        {/* search */}
        <button
          onClick={() =>
            toast('Gaboleh cari!', {
              icon: '😠',
            })
          }
          className="hidden sm:inline-flex btn btn-circle btn-ghost"
        >
          <HiSearch className="text-xl 2xl:text-2xl 3xl:text-3xl" />
        </button>

        {/* fullscreen */}
        <button
          onClick={toggleFullScreen}
          className="hidden xl:inline-flex btn btn-circle btn-ghost"
        >
          {isFullScreen ? (
            <RxEnterFullScreen className="xl:text-xl 2xl:text-2xl 3xl:text-3xl" />
          ) : (
            <RxExitFullScreen className="xl:text-xl 2xl:text-2xl 3xl:text-3xl" />
          )}
        </button>

        {/* theme */}
        <div className="px-0 xl:px-auto btn btn-circle btn-ghost xl:mr-1">
          <ChangeThemes />
        </div>

        {/* Login/Register buttons for non-logged in users */}
        {!user ? (
          <div className="flex gap-2">
            <Link 
              to="/login" 
              className="btn btn-sm btn-primary"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="hidden sm:flex btn btn-sm btn-outline btn-primary"
            >
              Register
            </Link>
          </div>
        ) : (
          <>
            {/* notification - only for logged in users */}
            <button
              onClick={() => {
                const notificationsPath = location.pathname.includes('/admin') 
                  ? '/admin/notifications' 
                  : '/notifications';
                navigate(notificationsPath);
              }}
              className="px-0 xl:px-auto btn btn-circle btn-ghost"
            >
              <HiOutlineBell className="text-xl 2xl:text-2xl 3xl:text-3xl" />
            </button>

            {/* avatar dropdown - only for logged in users */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-9 rounded-full">
                  <img
                    src={(!imageError && user?.imgUrl) || defaultAvatar}
                    alt={user?.username || "User Avatar"}
                    onError={handleImageError}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-40"
              >
                <li>
                  <Link 
                    to={getProfilePath()} 
                    className="justify-between"
                  >
                    My Profile
                  </Link>
                </li>
                <li onClick={handleLogout}>
                  <button className="w-full text-left">Log Out</button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
