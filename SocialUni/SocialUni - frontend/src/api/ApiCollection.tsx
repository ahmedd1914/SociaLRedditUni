import axios from 'axios';
import {
    // Auth
    RegisterUserDto,
    LoginUserDto,
    LoginResponse,
    VerifyUserDto,
    // Comments
    UpdateCommentDto,
    CommentResponseDto,
    // Events
    UpdateEventDto,
    EventResponseDto,
    // Groups
    GroupResponseDto,
    // Notifications
    NotificationResponseDto,
    NotificationStatsDto,
    // Posts
    PostResponseDto,
    UpdatePostDto,
    // Reactions
    ReactionResponseDto,
    ReactionStatsDto,
    // Users
    UsersDto,
    Visibility,
    GenericDeleteResponse,
    // Newly added placeholders
    ChatMessageDto,
    MessageStatsDto,
    PendingJoinRequestDto, PostMetricsDto,
} from './interfaces';

// 1. Create a single Axios instance with baseURL from environment variables
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
});

// 2. Interceptor to attach token on every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // or sessionStorage, cookies, etc.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ===================== AUTH API ===================== */
export const registerUser = async (
    registerUserDto: RegisterUserDto
): Promise<LoginResponse> => {
    try {
        const { data } = await axiosInstance.post<LoginResponse>('/auth/signup', registerUserDto);
        console.log('registerUser:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const loginUser = async (
    loginUserDto: LoginUserDto
): Promise<LoginResponse> => {
    try {
        const { data } = await axiosInstance.post<LoginResponse>('/auth/login', loginUserDto);
        console.log('loginUser:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const verifyUser = async (
    verifyUserDto: VerifyUserDto
): Promise<{ success: boolean; message: string }> => {
    try {
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            '/auth/verify',
            verifyUserDto
        );
        console.log('verifyUser:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const resendVerificationCode = async (
    email: string
): Promise<GenericDeleteResponse> => {
    try {
        const { data } = await axiosInstance.post<GenericDeleteResponse>(
            `/auth/resend?email=${email}`
        );
        console.log('resendVerificationCode:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* =================== ADMIN COMMENT API =================== */
export const fetchAllComments = async (): Promise<CommentResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<CommentResponseDto[]>('/admin/comments');
        console.log('fetchAllComments:', data);
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
        const { data } = await axiosInstance.get<CommentResponseDto>(`/admin/comments/${commentId}`);
        console.log('fetchCommentById:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
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
        console.log('updateComment:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const deleteComment = async (
    commentId: number,
    adminId: number
): Promise<GenericDeleteResponse> => {
    try {
        const { data } = await axiosInstance.delete<GenericDeleteResponse>(
            `/admin/comments/${commentId}?adminId=${adminId}`
        );
        console.log('deleteComment:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* =================== ADMIN EVENT API =================== */
export const fetchAllEvents = async (): Promise<EventResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<EventResponseDto[]>('/admin/events');
        console.log('fetchAllEvents:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const updateEvent = async (
    eventId: number,
    updateEventDto: UpdateEventDto
): Promise<EventResponseDto> => {
    try {
        const { data } = await axiosInstance.put<EventResponseDto>(
            `/admin/events/${eventId}`,
            updateEventDto
        );
        console.log('updateEvent:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const deleteEvent = async (
    eventId: number
): Promise<GenericDeleteResponse> => {
    try {
        const { data } = await axiosInstance.delete<GenericDeleteResponse>(
            `/admin/events/${eventId}`
        );
        console.log('deleteEvent:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* =================== ADMIN GROUP API =================== */
export const fetchAllGroups = async (): Promise<GroupResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<GroupResponseDto[]>('/admin/groups');
        console.log('fetchAllGroups:', data);
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
        const { data } = await axiosInstance.get<GroupResponseDto>(`/admin/groups/${groupId}`);
        console.log('fetchGroupById:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const deleteGroup = async (
    groupId: number,
    userId: number
): Promise<{ success: boolean; message: string }> => {
    try {
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/groups/${groupId}/user/${userId}`
        );
        console.log('deleteGroup:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
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
        console.log('changeGroupVisibility:', data);
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
        console.log('transferGroupOwnership:', data);
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
        console.log('getPendingJoinRequests:', data);
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
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            `/admin/groups/${groupId}/approve/${userId}?adminId=${adminId}`
        );
        console.log('approveJoinRequest:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/groups/${groupId}/reject/${userId}`
        );
        console.log('rejectJoinRequest:', data);
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
        const { data } = await axiosInstance.get<UsersDto[]>(`/admin/groups/${groupId}/members`);
        console.log('fetchGroupMembers:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/groups/${groupId}/remove/${userId}`
        );
        console.log('removeUserFromGroup:', data);
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
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            `/admin/groups/${groupId}/add/${userId}`
        );
        console.log('addUserToGroup:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
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
        console.log('fetchGroupMessages:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/group-messages/${messageId}?adminId=${adminId}`
        );
        console.log('deleteMessageForEveryone:', data);
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
        console.log('fetchMessageStats:', data);
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
            '/admin/notifications',
            { params }
        );
        console.log('fetchAllNotifications:', data);
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
        console.log('fetchNotificationById:', data);
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
        const { data } = await axiosInstance.put<{ success: boolean; message: string }>(
            `/admin/notifications/${notificationId}/read`
        );
        console.log('markNotificationAsRead:', data);
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
        const { data } = await axiosInstance.put<{ success: boolean; message: string }>(
            '/admin/notifications/mark-read',
            notificationIds
        );
        console.log('bulkMarkNotificationsAsRead:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/notifications/${notificationId}`
        );
        console.log('deleteNotification:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            '/admin/notifications/bulk',
            { data: notificationIds }
        );
        console.log('bulkDeleteNotifications:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const fetchNotificationStats = async (): Promise<NotificationStatsDto> => {
    try {
        const { data } = await axiosInstance.get<NotificationStatsDto>(
            '/admin/notifications/stats'
        );
        console.log('fetchNotificationStats:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* =================== ADMIN POST API =================== */
export const fetchAllPosts = async (): Promise<PostResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<PostResponseDto[]>('/admin/posts');
        console.log('fetchAllPosts:', data);
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
        const { data } = await axiosInstance.get<PostResponseDto>(`/admin/posts/${postId}`);
        console.log('fetchPostById:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
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
        console.log('updatePost:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/posts/${postId}`
        );
        console.log('deletePost:', data);
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
        console.log('searchPosts:', data);
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
        const { data } = await axiosInstance.get<PostResponseDto[]>(
            `/admin/posts/filter?category=${category}`
        );
        console.log('filterPostsByCategory:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const fetchPostMetrics = async (): Promise<PostMetricsDto> => {
    try {
        const { data } = await axiosInstance.get<PostMetricsDto>('/admin/posts/metrics');
        console.log('fetchPostMetrics:', data);
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
        const { data } = await axiosInstance.get<PostResponseDto[]>('/admin/posts/date-range', {
            params: { start, end },
        });
        console.log('fetchPostsByDateRange:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const fetchTrendingPosts = async (): Promise<PostResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<PostResponseDto[]>('/admin/posts/trending');
        console.log('fetchTrendingPosts:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            '/admin/posts/bulk',
            { data: postIds }
        );
        console.log('bulkDeletePosts:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* ================= ADMIN REACTION API ================= */
export const fetchAllReactions = async (): Promise<ReactionResponseDto[]> => {
    try {
        const { data } = await axiosInstance.get<ReactionResponseDto[]>('/admin/reactions');
        console.log('fetchAllReactions:', data);
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
        const { data } = await axiosInstance.get<ReactionResponseDto>(`/admin/reactions/${reactionId}`);
        console.log('fetchReactionById:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/reactions/${reactionId}`
        );
        console.log('deleteReaction:', data);
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
        console.log('fetchReactionsByType:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const fetchReactionStats = async (): Promise<ReactionStatsDto> => {
    try {
        const { data } = await axiosInstance.get<ReactionStatsDto>('/admin/reactions/stats');
        console.log('fetchReactionStats:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/* =================== ADMIN USER API =================== */
export const fetchAllUsers = async (): Promise<UsersDto[]> => {
    try {
        const { data } = await axiosInstance.get<UsersDto[]>('/admin/users');
        console.log('fetchAllUsers:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const searchUsers = async (
    username: string,
    role: string
): Promise<UsersDto[]> => {
    try {
        const { data } = await axiosInstance.get<UsersDto[]>('/admin/users/search', {
            params: { username, role },
        });
        console.log('searchUsers:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const banUser = async (
    userId: number
): Promise<{ success: boolean; message: string }> => {
    try {
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            `/admin/ban-user/${userId}`
        );
        console.log('banUser:', data);
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
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            `/admin/unban-user/${userId}`
        );
        console.log('unbanUser:', data);
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
        const { data } = await axiosInstance.post<{ success: boolean; message: string }>(
            '/admin/change-role',
            { userId, newRole }
        );
        console.log('changeUserRole:', data);
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
        const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/admin/delete-user/${userId}`
        );
        console.log('deleteUser:', data);
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export default axiosInstance;
