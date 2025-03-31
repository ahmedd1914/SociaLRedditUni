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

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
    
    throw new ApiError(message, status, data);
  }
  
  throw error instanceof Error 
    ? error 
    : new Error("Unknown error occurred");
};

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      '/posts/public',
      '/groups/public',
      '/posts/trending',
      '/posts/filter',
      '/posts/date-range'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint) || 
      (config.url?.match(/\/posts\/\d+\/public/))
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("token");
      console.log('Request URL:', config.url);
      console.log('Token exists:', !!token);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers.Authorization);
      }
    }
    
    // Log the request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Log the response details
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (isAxiosError(error)) {
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
      
      if (error.response?.status === 405) {
        console.error("API Method Not Supported:", error.config?.method, error.config?.url);
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
      return data;
    } catch (error) {
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
          return await this.fetchUserById(userId);
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

  static async fetchUserById(userId: number): Promise<UsersDto> {
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
  static async fetchAllPosts(): Promise<PostResponseDto[]> {
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
      
      const endpoint = isAdmin ? "/admin/posts" : "/posts/public";
      const { data } = await this.instance.get<PostResponseDto[]>(endpoint);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchPostById(postId: number): Promise<PostResponseDto> {
    try {
      const token = localStorage.getItem("token");
      let isAdmin = false;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const role = String((decoded as any)?.role || "").trim();
          isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        } catch (error) {
          console.error("Error decoding token in fetchPostById:", error);
        }
      }
      
      const endpoint = isAdmin ? `/admin/posts/${postId}` : `/posts/${postId}`;
      const { data } = await this.instance.get<PostResponseDto>(endpoint);
      return data;
    } catch (error) {
      return handleApiError(error);
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

  static async deletePost(postId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(`/admin/posts/${postId}`);
      return data;
    } catch (error) {
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

  static async fetchTrendingPosts(): Promise<PostResponseDto[]> {
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
      
      const endpoint = isAdmin ? "/admin/posts/trending" : "/posts/public";
      const { data } = await this.instance.get<PostResponseDto[]>(endpoint);
      
      if (!isAdmin) {
        return data
          .sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0))
          .slice(0, 10);
      }
      
      return data;
    } catch (error) {
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
    type: 'UPVOTE' | 'DOWNVOTE' | 'LIKE' | 'LOVE' | 'LAUGH' | 'SAD' | 'ANGRY'
  ): Promise<ReactionResponseDto> {
    try {
      const { data } = await this.instance.post<ReactionResponseDto>("/reactions/add", { postId, type });
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Please log in to react to posts");
        } else if (error.response?.status === 404) {
          throw new Error("Post not found or has been deleted");
        } else if (error.response?.status === 400) {
          throw new Error("You've already reacted to this post");
        }
      }
      return handleApiError(error);
    }
  }

  static async removeReaction(postId: number, reactionId?: number): Promise<GenericDeleteResponse> {
    try {
      const { data } = await this.instance.delete<GenericDeleteResponse>(
        `/reactions/remove?postId=${postId}${reactionId ? `&reactionId=${reactionId}` : ''}`
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Please log in to remove reactions");
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
      const { data } = await this.instance.get<ReactionResponseDto>(`/reactions/user/post/${postId}`);
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        } else if (error.response?.status === 401) {
          throw new Error("Please log in to view your reactions");
        }
      }
      return handleApiError(error);
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

  static async fetchNotificationStats(): Promise<NotificationStatsDto> {
    try {
      const { data } = await this.instance.get<NotificationStatsDto>("/admin/notifications/stats");
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /* ================= REACTION API ================= */
  static async fetchAllReactions(): Promise<ReactionResponseDto[]> {
    try {
      const { data } = await this.instance.get<ReactionResponseDto[]>("/admin/reactions");
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchReactionById(reactionId: number): Promise<ReactionResponseDto> {
    try {
      const { data } = await this.instance.get<ReactionResponseDto>(`/admin/reactions/${reactionId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async deleteReaction(reactionId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await this.instance.delete<{ success: boolean; message: string }>(
        `/admin/reactions/${reactionId}`
      );
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchReactionsByType(type: string): Promise<ReactionResponseDto[]> {
    try {
      const { data } = await this.instance.get<ReactionResponseDto[]>(`/admin/reactions/search?type=${type}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static async fetchReactionStats(): Promise<ReactionStatsDto> {
    try {
      const { data } = await this.instance.get<ReactionStatsDto>("/admin/reactions/stats");
      return data;
    } catch (error) {
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
      const { data } = await this.instance.post<UserResponseDto>("/users/create", userDto);
      return data;
    } catch (error) {
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
}

export default api;
