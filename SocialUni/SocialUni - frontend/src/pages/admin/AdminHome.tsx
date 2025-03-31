import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { UseQueryOptions } from '@tanstack/react-query';

import {
  MdGroup,
  MdInventory2,
  MdPeople,
  MdNotifications,
  MdEvent,
  MdMessage,
  MdThumbUp,
  MdComment,
  MdAdminPanelSettings,
} from "react-icons/md";
import { API } from '../../api/api';
import { AdminStats, UserResponseDto, DecodedToken, NotificationStatsDto, ReactionStatsDto, GroupMessageStats } from '../../api/interfaces';
import { HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineChatAlt2, HiOutlineUser } from 'react-icons/hi';

const AdminHome = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    console.log('Token exists:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      navigate("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      console.log('Decoded token:', {
        role: decoded.role,
        sub: decoded.sub,
        exp: decoded.exp
      });
      
      const isAdmin = decoded.role === "ROLE_ADMIN" || decoded.role === "ADMIN";
      console.log('Is admin:', isAdmin);

      if (!isAdmin) {
        console.log("AdminHome - Non-admin user detected, redirecting to error page");
        navigate("/error");
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
      navigate("/error");
    }
  }, [navigate]);

  // Set up query options
  const queryOptions = {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  };

  // Fetch admin stats
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, error: statsError } = useQuery<AdminStats, Error>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        console.log('Fetching admin stats...');
        const data = await API.getAdminStats();
        console.log('Admin stats response:', data);
        return data;
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Show error message if stats fetch fails
  React.useEffect(() => {
    if (isStatsError) {
      console.error('Admin stats error:', statsError);
      toast.error(`Failed to load admin statistics: ${statsError?.message || 'Unknown error'}`);
    }
  }, [isStatsError, statsError]);

  // Fetch notification stats
  const { data: notificationStats } = useQuery<NotificationStatsDto>({
    queryKey: ['notification-stats'],
    queryFn: API.fetchNotificationStats,
    ...queryOptions
  });

  // Fetch reaction stats
  const { data: reactionStats } = useQuery<ReactionStatsDto>({
    queryKey: ['reaction-stats'],
    queryFn: API.fetchReactionStats,
    ...queryOptions
  });

  // Quick access cards based on backend controllers
  const adminFeatures = [
    { title: "Users", icon: <MdPeople className="text-3xl" />, route: "/admin/users", color: "bg-primary", count: stats?.totalUsers || 0 },
    { title: "Posts", icon: <MdInventory2 className="text-3xl" />, route: "/admin/posts", color: "bg-secondary", count: stats?.totalPosts || 0 },
    { title: "Comments", icon: <MdComment className="text-3xl" />, route: "/admin/comments", color: "bg-accent", count: stats?.totalComments || 0 },
    { title: "Groups", icon: <MdGroup className="text-3xl" />, route: "/admin/groups", color: "bg-info", count: stats?.totalGroups || 0 },
    { title: "Reactions", icon: <MdThumbUp className="text-3xl" />, route: "/admin/reactions", color: "bg-success", count: reactionStats?.totalReactions || 0 },
    { title: "Notifications", icon: <MdNotifications className="text-3xl" />, route: "/admin/notifications", color: "bg-warning", count: notificationStats?.totalNotifications || 0 },
    { title: "Events", icon: <MdEvent className="text-3xl" />, route: "/admin/events", color: "bg-error", count: stats?.totalEvents || 0 },
    { title: "Messages", icon: <MdMessage className="text-3xl" />, route: "/admin/messages", color: "bg-neutral", count: stats?.totalMessages || 0 },
    { title: "Group Requests", icon: <MdAdminPanelSettings className="text-3xl" />, route: "/admin/group-requests", color: "bg-primary-focus", count: stats?.totalGroupRequests || 0 },
  ];

  if (isStatsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {adminFeatures.map((feature, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={() => navigate(feature.route)}
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="stat-value text-2xl">{feature.count}</div>
              </div>
              <h2 className="card-title mt-2">{feature.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users Section */}
      <div className="bg-base-100 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Users</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/users')}
          >
            View All Users
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers?.map((user: UserResponseDto, index: number) => (
                <tr key={index} className="hover">
                  <td className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img src={user.imgUrl || "https://placehold.co/100x100"} alt={user.username} />
                      </div>
                    </div>
                    {user.username}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${user.enabled ? 'badge-success' : 'badge-error'}`}>
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      {reactionStats && (
        <div className="mt-8 bg-base-100 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reaction Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Total Reactions</div>
              <div className="stat-value">{reactionStats.totalReactions}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Most Common Reaction</div>
              <div className="stat-value">{reactionStats.mostCommonReaction}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Recent Reactions</div>
              <div className="stat-value">{reactionStats.recentReactionsCount}</div>
            </div>
          </div>
        </div>
      )}

      {notificationStats && (
        <div className="mt-8 bg-base-100 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Total Notifications</div>
              <div className="stat-value">{notificationStats.totalNotifications}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Unread Notifications</div>
              <div className="stat-value">{notificationStats.unreadCount}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Recent Notifications</div>
              <div className="stat-value">{notificationStats.recentNotificationsCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
