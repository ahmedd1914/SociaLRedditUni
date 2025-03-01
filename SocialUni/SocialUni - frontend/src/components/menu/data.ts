// import toast from 'react-hot-toast';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineDocumentChartBar,
  HiOutlinePencilSquare,
  HiOutlinePresentationChartBar,
  HiOutlineDocumentText,
  HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2';
import { IoSettingsOutline } from 'react-icons/io5';

/**
 * ADMIN MENU CONFIG
 *
 * Each item references specific Admin controllers/endpoints.
 * See the comments for the corresponding backend routes.
 */

export const menu = [
  {
    catalog: 'main',
    listItems: [
      {
        // Admin Home / Dashboard
        // Endpoints may include:
        // - GET /admin/summary (for overall stats)
        // - GET /admin/whatever-your-dashboard-needs
        isLink: true,
        url: '/admin/home',
        icon: HiOutlineHome,
        label: 'dashboard',
      },
      {
        // Admin Profile
        // Endpoints may include:
        // - GET /admin/profile
        // - PUT /admin/profile (update admin info)
        isLink: true,
        url: '/admin/profile',
        icon: HiOutlineUser,
        label: 'profile',
      },
    ],
  },
  {
    catalog: 'management',
    listItems: [
      {
        // AdminUserController
        // e.g.:
        // - GET /admin/users
        // - GET /admin/users/search?username=...&role=...
        // - POST /admin/ban-user/{userId}
        // - POST /admin/unban-user/{userId}
        // - POST /admin/change-role
        // - DELETE /admin/delete-user/{userId}
        isLink: true,
        url: '/admin/users',
        icon: HiOutlineUsers,
        label: 'users',
      },
      {
        // AdminPostController
        // e.g.:
        // - GET /admin/posts
        // - GET /admin/posts/{postId}
        // - PUT /admin/posts/{postId}
        // - DELETE /admin/posts/{postId}
        // - GET /admin/posts/search?keyword=...
        // - GET /admin/posts/filter?category=...
        // - GET /admin/posts/stats
        // - GET /admin/posts/trending
        // - DELETE /admin/posts/bulk
        isLink: true,
        url: '/admin/posts',
        icon: HiOutlineDocumentChartBar,
        label: 'posts',
      },
      {
        // AdminCommentController
        // e.g.:
        // - GET /admin/comments
        // - GET /admin/comments/{commentId}
        // - PUT /admin/comments/{commentId}
        // - DELETE /admin/comments/{commentId}?adminId=...
        isLink: true,
        url: '/admin/comments',
        icon: HiOutlineDocumentText,
        label: 'comments',
      },
      {
        // AdminEventController
        // e.g.:
        // - GET /admin/events
        // - GET /admin/events/{eventId}
        // - PUT /admin/events/{eventId}
        // - DELETE /admin/events/{eventId}
        isLink: true,
        url: '/admin/events',
        icon: HiOutlinePresentationChartBar,
        label: 'events',
      },
    ],
  },
  {
    catalog: 'groups & messages',
    listItems: [
      {
        // AdminGroupController
        // e.g.:
        // - GET /admin/groups
        // - GET /admin/groups/{groupId}
        // - DELETE /admin/groups/{groupId}/user/{userId}
        // - PUT /admin/groups/{groupId}/visibility?visibility=...
        // - PUT /admin/groups/{groupId}/transfer/{newOwnerId}
        // - GET /admin/groups/{groupId}/join-requests?adminId=...
        // - POST /admin/groups/{groupId}/approve/{userId}?adminId=...
        // - DELETE /admin/groups/{groupId}/reject/{userId}
        // - GET /admin/groups/{groupId}/members
        // - DELETE /admin/groups/{groupId}/remove/{userId}
        // - POST /admin/groups/{groupId}/add/{userId}
        isLink: true,
        url: '/admin/groups',
        icon: HiOutlinePencilSquare,
        label: 'groups',
      },
      {
        // AdminMessageController (Group Messages)
        // e.g.:
        // - GET /admin/group-messages/group/{groupId}
        // - DELETE /admin/group-messages/{messageId}?adminId=...
        // - GET /admin/group-messages/group/{groupId}/stats
        isLink: true,
        url: '/admin/group-messages',
        icon: HiOutlineArrowLeftOnRectangle,
        label: 'group messages',
      },
    ],
  },
  {
    catalog: 'notifications',
    listItems: [
      {
        // AdminNotificationController
        // e.g.:
        // - GET /admin/notifications
        // - GET /admin/notifications/{notificationId}
        // - PUT /admin/notifications/{notificationId}/read
        // - PUT /admin/notifications/mark-read
        // - DELETE /admin/notifications/{notificationId}
        // - DELETE /admin/notifications/bulk
        // - GET /admin/notifications/stats
        isLink: true,
        url: '/admin/notifications',
        icon: IoSettingsOutline,
        label: 'notifications',
      },
    ],
  },
  {
    catalog: 'miscellaneous',
    listItems: [
      {
        // If you have a separate AdminSettingsController
        // e.g.:
        // - GET /admin/settings
        // - PUT /admin/settings
        isLink: true,
        url: '/admin/settings',
        icon: IoSettingsOutline,
        label: 'settings',
      },
      {
        // Log out functionality
        // e.g.:
        // - POST /auth/logout
        // or clear localStorage token
        isLink: true,
        url: '/logout',
        icon: HiOutlineArrowLeftOnRectangle,
        label: 'log out',
      },
    ],
  },
];
