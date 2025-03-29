import { createContext, ReactNode, useState, useEffect, useCallback, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, logoutUser, registerUser, verifyUser } from '../api/ApiCollection';
import { LoginUserDto, RegisterUserDto, VerifyUserDto } from '../api/interfaces';
import { toast } from 'react-hot-toast';

interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginUserDto) => Promise<void>;
  register: (registerData: RegisterUserDto) => Promise<void>;
  logout: () => Promise<void>;
  verify: (verifyData: VerifyUserDto) => Promise<void>;
  checkAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      // Don't redirect if on the home page or auth pages
      const currentPath = location.pathname;
      if (!['/home', '/login', '/register', '/verify'].includes(currentPath)) {
        // Redirect to home since we've made it public
        window.location.href = '/home';
      }
      return;
    }
    
    try {
      const decoded = jwtDecode<AuthUser>(token);
      
      // Check if token is expired (add buffer time of 60 seconds)
      const bufferTime = 60 * 1000; // 60 seconds in milliseconds
      if (decoded.exp * 1000 - bufferTime < Date.now()) {
        // Token expired or about to expire
        localStorage.removeItem('token');
        setUser(null);
        
        // Only navigate to login if not already on auth pages or home
        const currentPath = location.pathname;
        if (!['/login', '/register', '/verify', '/home'].includes(currentPath)) {
          // Use window.location instead of navigate for a full page refresh
          window.location.href = '/login?expired=true';
        }
      } else {
        // Store user data from the token
        setUser(decoded);
        
        // If on the wrong page for role, redirect
        const currentPath = location.pathname;
        const isAdminPath = currentPath.startsWith('/admin');
        const isAdminUser = decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN';
        const isUserRole = decoded.role === 'ROLE_USER' || decoded.role === 'USER';
        
        // Regular user trying to access admin area should be redirected to home
        if (!isAdminUser && isAdminPath) {
          // Use window.location for full page refresh
          window.location.href = '/home';
        }
        
        // Regular user trying to access login/register/verify after successful auth
        if (isUserRole && ['/login', '/register'].includes(currentPath) && decoded.isVerified) {
          // Use window.location for full page refresh
          window.location.href = '/home';
        }
        
        // Admin trying to access login/register after successful auth
        if (isAdminUser && ['/login', '/register'].includes(currentPath)) {
          // Redirect admin to admin home
          window.location.href = '/admin/home';
        }
      }
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('token');
      setUser(null);
      
      // Navigate to login on token error if not already on auth pages
      const currentPath = location.pathname;
      if (!['/login', '/register', '/verify', '/home'].includes(currentPath)) {
        // Use window.location for full page refresh
        window.location.href = '/login?expired=true';
      }
    }
    setIsLoading(false);
  }, [location.pathname]);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Check token validity periodically and on user activity
  useEffect(() => {
    // Check every 30 seconds
    const interval = setInterval(checkAuth, 30000);
    
    // User activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    // Debounce function to limit how often we check auth on activity
    let timeout: number | null = null;
    const handleUserActivity = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = window.setTimeout(checkAuth, 1000);
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Cleanup
    return () => {
      clearInterval(interval);
      if (timeout) {
        clearTimeout(timeout);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [checkAuth]);
  
  const login = async (loginData: LoginUserDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loginUser(loginData);
      localStorage.setItem('token', response.token);
      
      // Decode the token to check if user is admin
      const decoded = jwtDecode<AuthUser>(response.token);
      console.log("AuthContext login - Decoded token:", decoded);
      console.log("AuthContext login - User role:", decoded.role);
      
      // Update user state
      setUser(decoded);
      
      // Redirect based on role - using window.location for full page refresh
      if (decoded.role === 'ROLE_ADMIN' || decoded.role === 'ADMIN') {
        console.log("AuthContext login - Admin user detected, redirecting to admin home");
        window.location.href = '/admin/home';
      } else {
        console.log("AuthContext login - Regular user detected, redirecting to home");
        window.location.href = '/home';
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (registerData: RegisterUserDto): Promise<void> => {
    setIsLoading(true);
    try {
      const token = await registerUser(registerData);
      localStorage.setItem('token', token);
      checkAuth();
      navigate('/verify');
      toast.success('Registration successful! Please verify your account.');
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear credentials regardless of server response
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Clear any other stored auth data to ensure complete logout
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Reset user state
      setUser(null);
      
      // Navigate to login page
      navigate('/login');
      
      // Notify user
      toast.success('Successfully logged out!');
      setIsLoading(false);
    }
  };
  
  const verify = async (verifyData: VerifyUserDto): Promise<void> => {
    setIsLoading(true);
    
    // Check if token exists and is valid before proceeding
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Your session has expired. Please log in again.');
      navigate('/login?expired=true');
      setIsLoading(false);
      return;
    }
    
    // Verify token validity before making the request
    try {
      const decoded = jwtDecode<AuthUser>(token);
      if (decoded.exp * 1000 < Date.now()) {
        // Token is expired
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Your session has expired. Please log in again.');
        navigate('/login?expired=true');
        setIsLoading(false);
        return;
      }
      
      // Proceed with verification since token is valid
      await verifyUser(verifyData);
      
      // Check auth and get user details
      checkAuth();
      
      // Determine where to navigate based on user role
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        const decodedUser = jwtDecode<AuthUser>(currentToken);
        if (decodedUser.role === 'ROLE_ADMIN' || decodedUser.role === 'ADMIN') {
          navigate('/admin/home');
        } else {
          navigate('/home');
        }
      } else {
        navigate('/home');
      }
      
      toast.success('Account successfully verified!');
    } catch (error) {
      console.error('Verification error:', error);
      
      // Handle JWT decode errors or API errors
      if (error instanceof Error && error.name === 'InvalidTokenError') {
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Invalid authentication. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Verification failed. Please try again.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verify,
    checkAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 