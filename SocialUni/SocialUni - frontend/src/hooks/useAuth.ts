import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/api';
import { LoginUserDto, RegisterUserDto, VerifyUserDto } from '../api/interfaces';

interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  iat: number;
  exp: number;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginUserDto) => Promise<void>;
  register: (registerData: RegisterUserDto) => Promise<void>;
  logout: () => Promise<void>;
  verify: (verifyData: VerifyUserDto) => Promise<void>;
  checkAuth: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const decoded = jwtDecode<AuthUser>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      } else {
        setUser(decoded);
      }
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  const login = async (loginData: LoginUserDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await API.login(loginData);
      localStorage.setItem('token', response.token);
      checkAuth();
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (registerData: RegisterUserDto): Promise<void> => {
    setIsLoading(true);
    try {
      const token = await API.register(registerData);
      localStorage.setItem('token', token);
      checkAuth();
      navigate('/verify');
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
        await API.logout();
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token on error
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const verify = async (verifyData: VerifyUserDto): Promise<void> => {
    setIsLoading(true);
    try {
      await API.verifyAccount(verifyData.verificationCode);
      checkAuth();
      navigate('/home');
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verify,
    checkAuth
  };
} 