// Visibility (e.g., for posts, groups, comments)
export enum Visibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

// Category (for events, groups, posts, etc.)
export enum Category {
    DISCUSSION = "DISCUSSION",
    ANNOUNCEMENT = "ANNOUNCEMENT",
    PROJECT = "PROJECT",
    GENERAL = "GENERAL",
    TECH = "TECH",
    ART = "ART",
    MUSIC = "MUSIC",
    SPORTS = "SPORTS",
    GAMING = "GAMING",
    ENTERTAINMENT = "ENTERTAINMENT",
    SCIENCE = "SCIENCE"
}

// EventStatus (for events)
export enum EventStatus {
    SCHEDULED = 'SCHEDULED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

// NotificationType (for notifications)
export enum NotificationType {
    COMMENT = 'COMMENT',
    LIKE = 'LIKE',
    FOLLOW = 'FOLLOW',
    MENTION = 'MENTION',
}

// ReactionType (for reactions)
export enum ReactionType {
    LIKE = 'LIKE',
    LOVE = 'LOVE',
    WOW = 'WOW',
    HAHA = 'HAHA',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
}

// Role (for user roles)
export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MODERATOR = 'MODERATOR',
}

// EventPrivacy (for event creation/updating)
export enum EventPrivacy {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}

/* =========================
   REQUEST DTOs
   (Data sent to the backend)
   =========================*/
export interface GenericDeleteResponse {
    success: boolean;
    message: string;
}
/** AdminActionDto.java */
export interface AdminActionDto {
    userId: number;
    newRole: Role;
}

/** ChatMessageDto.java */
export interface ChatMessageDto {
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string; // ISO string (from LocalDateTime)
}

/** CreateCommentDto.java */
export interface CreateCommentDto {
    content: string;         // NotBlank
    mediaUrl?: string;
    postId: number;          // NotNull
    parentCommentId?: number | null;
    visibility: Visibility;  // default = PUBLIC in backend
}

/** CreateEventDto.java */
export interface CreateEventDto {
    name: string;
    description?: string;
    date: string;            // ISO string (LocalDateTime)
    location?: string;
    groupId?: number;
    category?: Category;
    privacy?: EventPrivacy;
    eventStatus?: EventStatus; 
}

/** CreateGroupDto.java */
export interface CreateGroupDto {
    name: string;
    description?: string;
    visibility: Visibility;  // default = PUBLIC in backend
    category: Category;
}

/** CreateNotificationDto.java */
export interface CreateNotificationDto {
    message: string;
    notificationType: NotificationType;
    recipientId: number;
    relatedPostId?: number;
    relatedCommentId?: number;
}

/** CreatePostDto.java */
export interface CreatePostDto {
    title: string;
    content: string;
    category: Category;
    visibility: Visibility;
    groupId?: number;
}

/** EventFeedbackDto.java */
export interface EventFeedbackDto {
    eventId: number;
    userId: number;
    rating: number;          // e.g., 1-5 stars
    comment?: string;
}

/** GroupJoinRequestDto.java */
export interface GroupJoinRequestDto {
    groupId: number;
}

/** JoinGroupDto.java */
export interface JoinGroupDto {
    userId: number;
    groupId: number;
}

/** LoginUserDto.java */
export interface LoginUserDto {
    email: string;
    password: string;
}

/** ReactionDto.java */
export interface ReactionDto {
    type: ReactionType;      // Must not be null
    postId?: number;
    commentId?: number;
}

/** RegisterUserDto.java */
export interface RegisterUserDto {
    email: string;
    password: string;
    username: string;
}

/** RequestDto.java */
export interface RequestDto {
    id: number;
    userId: number;
    username: string;
    groupId: number;
    groupName: string;
    requestDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/** UpdateCommentDto.java */
export interface UpdateCommentDto {
    content: string;         // NotBlank
    mediaUrl?: string;
}

/** UpdateEventDto.java */
export interface UpdateEventDto {
    name?: string;
    description?: string;
    date?: string;           // ISO string (or Date if parsed)
    location?: string;
    category?: Category;
    status?: string;         // e.g., "PLANNED", "ONGOING", etc.
    privacy?: EventPrivacy;
    statuis?: EventStatus;
}

/** VerifyUserDto.java */
export interface VerifyUserDto {
    email: string;
    verificationCode: string;
}

export type UpdateUserDto = {
    fname: string;
    lname: string;
    phoneNumber?: string;
    username: string;
    email: string;
    imgUrl?: string;
    role?: string;
    enabled: boolean;
  };
/* =========================
   RESPONSE DTOs
   (Data returned from the backend)
   =========================*/

/** CommentResponseDto.java */
export interface CommentResponseDto {
    id: number;
    username: string;
    content: string;
    mediaUrl: string;
    visibility: Visibility;
    createdAt: string;       // ISO string (LocalDateTime)
    reactionCount: number;
    reactionTypes: Record<string, number>;
    parentCommentId: number | null;
    isDeleted: boolean;
    replies: CommentResponseDto[];
}

/** EventResponseDto.java */
export interface EventResponseDto {
    id: number;
    name: string;
    description: string;
    date: string;
    location: string;
    organizerId: number;
    groupId: number | null;
    category: Category;
    status: EventStatus;
    privacy: EventPrivacy;
    createdAt: string;
    updatedAt: string;
}

/** GroupResponseDto.java */
export interface GroupResponseDto {
    id: number;
    name: string;
    description: string;
    memberCount: number;
    visibility: Visibility;
    category: Category;
    ownerId: number | null;
    adminIds: number[];
    memberIds: number[];
}

/** LoginResponse.java */
export interface LoginResponse {
    token: string;
    expiresIn: number;
}

/** NotificationResponseDto.java */
export interface NotificationResponseDto {
    id: number;
    message: string;
    notificationType: NotificationType;
    isRead: boolean;
    createdAt: string;
    relatedPostId: number | null;
    relatedCommentId: number | null;
}

/** PostResponseDto.java */
export interface PostResponseDto {
    id: number;
    title: string;
    content: string;
    category: Category;
    visibility: Visibility;
    username: string;
    createdAt: string;
    image: string;
    reactionCount: number;
    reactionTypes: Record<string, number>;
    comments: CommentResponseDto[];
    groupId?: number;
}

/** ReactionResponseDto.java */
export interface ReactionResponseDto {
    id: number;
    userId: number;
    username: string;
    postId: number | null;
    postTitle: string;
    type: string;
    timestamp: string;
}

/** UsersDto.java */
export interface UsersDto {
    id: number;
    fname: string;
    lname: string;
    username: string;
    email: string;
    phoneNumber?: string;
    role: Role;
    enabled: boolean;
    lastLogin: string; 
    imgUrl?: string;
    createdAt: string;
}
// In interfaces.ts
export interface UpdatePostDto {
    title?: string;
    content?: string;
    category?: Category;
    visibility?: Visibility;
    groupId?: number;
}

export interface ChatMessageDto {
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string; // LocalDateTime => ISO string
}

export interface MessageStatsDto {
    totalMessages: number;
    deletedForEveryone: number;
    messagesBySender: { [key: string]: number };
}

export interface NotificationStatsDto {
    totalNotifications: number;
    unreadCount: number;
    recentNotificationsCount: number;
    notificationsByType: Record<string, number>;
}

export interface PendingJoinRequestDto {
    userId: number;
    // or userName, requestedAt, etc. - match your backend
}
export interface ReactionStatsDto {
    totalReactions: number;
    mostCommonReaction: string;
    recentReactionsCount: number;
    reactionsByType: Record<string, number>;
}
export interface PostSummary {
    id: number;
    title: string;
    image: string;
    reactionCount: number;
    commentCount: number;
    createdAt: string;
}
export interface PostMetricsDto {
    latestPost: PostSummary;
    mostReactedPost: PostSummary;
    mostCommentedPost: PostSummary;
}

export interface DecodedToken {
    sub: string;
    id?: number;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export interface MessageResponseDto {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    read: boolean;
    groupId?: number;
    groupName?: string;
}

export interface GroupMessageStats {
    totalMessages: number;
    activeUsers: number;
    averageMessagesPerDay: number;
    mostActiveUser: string;
}

export interface ReactionResponseDto {
    id: number;
    userId: number;
    username: string;
    postId: number | null;
    postTitle: string;
    type: string;
    timestamp: string;
}

export interface ReactionStats {
    totalReactions: number;
    upvotes: number;
    downvotes: number;
    likes: number;
    mostActivePost: {
        id: number;
        title: string;
        reactionCount: number;
    };
    mostActiveUser: {
        id: number;
        username: string;
        reactionCount: number;
    };
}

export interface CreateUserDto {
    fname: string;
    lname: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}

export interface UserActivity {
    id: number;
    type: 'POST' | 'COMMENT' | 'GROUP';
    title: string;
    content?: string;
    createdAt: string;
    entityId: number;
}

export interface UserResponseDto {
    id: number;
    fname: string;
    lname: string;
    username: string;
    email: string;
    phoneNumber?: string;
    role: Role;
    enabled: boolean;
    lastLogin: string;
    imgUrl?: string;
    createdAt: string;
}

export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalGroups: number;
    totalEvents: number;
    totalMessages: number;
    totalGroupRequests: number;
    recentUsers: UserResponseDto[];
}