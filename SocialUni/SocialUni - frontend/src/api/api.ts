import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  // Auth
  RegisterUserDto,
  LoginUserDto,
  LoginResponse,
  VerifyUserDto,
  // Comments
  UpdateCommentDto,
  CommentResponseDto,
  CreateCommentDto,
  // Events
  UpdateEventDto,
  EventResponseDto,
  CreateEventDto,
  // Groups
  GroupResponseDto,
  CreateGroupDto,
  // Notifications
  NotificationResponseDto,
  NotificationStatsDto,
  NotificationType,
  // Posts
  PostResponseDto,
  UpdatePostDto,
  CreatePostDto,
  // Reactions
  ReactionResponseDto,
  ReactionStatsDto,
  // Users
  UsersDto,
  Visibility,
  GenericDeleteResponse,
  UpdateUserDto,
  CreateUserDto,
  UserResponseDto,
  // Other
  ChatMessageDto,
  MessageStatsDto,
  PendingJoinRequestDto,
  PostMetricsDto,
  DecodedToken,
  MessageResponseDto,
  UserActivity,
  AdminStats,
  ReactionStats,
  ReactionType,
  RequestDto,
  GroupMessageStats,
} from "./interfaces";
import { NotificationFilterParams } from '../types/notification';

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Add a global flag to control logging
const ENABLE_LOGGING = import.meta.env.DEV && !import.meta.env.VITE_DISABLE_LOGGING;

// Define type for AxiosError
interface AxiosError {
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
  message: string;
  config?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  };
}

// Define type for AxiosResponse
interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config?: any;
}

// Define isAxiosError as a utility function that can be used throughout this file
function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && typeof error === 'object' && 'response' in error && 'message' in error;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  paramsSerializer: function(params: Record<string, any>) {
    const cleanParams: Record<string, string | number | boolean | Array<string | number | boolean>> = {};
    
    for (const key in params) {
      const value = params[key];
      
      if (value === null || value === undefined) continue;
      
      if (Array.isArray(value)) {
        const primitiveArray = value.filter(item => 
          typeof item === 'string' || 
          typeof item === 'number' || 
          typeof item === 'boolean'
        );
        if (primitiveArray.length > 0) {
          cleanParams[key] = primitiveArray;
        }
        continue;
      }
      
      if (
        typeof value === 'string' || 
        typeof value === 'number' || 
        typeof value === 'boolean'
      ) {
        cleanParams[key] = value;
      }
    }
    
    return new URLSearchParams(cleanParams as Record<string, string>).toString();
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a public axios instance without authentication
const publicApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false,
  paramsSerializer: function(params: Record<string, any>) {
    const cleanParams: Record<string, string | number | boolean | Array<string | number | boolean>> = {};
    
    for (const key in params) {
      const value = params[key];
      
      if (value === null || value === undefined) continue;
      
      if (Array.isArray(value)) {
        const primitiveArray = value.filter(item => 
          typeof item === 'string' || 
          typeof item === 'number' || 
          typeof item === 'boolean'
        );
        if (primitiveArray.length > 0) {
          cleanParams[key] = primitiveArray;
        }
        continue;
      }
      
      if (
        typeof value === 'string' || 
        typeof value === 'number' || 
        typeof value === 'boolean'
      ) {
        cleanParams[key] = value;
      }
    }
    
    return new URLSearchParams(cleanParams as Record<string, string>).toString();
  }
});

// Custom error handler
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API errors consistently
const handleApiError = (error: unknown): never => {
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    const data = error.response?.data;
    
    if (status === 401) {
      localStorage.removeItem("token");
    }
    
    // Only log errors that aren't from reaction endpoints
    const url = error.config?.url || '';
    if (ENABLE_LOGGING && !url.includes('/reactions/')) {
      console.error('API Error:', {
        status,
        message,
        url,
        data
      });
    }
    
    throw new ApiError(message, status, data);
  }
  
  throw error instanceof Error 
    ? error 
    : new Error("Unknown error occurred");
};

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (isAxiosError(error)) {
      const url = error.config?.url || '';
      
      // Completely suppress all errors for reaction endpoints
      if (url.includes('/reactions/')) {
    return Promise.reject(error);
  }
      
      // Only log errors that aren't 403 or 404
      if (ENABLE_LOGGING && error.response?.status !== 403 && error.response?.status !== 404) {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      
      const responseText = String(error.response?.data || '');
      const isJwtExpired = responseText.includes("JWT expired") || 
                          error.response?.status === 401;
      
      if (isJwtExpired) {
        localStorage.removeItem("token");
        
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
        
        return Promise.reject(new Error("Session expired. Please log in again."));
      }
      
      // Handle 403 errors globally
      if (error.response?.status === 403) {
        // Don't show toast for every 403 error to avoid spamming the user
        // Only show for specific endpoints that require user action
        if (url.includes('/admin/')) {
          // For admin endpoints, redirect to home
          if (url.includes('/admin/') && window.location.pathname.startsWith('/admin')) {
            window.location.href = '/home';
          }
        }
      }
      
      if (error.response?.status === 405) {
        if (ENABLE_LOGGING) {
        console.error("API Method Not Supported:", error.config?.method, error.config?.url);
        }
        return Promise.reject(new Error("An operation failed due to unsupported method. Please try again later."));
      }
      
      if (!navigator.onLine) {
        return Promise.reject(new ApiError("You are offline. Please check your internet connection.", 0));
      }
    }
    
    return Promise.reject(error);
  }
);

// Add toast to window type
declare global {
  interface Window {
    toast?: {
      error: (message: string) => void;
      success: (message: string) => void;
    }
  }
}

// API class with static methods for all API calls
export class API {
  private static instance = api;

  /* ===================== AUTH API ===================== */
  static async register(registerUserDto: RegisterUserDto): Promise<string> {
    try {
      const { data } = await this.instance.post<string>("/auth/signup", registerUserDto);
      localStorage.setItem("token", data);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async login(loginUserDto: LoginUserDto): Promise<{ token: string; expiresIn: number }> {
    try {
      const response = await this.instance.post<LoginResponse>("/auth/login", loginUserDto);
      const data = response.data;

      if (!data || !data.token) {
        throw new Error("Invalid response from login API");
      }

      localStorage.setItem("token", data.token);
      return {
        token: data.token,
        expiresIn: data.expiresIn
      };
    } catch (error) {
      console.error("Login failed:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access forbidden. Please check your credentials.");
        } else if (error.response?.status === 401) {
          throw new Error("Invalid username or password");
        }
      }
      throw error;
    }
  }

  static async logout(): Promise<string> {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found for logout, user already logged out");
      return "Already logged out";
    }

    try {
      const response = await this.instance.post<string>("/auth/logout");
      return response.data;
    } catch (error) {
      console.error("Logout API error:", error);
      return "Logged out locally";
    }
  }

  static async verifyUser(verifyUserDto: VerifyUserDto): Promise<any> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in first.");
      }

      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          throw new Error("Your session has expired. Please log in again.");
        }
      } catch (decodeError) {
        localStorage.removeItem("token");
        throw new Error("Invalid authentication token. Please log in again.");
      }

      const { data } = await this.instance.post("/auth/verify", verifyUserDto);
      return data;
    } catch (error) {
      if (!isAxiosError(error)) {
        throw error;
      }
      
      if (error.response?.status === 400) {
        throw new Error("Invalid verification code. Please try again.");
      } else if (error.response?.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Your session has expired. Please log in again.");
      }
      throw new Error("Verification failed. Please try again later.");
    }
  }

  static async verifyAccount(verificationCode: string): Promise<any> {
    try {
      const { data } = await this.instance.post("/auth/verify", { verificationCode });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async resendVerificationCode(email: string): Promise<GenericDeleteResponse> {
    try {
      if (!email || !email.trim()) {
        throw new Error("Email is required to resend verification code");
      }
      
      const { data } = await this.instance.post<GenericDeleteResponse>(
        `/auth/resend?email=${encodeURIComponent(email.trim())}`
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("User not found. Please check your email or register.");
        } else if (error.response?.status === 400) {
          throw new Error("Invalid email address.");
        } else if (error.response?.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        }
      }
      throw new Error("Failed to resend verification code. Please try again later.");
    }
  }

  /* =================== ADMIN COMMENT API =================== */
  static async fetchAllComments(): Promise<CommentResponseDto[]> {
    try {
      const { data } = await this.instance.get<CommentResponseDto[]>("/admin/comments");
      return data.map(comment => ({
        ...comment,
        postId: comment.postId || 0,
        parentCommentId: comment.parentCommentId || null,
        reactionCount: comment.reactionCount || 0,
        reactionTypes: comment.reactionTypes || {},
        replies: comment.replies || []
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return handleApiError(error);
    }
  }

  static async fetchActiveComments(): Promise<CommentResponseDto[]> {
    try {
      const { data } = await this.instance.get<CommentResponseDto[]>("/admin/comments/active_comments");
      return data.map(comment => ({
        ...comment,
        postId: comment.postId || 0,
        parentCommentId: comment.parentCommentId || null,
        reactionCount: comment.reactionCount || 0,
        reactionTypes: comment.reactionTypes || {},
        replies: comment.replies || []
      }));
    } catch (error) {
      console.error('Error fetching active comments:', error);
      return handleApiError(error);
    }
  }

  static async fetchCommentById(commentId: number): Promise<CommentResponseDto> {
    try {
      const { data } = await this.instance.get<CommentResponseDto>(`/admin/comments/${commentId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createComment(commentDto: CreateCommentDto): Promise<CommentResponseDto> {
    try {
      const { data } = await this.instance.post<CommentResponseDto>("/comments/create", commentDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateComment(commentId: number, updateCommentDto: UpdateCommentDto): Promise<CommentResponseDto> {
    try {
      const { data } = await this.instance.put<CommentResponseDto>(`/admin/comments/${commentId}`, updateCommentDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteComment(commentId: number): Promise<GenericDeleteResponse> {
    try {
      const { data } = await this.instance.delete<GenericDeleteResponse>(`/admin/comments/${commentId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async permanentlyDeleteComment(commentId: number): Promise<GenericDeleteResponse> {
    try {
      const { data } = await this.instance.delete<GenericDeleteResponse>(`/admin/comments/${commentId}/permanent`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /* =================== ADMIN MESSAGE API =================== */
  static async fetchAllMessages(): Promise<ChatMessageDto[]> {
    try {
      const { data } = await this.instance.get<ChatMessageDto[]>('/admin/messages');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchGroupChatMessages(groupId: number): Promise<ChatMessageDto[]> {
    try {
      const { data } = await this.instance.get<ChatMessageDto[]>(`/admin/group-messages/group/${groupId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteMessageAsAdmin(messageId: number, adminId: number): Promise<GenericDeleteResponse> {
    try {
      const { data } = await this.instance.delete<GenericDeleteResponse>(
        `/admin/group-messages/${messageId}?adminId=${adminId}`
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getGroupMessageStats(groupId: number): Promise<MessageStatsDto> {
    try {
      const { data } = await this.instance.get<MessageStatsDto>(`/admin/group-messages/group/${groupId}/stats`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /* =================== USER API =================== */
  static async getCurrentUser(): Promise<UsersDto | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userId = parseInt(decoded.sub, 10);
        
        try {
          const user = await this.fetchUserById(userId);
          if (user) {
            return user;
          }
          
          // If user is null, fall back to token data
          console.error("Error fetching user data, falling back to token data");
          
          return {
            id: userId,
            username: decoded.sub || "User",
            email: decoded.email || "",
            role: decoded.role as any || "USER",
            fname: "",
            lname: "",
            enabled: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            imgUrl: ""
          };
        } catch (error) {
          console.error("Error fetching user data, falling back to token data:", error);
          
          if (isAxiosError(error) && (error.response?.status === 405 || error.response?.status === 403)) {
            return {
              id: userId,
              username: decoded.sub || "User",
              email: decoded.email || "",
              role: decoded.role as any || "USER",
              fname: "",
              lname: "",
              enabled: true,
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              imgUrl: ""
            };
          }
          
          throw error;
        }
      } catch (error) {
        console.error("Error decoding token or fetching current user:", error);
        return null;
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  }

  static async fetchUserById(userId: number): Promise<UsersDto | null> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchUserById:", error);
        }
      }
      
      const endpoint = isAdmin ? `/admin/users/${userId}` : `/users/${userId}`;
      const { data } = await this.instance.get<UsersDto>(endpoint);
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        // For 403 and 404, return null instead of throwing
        if (error.response?.status === 403 || error.response?.status === 404) {
          return null;
        }
      }
      return handleApiError(error);
    }
  }

  /* =================== GROUP API =================== */
  static async fetchAllGroups(): Promise<GroupResponseDto[]> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchAllGroups:", error);
        }
      }
      
      const endpoint = isAdmin ? "/admin/groups" : "/groups/public";
      const { data } = await this.instance.get<GroupResponseDto[]>(endpoint);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchGroupById(groupId: number): Promise<GroupResponseDto> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchGroupById:", error);
        }
      }
      
      const endpoint = isAdmin ? `/admin/groups/${groupId}` : `/groups/${groupId}`;
      const { data } = await this.instance.get<GroupResponseDto>(endpoint);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createGroup(groupDto: CreateGroupDto): Promise<GroupResponseDto> {
    try {
      const { data } = await this.instance.post<GroupResponseDto>("/groups/create", groupDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteGroup(groupId: number): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const decoded = jwtDecode<DecodedToken>(token);
    const userId = parseInt(decoded.sub, 10);

    try {
      await this.instance.delete(`/admin/groups/${groupId}/user/${userId}`);
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async changeGroupVisibility(groupId: number, visibility: Visibility): Promise<GroupResponseDto> {
    try {
      const { data } = await this.instance.put<GroupResponseDto>(`/admin/groups/${groupId}/visibility?visibility=${visibility}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async transferGroupOwnership(groupId: number, newOwnerId: number): Promise<GroupResponseDto> {
    try {
      const { data } = await this.instance.put<GroupResponseDto>(`/admin/groups/${groupId}/transfer/${newOwnerId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async getPendingJoinRequests(groupId: number, adminId: number): Promise<PendingJoinRequestDto[]> {
    try {
      const { data } = await this.instance.get<PendingJoinRequestDto[]>(`/admin/groups/${groupId}/join-requests?adminId=${adminId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async approveJoinRequest(groupId: number, userId: number, adminId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.post<{ success: boolean; message: string }>(`/admin/groups/${groupId}/approve/${userId}?adminId=${adminId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async rejectJoinRequest(groupId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(`/admin/groups/${groupId}/reject/${userId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchGroupMembers(groupId: number): Promise<UsersDto[]> {
    try {
      const { data } = await this.instance.get<UsersDto[]>(`/admin/groups/${groupId}/members`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async removeUserFromGroup(groupId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(`/admin/groups/${groupId}/remove/${userId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async addUserToGroup(groupId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.post<{ success: boolean; message: string }>(`/admin/groups/${groupId}/add/${userId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateGroup(groupId: number, updatedGroupDto: CreateGroupDto): Promise<GroupResponseDto> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const decoded = jwtDecode<DecodedToken>(token);
      const userId = parseInt(decoded.sub, 10);

      const { data } = await this.instance.put<GroupResponseDto>(`/admin/${groupId}?userId=${userId}`, updatedGroupDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /* =================== POST API =================== */
  static fetchAllPosts = async (): Promise<PostResponseDto[]> => {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchAllPosts:", error);
        }
      }
      
      // If authenticated, use the appropriate endpoint
      if (token) {
        const endpoint = isAdmin ? "/admin/posts" : "/posts/public";
        console.log("Fetching posts from endpoint:", endpoint);
        const { data } = await API.instance.get<PostResponseDto[]>(endpoint);
        return data;
      } else {
        // If not authenticated, use the public API
        console.log("Fetching posts from public endpoint");
        const { data } = await publicApi.get<PostResponseDto[]>("/posts/public");
        return data;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      return handleApiError(error);
    }
  }

  static async fetchPostById(id: number): Promise<PostResponseDto> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Decode the JWT token to check user role
    const decodedToken = jwtDecode(token) as { role?: string };
    const role = String(decodedToken.role || '').trim().toUpperCase();
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

    // If user is admin, use the admin endpoint
    if (isAdmin) {
      const response = await this.instance.get<PostResponseDto>(`/admin/posts/${id}`);
    return response.data;
  }

    // For non-admin users, try authenticated endpoint first
    try {
      const response = await this.instance.get<PostResponseDto>(`/posts/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        // If 403, try public endpoint
        const response = await publicApi.get<PostResponseDto>(`/posts/${id}/public`);
    return response.data;
      }
      throw error;
    }
  }

  static async createPost(postDto: CreatePostDto): Promise<PostResponseDto> {
    try {
      const { data } = await this.instance.post<PostResponseDto>("/posts/create", postDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updatePost(postId: number, postDto: UpdatePostDto): Promise<PostResponseDto> {
    try {
      const { data } = await this.instance.put<PostResponseDto>(`/admin/posts/${postId}`, postDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deletePost(postId: number): Promise<GenericDeleteResponse> {
    try {
      const { data, status } = await this.instance.delete<GenericDeleteResponse>(`/admin/posts/${postId}`);
      // For 204 No Content responses, return a success response
      if (status === 204) {
        return { success: true, message: "Post deleted successfully" };
      }
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Please log in to delete posts");
        } else if (error.response?.status === 404) {
          throw new Error("Post not found or has been deleted");
        } else if (error.response?.status === 403) {
          throw new Error("You don't have permission to delete this post");
        }
      }
      return handleApiError(error);
    }
  }

  static async searchPosts(keyword: string): Promise<PostResponseDto[]> {
    try {
      const { data } = await this.instance.get<PostResponseDto[]>(`/admin/posts/search?keyword=${keyword}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async filterPostsByCategory(category: string): Promise<PostResponseDto[]> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in filterPostsByCategory:", error);
        }
      }
      
      if (isAdmin) {
        const { data } = await this.instance.get<PostResponseDto[]>(`/admin/posts/filter?category=${category}`);
        return data;
      } else {
        const { data } = await this.instance.get<PostResponseDto[]>("/posts/public");
        return data.filter(post => post.category === category);
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchPostMetrics(): Promise<PostMetricsDto> {
    try {
      const { data } = await this.instance.get<PostMetricsDto>("/admin/posts/metrics");
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchPostsByDateRange(start: string, end: string): Promise<PostResponseDto[]> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchPostsByDateRange:", error);
        }
      }
      
      if (isAdmin) {
        const { data } = await this.instance.get<PostResponseDto[]>("/admin/posts/date-range", {
          params: { start, end }
        });
        return data;
      } else {
        const { data } = await this.instance.get<PostResponseDto[]>("/posts/public");
        const startDate = new Date(start).getTime();
        const endDate = new Date(end).getTime();
        
        return data.filter(post => {
          const postDate = new Date(post.createdAt).getTime();
          return postDate >= startDate && postDate <= endDate;
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Fetches trending posts from the server.
   * This function is used to get trending posts without applying any filters.
   * For filtered posts, use the appropriate filter functions.
   */
  static fetchTrendingPosts = async (): Promise<PostResponseDto[]> => {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchTrendingPosts:", error);
        }
      }
      
      const endpoint = isAdmin ? "/admin/posts/trending" : "/posts/trending";
      console.log("Fetching trending posts from endpoint:", endpoint);
      
      const { data } = await API.instance.get<PostResponseDto[]>(endpoint);
      
      if (!isAdmin) {
        return data
          .sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0))
          .slice(0, 10);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      return handleApiError(error);
    }
  }

  static async bulkDeletePosts(postIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(
        "/admin/posts/bulk",
        { params: { ids: postIds } }
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /* =================== REACTION API =================== */
  static async addReaction(
    postId: number,
    type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY',
    commentId?: number
  ): Promise<string> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Use the regular endpoint for user reactions
      const endpoint = "/reactions/react";
      const payload = commentId 
        ? { commentId, type }
        : { postId, type };

      // Completely disable logging for reaction endpoints
      const { data } = await this.instance.post<string>(
        endpoint, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Please log in to react");
        } else if (error.response?.status === 404) {
          throw new Error(commentId ? "Comment not found" : "Post not found");
        } else if (error.response?.status === 400) {
          throw new Error("You've already reacted to this item");
        }
      }
      return handleApiError(error);
    }
  }

  static async removeReaction(postId: number): Promise<GenericDeleteResponse> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Completely disable logging for reaction endpoints
      const { data } = await this.instance.delete<GenericDeleteResponse>(
        `/reactions/user/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Please log in to remove reactions");
        } else if (error.response?.status === 403) {
          throw new Error("You don't have permission to remove this reaction");
        } else if (error.response?.status === 404) {
          throw new Error("Reaction not found or has been deleted");
        }
      }
      return handleApiError(error);
    }
  }

  static async getPostReactions(postId: number): Promise<ReactionResponseDto[]> {
    try {
      const { data } = await this.instance.get<ReactionResponseDto[]>(`/reactions/post/${postId}`);
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Post not found or has been deleted");
      }
      return handleApiError(error);
    }
  }

  static async getUserReaction(postId: number): Promise<ReactionResponseDto | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      
      const response = await this.instance.get<ReactionResponseDto>(`/reactions/user/post/${postId}`);
      // If response is empty (no data), return null
      if (!response.data) {
        return null;
      }
    return response.data;
    } catch (error) {
      // For any error, return null without logging
      return null;
    }
  }

  /* =============== NOTIFICATION API =============== */
  static async fetchAllNotifications(params: Record<string, unknown> = {}): Promise<NotificationResponseDto[]> {
    try {
      const { data } = await this.instance.get<NotificationResponseDto[]>("/admin/notifications", { params });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchNotificationById(notificationId: number): Promise<NotificationResponseDto> {
    try {
      const { data } = await this.instance.get<NotificationResponseDto>(`/admin/notifications/${notificationId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async markNotificationAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.put<{ success: boolean; message: string }>(
        `/admin/notifications/${notificationId}/read`
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async bulkMarkNotificationsAsRead(notificationIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.put<{ success: boolean; message: string }>(
        "/admin/notifications/mark-read",
        notificationIds
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(
        `/admin/notifications/${notificationId}`
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async bulkDeleteNotifications(notificationIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(
        "/admin/notifications/bulk",
        { params: { ids: notificationIds } }
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchFilteredNotifications(params: NotificationFilterParams): Promise<NotificationResponseDto[]> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const queryParams = new URLSearchParams();
      
      // Add category filter if it's not ALL
      if (params.category && params.category !== "ALL") {
        queryParams.append('category', params.category);
      }
      
      // Add type filter if it's not ALL
      if (params.type && params.type !== "ALL") {
        queryParams.append('type', params.type);
      }
      
      // Add read status filter
      if (params.isRead !== undefined) {
        queryParams.append('isRead', params.isRead.toString());
      }
      
      // Add date range filters
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      // Add search term filter
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);

      // Add pagination parameters
      queryParams.append('page', params.page?.toString() || '0');
      queryParams.append('size', params.size?.toString() || '50');

      // Add sort parameters
      queryParams.append('sort', 'createdAt,desc');

      const { data } = await this.instance.get<NotificationResponseDto[]>(`/admin/notifications?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Process and validate notification types
      return data.map(notification => ({
        ...notification,
        notificationType: this.validateNotificationType(notification.notificationType)
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        } else if (error.response?.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
      }
      throw error;
    }
  }

  private static validateNotificationType(type: string): NotificationType {
    const validTypes = [
      'POST_CREATED',
      'POST_UPDATED',
      'POST_DELETED',
      'POST_DELETED_BY_ADMIN',
      'POST_UPDATED_BY_ADMIN',
      'COMMENT_REPLIED',
      'COMMENT_REACTED',
      'COMMENT_DELETED_BY_ADMIN',
      'COMMENT_UPDATED_BY_ADMIN',
      'GROUP_CREATED',
      'GROUP_JOIN_REQUEST',
      'GROUP_JOIN_APPROVED',
      'GROUP_MEMBER_JOINED',
      'GROUP_DELETED',
      'GROUP_DELETED_BY_ADMIN',
      'EVENT_CREATED',
      'EVENT_INVITATION',
      'EVENT_CANCELLED',
      'EVENT_REMINDER',
      'EVENT_DELETED',
      'EVENT_DELETED_BY_ADMIN',
      'EVENT_UPDATED',
      'USER_REGISTERED',
      'USER_BANNED_BY_ADMIN'
    ] as const;

    return validTypes.includes(type as any) ? type as NotificationType : 'POST_CREATED' as NotificationType;
  }

  static async fetchNotificationStats(): Promise<NotificationStatsDto> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const { data } = await this.instance.get<NotificationStatsDto>("/admin/notifications/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        } else if (error.response?.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
      }
      throw error;
    }
  }

  /* ================= REACTION API ================= */
  static async fetchAllReactions(): Promise<ReactionResponseDto[]> {
    try {
      const { data } = await this.instance.get<ReactionResponseDto[]>("/admin/reactions");
      return data;
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return handleApiError(error);
    }
  }

  static async fetchPostDetails(postId: number): Promise<PostResponseDto> {
    try {
      const { data } = await this.instance.get<PostResponseDto>(`/admin/posts/${postId}`);
      return data;
    } catch (error) {
      console.error('Error fetching post details:', error);
      return handleApiError(error);
    }
  }

  static async fetchCommentDetails(commentId: number): Promise<CommentResponseDto> {
    try {
      const { data } = await this.instance.get<CommentResponseDto>(`/admin/comments/${commentId}`);
      return {
        ...data,
        postId: data.postId || 0,
        parentCommentId: data.parentCommentId || null,
        reactionCount: data.reactionCount || 0,
        reactionTypes: data.reactionTypes || {},
        replies: data.replies || []
      };
    } catch (error) {
      console.error('Error fetching comment details:', error);
      return handleApiError(error);
    }
  }

  // User methods
  static async updateUserProfile(userId: number, data: UpdateUserDto): Promise<UserResponseDto> {
    const response = await this.instance.put<UserResponseDto>(`/users/${userId}`, data);
    return response.data;
  }

  static async createUser(userDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Log the request details for debugging
      console.log('Creating user with token:', token.substring(0, 10) + '...');
      console.log('User data:', userDto);

      const { data } = await this.instance.post<UserResponseDto>("/admin/create", userDto, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Log successful response
      console.log('User created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        } else if (error.response?.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data?.message || "Invalid user data provided.");
        }
      }
      return handleApiError(error);
    }
  }

  static async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(`/admin/delete-user/${userId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async createEvent(eventDto: CreateEventDto): Promise<EventResponseDto> {
    try {
      const { data } = await this.instance.post<EventResponseDto>("/events/create", eventDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchEventById(eventId: number): Promise<EventResponseDto> {
    try {
      // Always use admin endpoint since this is called from admin panel
      const { data } = await this.instance.get<EventResponseDto>(`/admin/events/${eventId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteEvent(eventId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(`/admin/events/${eventId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async updateEvent(eventId: number, eventDto: UpdateEventDto): Promise<EventResponseDto> {
    try {
      const { data } = await this.instance.put<EventResponseDto>(`/admin/events/${eventId}`, eventDto);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Admin methods
  static async getStats(): Promise<any> {
    const response = await this.instance.get('/admin/stats');
    return response.data;
  }

  static async getAdminStats(): Promise<AdminStats> {
    try {
      const { data } = await this.instance.get<AdminStats>('/admin/stats');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Group request methods
  static async joinGroup(groupId: number): Promise<void> {
    await this.instance.post(`/groups/${groupId}/join`);
  }

  static async leaveGroup(groupId: number): Promise<void> {
    await this.instance.post(`/groups/${groupId}/leave`);
  }

  static async fetchPostsByGroup(groupId: number): Promise<PostResponseDto[]> {
    const response = await this.instance.get<PostResponseDto[]>(`/groups/${groupId}/posts`);
    return response.data;
  }

  static async fetchAllEvents(): Promise<EventResponseDto[]> {
    try {
      const { data } = await this.instance.get<EventResponseDto[]>("/admin/events");
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchUserActivities(userId: number): Promise<UserActivity[]> {
    try {
      const { data } = await this.instance.get<UserActivity[]>(`/users/${userId}/activities`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchAllUsers(): Promise<UserResponseDto[]> {
    try {
      const { data } = await this.instance.get<UserResponseDto[]>('/admin/users');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchReactionStats(): Promise<ReactionStatsDto> {
    const response = await this.instance.get<ReactionStatsDto>('/api/admin/reactions/stats');
    return response.data;
  }

  // User profile endpoints
  static async fetchUserProfileByUsername(username: string): Promise<UsersDto | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null; // Return null instead of throwing for unauthenticated users
      }
      
      // Skip API call if username matches current user
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.sub === username) {
          return null;
        }
      } catch (error) {
        // If token decode fails, continue with the API call
      }
      
      const response = await this.instance.get<UsersDto>(`/users/profile/${username}`);
      return response.data;
    } catch (error) {
      // For any error on user profile endpoints, just return null without logging
      return null;
    }
  }

  static async fetchPublicPostById(postId: number): Promise<PostResponseDto | null> {
    try {
      const response = await publicApi.get<PostResponseDto>(`/posts/public/${postId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          // Return null for 403 errors without throwing
          return null;
        } else if (error.response?.status === 404) {
          // Return null for 404 errors without throwing
          return null;
        }
      }
      // For other errors, return null without logging
      return null;
    }
  }

  // User profile endpoints
  static async fetchPublicUserProfile(username: string): Promise<{ username: string; firstName: string; lastName: string; imageUrl: string } | null> {
    try {
      const response = await publicApi.get<{ username: string; firstName: string; lastName: string; imageUrl: string }>(`/users/profile/${username}/public`);
      return response.data;
    } catch (error) {
      // Return null for any error without logging
      return null;
    }
  }
}

export default API;
