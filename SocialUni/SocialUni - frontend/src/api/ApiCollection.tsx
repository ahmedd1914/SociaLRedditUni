import axios from "axios";
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
  // Newly added placeholders
  ChatMessageDto,
  MessageStatsDto,
  PendingJoinRequestDto,
  PostMetricsDto,
  // Token handling
  DecodedToken,
} from "./interfaces";
import { jwtDecode } from "jwt-decode";

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Define type for AxiosError
interface AxiosError {
  response?: {
    data?: any;
    status?: number;
  };
  message: string;
  config?: {
    method?: string;
    url?: string;
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

// 1. Create a single Axios instance with baseURL from environment variables
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: function(params: Record<string, any>) {
    // Filter out non-primitive types and internal objects
    const cleanParams: Record<string, string | number | boolean | Array<string | number | boolean>> = {};
    
    for (const key in params) {
      const value = params[key];
      
      // Skip null, undefined, or objects (except arrays of primitives)
      if (value === null || value === undefined) continue;
      
      // Handle arrays of primitives
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
      
      // Only include primitive values
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
    // Handle Axios errors
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    const data = error.response?.data;
    
    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem("token");
      // You might want to redirect to login page here
    }
    
    throw new ApiError(message, status, data);
  }
  
  // Handle non-Axios errors
  throw error instanceof Error 
    ? error 
    : new Error("Unknown error occurred");
};

// 2. Interceptor to attach token on every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Ensure config.headers exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (isAxiosError(error)) {
      // Handle JWT expiration errors
      const responseText = String(error.response?.data || '');
      const isJwtExpired = responseText.includes("JWT expired") || 
                          error.response?.status === 401;
      
      if (isJwtExpired) {
        // Clear invalid token
        localStorage.removeItem("token");
        
        // Redirect to login page
        if (window.location.pathname !== "/login") {
          // Use window.location for a full page refresh to clear any state
          window.location.href = "/login?expired=true";
        }
        
        return Promise.reject(new Error("Session expired. Please log in again."));
      }
      
      // Handle method not supported errors (405)
      if (error.response?.status === 405) {
        console.error("API Method Not Supported:", error.config?.method, error.config?.url);
        return Promise.reject(new Error("An operation failed due to unsupported method. Please try again later."));
      }
      
      if (!navigator.onLine) {
        // Network error when offline
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

/* ===================== AUTH API ===================== */
// 1) REGISTER
export const registerUser = async (
  registerUserDto: RegisterUserDto
): Promise<string> => {
  try {
    const { data } = await axiosInstance.post<string>(
      "/auth/signup",
      registerUserDto
    );
    const token = data; // because backend sends plain string
    localStorage.setItem("token", token);
    return token;
  } catch (error) {
    return handleApiError(error);
  }
};

// 2) LOGIN
export const loginUser = async (
  loginUserDto: LoginUserDto
): Promise<{ token: string; expiresIn: number }> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      loginUserDto,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const data = response.data;

    if (!data || !data.token) {
      throw new Error("Invalid response from login API");
    }

    // Store token
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
      } else {
        throw new Error(`Login failed: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// 3) LOGOUT
export const logoutUser = async (): Promise<string> => {
  // Get token, but don't throw an error if not found
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found for logout, user already logged out");
    return "Already logged out";
  }

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response: AxiosResponse<string> = await axiosInstance.post<string>(
      "/auth/logout",
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error);
    // Don't rethrow the error since the user is already logged out on the client side
    return "Logged out locally";
  }
};

// 4) VERIFY USER
export const verifyUser = async (
  verifyUserDto: VerifyUserDto
): Promise<any> => {
  try {
    // Validate token exists
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please log in first.");
    }

    // Check token validity
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      if (decoded.exp * 1000 < Date.now()) {
        // Token expired, clear it and throw error
        localStorage.removeItem("token");
        throw new Error("Your session has expired. Please log in again.");
      }
    } catch (decodeError) {
      // Invalid token format, clear it
      localStorage.removeItem("token");
      throw new Error("Invalid authentication token. Please log in again.");
    }

    // Send verification request with token
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axiosInstance.post(
      "/auth/verify",
      verifyUserDto,
      config
    );
    return data;
  } catch (error) {
    // Handle axios errors differently than token validation errors
    if (!isAxiosError(error)) {
      throw error;
    }
    
    console.error("Verification API error:", error);
    
    // Handle specific backend error responses
    if (error.response?.status === 400) {
      throw new Error("Invalid verification code. Please try again.");
    } else if (error.response?.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Your session has expired. Please log in again.");
    } else {
      throw new Error("Verification failed. Please try again later.");
    }
  }
};

// 5) RESEND CODE
export const resendVerificationCode = async (
  email: string
): Promise<GenericDeleteResponse> => {
  try {
    if (!email || !email.trim()) {
      throw new Error("Email is required to resend verification code");
    }
    
    const { data } = await axiosInstance.post<GenericDeleteResponse>(
      `/auth/resend?email=${encodeURIComponent(email.trim())}`
    );
    return data;
  } catch (error) {
    console.error("Error resending verification code:", error);
    
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
};

/* =================== ADMIN COMMENT API =================== */
export const fetchAllComments = async (): Promise<CommentResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<CommentResponseDto[]>(
      "/admin/comments"
    );
    console.log("fetchAllComments:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchCommentById = async (
  commentId: number
): Promise<CommentResponseDto> => {
  try {
    const { data } = await axiosInstance.get<CommentResponseDto>(
      `/admin/comments/${commentId}`
    );
    console.log("fetchCommentById:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const createComment = async (
  commentDto: CreateCommentDto
): Promise<CommentResponseDto> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axiosInstance.post<CommentResponseDto>(
      "/comments/create",
      commentDto,
      config
    );
    console.log("Comment created:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (createComment):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (createComment):", error);
    }
    throw error;
  }
};
export const updateComment = async (
  commentId: number,
  updateCommentDto: UpdateCommentDto
): Promise<CommentResponseDto> => {
  try {
    const { data } = await axiosInstance.put<CommentResponseDto>(
      `/admin/comments/${commentId}`,
      updateCommentDto
    );
    console.log("updateComment:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteComment = async (
  commentId: number
): Promise<GenericDeleteResponse> => {
  try {
    const { data } = await axiosInstance.delete<GenericDeleteResponse>(
      `/admin/comments/${commentId}`
    );
    console.log("deleteComment:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchActiveComments = async (): Promise<CommentResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<CommentResponseDto[]>(
      "/admin/comments/active_comments" 
    );
    console.log("fetchActiveComments:", data);
    return data;
  } catch (err) {
    console.error("Error fetching active comments:", err);
    throw err;
  }
};

/* =================== ADMIN EVENT API =================== */
export const fetchAllEvents = async (): Promise<EventResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<EventResponseDto[]>(
      "/admin/events"
    );
    console.log("fetchAllEvents:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchEventById = async (eventId: number): Promise<EventResponseDto> => {
  try {
    const { data } = await axiosInstance.get<EventResponseDto>(`/events/${eventId}`);
    console.log("fetchEventById:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createEvent = async (createEventDto: CreateEventDto): Promise<EventResponseDto> => {
  try {
    const { data } = await axiosInstance.post<EventResponseDto>("/events/create", createEventDto);
    console.log("createEvent:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateEvent = async (eventId: number, updateEventDto: UpdateEventDto): Promise<EventResponseDto> => {
  try {
    const { data } = await axiosInstance.put<EventResponseDto>(`/admin/events/${eventId}`, updateEventDto);
    console.log("updateEvent:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/events/${eventId}`);
    console.log("deleteEvent: success");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/* =================== ADMIN GROUP API =================== */
export const fetchAllGroups = async (): Promise<GroupResponseDto[]> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchAllGroups:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    const endpoint = isAdmin ? "/admin/groups" : "/groups/public";
    
    const { data } = await axiosInstance.get<GroupResponseDto[]>(endpoint);
    console.log("fetchAllGroups:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchGroupById = async (
  groupId: number
): Promise<GroupResponseDto> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchGroupById:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    const endpoint = isAdmin ? `/admin/groups/${groupId}` : `/groups/${groupId}`;
    
    const { data } = await axiosInstance.get<GroupResponseDto>(endpoint);
    console.log("fetchGroupById:", data);
    return data;
  } catch (err) {
    console.error("Error in fetchGroupById:", err);
    throw err;
  }
};
export const createGroup = async (
  groupDto: CreateGroupDto
): Promise<GroupResponseDto> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axiosInstance.post<GroupResponseDto>(
      "/groups/create",
      groupDto,
      config
    );
    console.log("Group created:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (createGroup):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (createGroup):", error);
    }
    throw error;
  }
};
export const deleteGroup = async (
  groupId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/groups/${groupId}`);
    console.log("deleteGroup:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (deleteGroup):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (deleteGroup):", error);
    }
    throw error;
  }
};

export const changeGroupVisibility = async (
  groupId: number,
  visibility: Visibility
): Promise<GroupResponseDto> => {
  try {
    const { data } = await axiosInstance.put<GroupResponseDto>(
      `/admin/groups/${groupId}/visibility?visibility=${visibility}`
    );
    console.log("changeGroupVisibility:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const transferGroupOwnership = async (
  groupId: number,
  newOwnerId: number
): Promise<GroupResponseDto> => {
  try {
    const { data } = await axiosInstance.put<GroupResponseDto>(
      `/admin/groups/${groupId}/transfer/${newOwnerId}`
    );
    console.log("transferGroupOwnership:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getPendingJoinRequests = async (
  groupId: number,
  adminId: number
): Promise<PendingJoinRequestDto[]> => {
  try {
    const { data } = await axiosInstance.get<PendingJoinRequestDto[]>(
      `/admin/groups/${groupId}/join-requests?adminId=${adminId}`
    );
    console.log("getPendingJoinRequests:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const approveJoinRequest = async (
  groupId: number,
  userId: number,
  adminId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/admin/groups/${groupId}/approve/${userId}?adminId=${adminId}`);
    console.log("approveJoinRequest:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const rejectJoinRequest = async (
  groupId: number,
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/groups/${groupId}/reject/${userId}`);
    console.log("rejectJoinRequest:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchGroupMembers = async (
  groupId: number
): Promise<UsersDto[]> => {
  try {
    const { data } = await axiosInstance.get<UsersDto[]>(
      `/admin/groups/${groupId}/members`
    );
    console.log("fetchGroupMembers:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const removeUserFromGroup = async (
  groupId: number,
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/groups/${groupId}/remove/${userId}`);
    console.log("removeUserFromGroup:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addUserToGroup = async (
  groupId: number,
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/admin/groups/${groupId}/add/${userId}`);
    console.log("addUserToGroup:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateGroup = async (
  groupId: number,
  updatedGroupDto: CreateGroupDto,
  userId: number
): Promise<GroupResponseDto> => {
  try {
    const { data } = await axiosInstance.put<GroupResponseDto>(
      `/groups/${groupId}?userId=${userId}`,
      updatedGroupDto
    );
    console.log("updateGroup:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (updateGroup):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (updateGroup):", error);
    }
    throw error;
  }
};

/* ================== ADMIN MESSAGE API ================== */
export const fetchGroupMessages = async (
  groupId: number
): Promise<ChatMessageDto[]> => {
  try {
    const { data } = await axiosInstance.get<ChatMessageDto[]>(
      `/admin/group-messages/group/${groupId}`
    );
    console.log("fetchGroupMessages:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteMessageForEveryone = async (
  messageId: number,
  adminId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/group-messages/${messageId}?adminId=${adminId}`);
    console.log("deleteMessageForEveryone:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchMessageStats = async (
  groupId: number
): Promise<MessageStatsDto> => {
  try {
    const { data } = await axiosInstance.get<MessageStatsDto>(
      `/admin/group-messages/group/${groupId}/stats`
    );
    console.log("fetchMessageStats:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/* =============== ADMIN NOTIFICATION API =============== */
export const fetchAllNotifications = async (
  params: Record<string, unknown> = {}
): Promise<NotificationResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<NotificationResponseDto[]>(
      "/admin/notifications",
      { params }
    );
    console.log("fetchAllNotifications:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchNotificationById = async (
  notificationId: number
): Promise<NotificationResponseDto> => {
  try {
    const { data } = await axiosInstance.get<NotificationResponseDto>(
      `/admin/notifications/${notificationId}`
    );
    console.log("fetchNotificationById:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const markNotificationAsRead = async (
  notificationId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.put<{
      success: boolean;
      message: string;
    }>(`/admin/notifications/${notificationId}/read`);
    console.log("markNotificationAsRead:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const bulkMarkNotificationsAsRead = async (
  notificationIds: number[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.put<{
      success: boolean;
      message: string;
    }>("/admin/notifications/mark-read", notificationIds);
    console.log("bulkMarkNotificationsAsRead:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteNotification = async (
  notificationId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/notifications/${notificationId}`);
    console.log("deleteNotification:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const bulkDeleteNotifications = async (
  notificationIds: number[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/admin/notifications/bulk", { params: { ids: notificationIds } });
    console.log("bulkDeleteNotifications:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchNotificationStats =
  async (): Promise<NotificationStatsDto> => {
    try {
      const { data } = await axiosInstance.get<NotificationStatsDto>(
        "/admin/notifications/stats"
      );
      console.log("fetchNotificationStats:", data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

/* =================== ADMIN POST API =================== */
export const fetchAllPosts = async (): Promise<PostResponseDto[]> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchAllPosts:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    const endpoint = isAdmin ? "/admin/posts" : "/posts/public";
    
    const { data } = await axiosInstance.get<PostResponseDto[]>(endpoint);
    console.log("fetchAllPosts:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchPostById = async (
  postId: number
): Promise<PostResponseDto> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchPostById:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    const endpoint = isAdmin ? `/admin/posts/${postId}` : `/posts/${postId}`;
    
    const { data } = await axiosInstance.get<PostResponseDto>(endpoint);
    console.log("fetchPostById:", data);
    return data;
  } catch (err) {
    console.error("Error in fetchPostById:", err);
    throw err;
  }
};

export const createPost = async (
  postDto: CreatePostDto
): Promise<PostResponseDto> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axiosInstance.post<PostResponseDto>(
      "/posts/create",
      postDto,
      config
    );
    console.log("Post created:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (createPost):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (createPost):", error);
    }
    throw error;
  }
};

export const updatePost = async (
  postId: number,
  postDto: UpdatePostDto
): Promise<PostResponseDto> => {
  try {
    const { data } = await axiosInstance.put<PostResponseDto>(
      `/admin/posts/${postId}`,
      postDto
    );
    console.log("updatePost:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deletePost = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/posts/${postId}`);
    console.log("deletePost:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const searchPosts = async (
  keyword: string
): Promise<PostResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<PostResponseDto[]>(
      `/admin/posts/search?keyword=${keyword}`
    );
    console.log("searchPosts:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const filterPostsByCategory = async (
  category: string
): Promise<PostResponseDto[]> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in filterPostsByCategory:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    if (isAdmin) {
      const { data } = await axiosInstance.get<PostResponseDto[]>(
        `/admin/posts/filter?category=${category}`
      );
      console.log("filterPostsByCategory (admin):", data);
      return data;
    } else {
      // For regular users, fetch public posts and filter on the client side
      const { data } = await axiosInstance.get<PostResponseDto[]>("/posts/public");
      const filteredPosts = data.filter(post => post.category === category);
      console.log("filterPostsByCategory (user):", filteredPosts);
      return filteredPosts;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchPostMetrics = async (): Promise<PostMetricsDto> => {
  try {
    const { data } = await axiosInstance.get<PostMetricsDto>(
      "/admin/posts/metrics"
    );
    console.log("fetchPostMetrics:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchPostsByDateRange = async (
  start: string,
  end: string
): Promise<PostResponseDto[]> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchPostsByDateRange:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    if (isAdmin) {
      const { data } = await axiosInstance.get<PostResponseDto[]>(
        "/admin/posts/date-range",
        {
          params: { start, end },
        }
      );
      console.log("fetchPostsByDateRange (admin):", data);
      return data;
    } else {
      // For regular users, fetch public posts and filter by date on the client side
      const { data } = await axiosInstance.get<PostResponseDto[]>("/posts/public");
      
      const startDate = new Date(start).getTime();
      const endDate = new Date(end).getTime();
      
      const filteredPosts = data.filter(post => {
        const postDate = new Date(post.createdAt).getTime();
        return postDate >= startDate && postDate <= endDate;
      });
      
      console.log("fetchPostsByDateRange (user):", filteredPosts);
      return filteredPosts;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchTrendingPosts = async (): Promise<PostResponseDto[]> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchTrendingPosts:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    // For regular users, we'll use the public posts endpoint and sort by popularity
    const endpoint = isAdmin ? "/admin/posts/trending" : "/posts/public";
    
    const { data } = await axiosInstance.get<PostResponseDto[]>(endpoint);
    
    // For regular users, we'll need to sort the posts by popularity (trending)
    if (!isAdmin) {
      // Simple sorting algorithm for trending: sort by reaction count
      return data.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0)).slice(0, 10);
    }
    
    console.log("fetchTrendingPosts:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const bulkDeletePosts = async (
  postIds: number[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>("/admin/posts/bulk", { params: { ids: postIds } });
    console.log("bulkDeletePosts:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/* ================= ADMIN REACTION API ================= */
export const fetchAllReactions = async (): Promise<ReactionResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<ReactionResponseDto[]>(
      "/admin/reactions"
    );
    console.log("fetchAllReactions:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchReactionById = async (
  reactionId: number
): Promise<ReactionResponseDto> => {
  try {
    const { data } = await axiosInstance.get<ReactionResponseDto>(
      `/admin/reactions/${reactionId}`
    );
    console.log("fetchReactionById:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteReaction = async (
  reactionId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/reactions/${reactionId}`);
    console.log("deleteReaction:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchReactionsByType = async (
  type: string
): Promise<ReactionResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<ReactionResponseDto[]>(
      `/admin/reactions/search?type=${type}`
    );
    console.log("fetchReactionsByType:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchReactionStats = async (): Promise<ReactionStatsDto> => {
  try {
    const { data } = await axiosInstance.get<ReactionStatsDto>(
      "/admin/reactions/stats"
    );
    console.log("fetchReactionStats:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/* =================== ADMIN USER API =================== */
export const fetchAllUsers = async (): Promise<UsersDto[]> => {
  try {
    const { data } = await axiosInstance.get<UsersDto[]>("/admin/users");
    console.log("fetchAllUsers:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchUserById = async (userId: number): Promise<UsersDto> => {
  try {
    // Check for admin role in localStorage token
    const token = localStorage.getItem("token");
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // @ts-ignore - role exists in the decoded token
        const role = String(decoded?.role || "").trim();
        isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
      } catch (error) {
        console.error("Error decoding token in fetchUserById:", error);
      }
    }
    
    // Use the appropriate endpoint based on user role
    const endpoint = isAdmin ? `/admin/users/${userId}` : `/users/${userId}`;
    
    const { data } = await axiosInstance.get<UsersDto>(endpoint);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createUser = async (userDto: CreateUserDto): Promise<UsersDto> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axiosInstance.post<UsersDto>(
      "/admin/create",
      userDto,
      config
    );
    console.log("User created:", data);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        "Axios error (createUser):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error (createUser):", error);
    }
    throw error;
  }
};
export const searchUsers = async (
  username: string,
  role: string
): Promise<UsersDto[]> => {
  try {
    const { data } = await axiosInstance.get<UsersDto[]>(
      "/admin/users/search",
      {
        params: { username, role },
      }
    );
    console.log("searchUsers:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const fetchUserActivity = async (userId: number) => {
  const response = await axiosInstance.get(`/users/${userId}/activities`);
  return response.data;
};

export const banUser = async (
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/admin/ban-user/${userId}`);
    console.log("banUser:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const unbanUser = async (
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/admin/unban-user/${userId}`);
    console.log("unbanUser:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const changeUserRole = async (
  userId: number,
  newRole: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>("/admin/change-role", { userId, newRole });
    console.log("changeUserRole:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const deleteUser = async (
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/admin/delete-user/${userId}`);
    console.log("deleteUser:", data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
export const updateUserProfile = async (
  userId: number,
  updateUserDto: UpdateUserDto
): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    await axiosInstance.put(`/users/${userId}`, updateUserDto, config);
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const fetchPostsByGroup = async (
  groupId: number
): Promise<PostResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<PostResponseDto[]>(
      `/posts/by-group/${groupId}`
    );
    console.log("fetchPostsByGroup:", data);
    return data;
  } catch (err) {
    console.error("Error in fetchPostsByGroup:", err);
    throw err;
  }
};

export const joinGroup = async (
  joinRequest: { groupId: number }
): Promise<any> => {
  try {
    const { data } = await axiosInstance.post(
      `/groups/join/${joinRequest.groupId}`
    );
    console.log("joinGroup:", data);
    return data;
  } catch (err) {
    console.error("Error in joinGroup:", err);
    throw err;
  }
};

/* ================= USER REACTION API ================= */
// Add or update a reaction to a post
export const addReaction = async (
  postId: number,
  type: 'UPVOTE' | 'DOWNVOTE' | 'LIKE' | 'LOVE' | 'LAUGH' | 'SAD' | 'ANGRY'
): Promise<ReactionResponseDto> => {
  try {
    const { data } = await axiosInstance.post<ReactionResponseDto>(
      `/reactions/add`,
      { postId, type }
    );
    console.log("addReaction:", data);
    return data;
  } catch (error) {
    console.error("Error adding reaction:", error);
    
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to react to posts");
      } else if (error.response?.status === 404) {
        throw new Error("Post not found or has been deleted");
      } else if (error.response?.status === 400) {
        throw new Error("You've already reacted to this post");
      }
    }
    
    throw new Error("Failed to add reaction. Please try again later.");
  }
};

// Remove a reaction from a post
export const removeReaction = async (
  postId: number,
  reactionId?: number
): Promise<GenericDeleteResponse> => {
  try {
    const { data } = await axiosInstance.delete<GenericDeleteResponse>(
      `/reactions/remove?postId=${postId}${reactionId ? `&reactionId=${reactionId}` : ''}`
    );
    console.log("removeReaction:", data);
    return data;
  } catch (error) {
    console.error("Error removing reaction:", error);
    
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to remove reactions");
      } else if (error.response?.status === 404) {
        throw new Error("Reaction not found or has been deleted");
      }
    }
    
    throw new Error("Failed to remove reaction. Please try again later.");
  }
};

// Get reactions for a specific post
export const getPostReactions = async (
  postId: number
): Promise<ReactionResponseDto[]> => {
  try {
    const { data } = await axiosInstance.get<ReactionResponseDto[]>(
      `/reactions/post/${postId}`
    );
    console.log("getPostReactions:", data);
    return data;
  } catch (error) {
    console.error("Error getting post reactions:", error);
    
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Post not found or has been deleted");
      }
    }
    
    throw new Error("Failed to get reactions. Please try again later.");
  }
};

// Get current user's reaction to a post
export const getUserReaction = async (
  postId: number
): Promise<ReactionResponseDto | null> => {
  try {
    const { data } = await axiosInstance.get<ReactionResponseDto>(
      `/reactions/user/post/${postId}`
    );
    console.log("getUserReaction:", data);
    return data;
  } catch (error) {
    console.error("Error getting user reaction:", error);
    
    // If the user hasn't reacted, return null (not an error)
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    
    // For other errors, throw
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Please log in to view your reactions");
      }
    }
    
    throw new Error("Failed to get your reaction. Please try again later.");
  }
};

/* ADMIN MESSAGES API */
export const fetchAllMessages = async () => {
  try {
    const response = await axiosInstance.get('/admin/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching all messages:', error);
    throw error;
  }
};

export const fetchGroupChatMessages = async (groupId: number) => {
  try {
    const response = await axiosInstance.get(`/admin/group-messages/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group chat messages for group ${groupId}:`, error);
    throw error;
  }
};

export const deleteMessageAsAdmin = async (messageId: number, adminId: number) => {
  try {
    const response = await axiosInstance.delete(`/admin/group-messages/${messageId}?adminId=${adminId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    throw error;
  }
};

export const getGroupMessageStats = async (groupId: number) => {
  try {
    const response = await axiosInstance.get(`/admin/group-messages/group/${groupId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message stats for group ${groupId}:`, error);
    throw error;
  }
};

/* ADMIN REACTIONS API */
export const fetchAllReactionsAdmin = async () => {
  try {
    const response = await axiosInstance.get('/admin/reactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching all reactions:', error);
    throw error;
  }
};

export const deleteReactionAsAdmin = async (reactionId: number) => {
  try {
    const response = await axiosInstance.delete(`/admin/reactions/${reactionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reaction ${reactionId}:`, error);
    throw error;
  }
};

export const getReactionStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/reactions/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching reaction statistics:', error);
    throw error;
  }
};

/* USER MESSAGES API */
export const getConversation = async (senderId: number, receiverId: number) => {
  try {
    const response = await axiosInstance.get(`/messages/conversation?senderId=${senderId}&receiverId=${receiverId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching conversation between ${senderId} and ${receiverId}:`, error);
    throw error;
  }
};

export const deleteMessageForSelf = async (messageId: number, userId: number) => {
  try {
    const response = await axiosInstance.delete(`/messages/${messageId}/self?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting message ${messageId} for user ${userId}:`, error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UsersDto | null> => {
  try {
    // Get token and decode to get the user ID
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userId = parseInt(decoded.sub, 10);
      
      // Try to get user data using token info only if the API call fails
      try {
        // Use the existing fetchUserById function to get user data
        return await fetchUserById(userId);
      } catch (error) {
        console.error("Error fetching user data, falling back to token data:", error);
        
        // If there's a method not supported error (405), create user from token
        if (isAxiosError(error) && error.response?.status === 405) {
          console.log("Creating user from token due to method not supported error");
          
          // Create a minimal user object from the token data
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
        
        // For 403 forbidden errors, also create from token
        if (isAxiosError(error) && error.response?.status === 403) {
          console.log("Creating user from token due to forbidden error");
          
          // Create a minimal user object from the token data
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
        
        // For other errors, throw to be handled by the caller
        throw error;
      }
    } catch (error) {
      console.error("Error decoding token or fetching current user:", error);
      return null;
    }
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    return null;
  }
};

export default axiosInstance;
