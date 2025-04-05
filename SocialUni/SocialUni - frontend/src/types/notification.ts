export type NotificationType = 
  | 'POST_CREATED'
  | 'POST_UPDATED'
  | 'POST_DELETED'
  | 'POST_DELETED_BY_ADMIN'
  | 'POST_UPDATED_BY_ADMIN'
  | 'COMMENT_REPLIED'
  | 'COMMENT_REACTED'
  | 'COMMENT_DELETED_BY_ADMIN'
  | 'COMMENT_UPDATED_BY_ADMIN'
  | 'ALL';

export type NotificationCategory = 'ALL' | 'POST' | 'COMMENT' | 'GROUP' | 'EVENT';

export interface NotificationFilterParams {
  type: NotificationType | "ALL";
  category: NotificationCategory;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
}

export interface NotificationResponseDto {
  id: number;
  notificationType: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
} 