import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from '../../api/api';
import { DecodedToken, NotificationResponseDto, NotificationType, NotificationStatsDto } from "../../api/interfaces";
import { HiOutlineBell, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineFunnel } from "react-icons/hi2";
import { FaComment, FaHeart, FaUserPlus, FaAt, FaChartBar, FaCalendar, FaCog, FaShieldAlt, FaUsers } from "react-icons/fa";
import { NotificationFilterParams, NotificationCategory } from '../../types/notification';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Notifications = () => {
  const queryClient = useQueryClient();
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filterParams, setFilterParams] = useState<NotificationFilterParams>({
    type: 'ALL',
    category: 'ALL',
    isRead: undefined,
    startDate: '',
    endDate: '',
    searchTerm: '',
    page: 0,
    size: 10
  });

  const notificationsQueryOptions: UseQueryOptions<NotificationResponseDto[], Error> = {
    queryKey: ['notifications', filterParams],
    queryFn: () => API.fetchFilteredNotifications(filterParams),
    staleTime: 30000,
    retry: false
  };

  const statsQueryOptions: UseQueryOptions<NotificationStatsDto, Error> = {
    queryKey: ["notificationStats"],
    queryFn: () => API.fetchNotificationStats(),
    retry: false
  };

  const { data: notifications = [], isLoading, error } = useQuery(notificationsQueryOptions);
  const { data: notificationStats, isLoading: statsLoading, error: statsError } = useQuery(statsQueryOptions);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user) {
      toast.error("Authentication required");
      navigate('/login');
      return;
    }

    const role = String(user.role || '').trim().toUpperCase();
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
    
    if (!isAdmin) {
      toast.error("You need admin privileges to access this page");
      navigate('/home');
    }
  }, [user, navigate]);

  // Handle errors
  if (error) {
    if (error.message.includes("Access denied")) {
      toast.error("You don't have permission to view notifications. Admin access required.");
    } else if (error.message.includes("Authentication required")) {
      toast.error("Please log in to view notifications.");
    } else {
      toast.error("Failed to load notifications. Please try again later.");
    }
  }

  if (statsError) {
    if (statsError.message.includes("Access denied")) {
      toast.error("You don't have permission to view notification stats. Admin access required.");
    } else if (statsError.message.includes("Authentication required")) {
      toast.error("Please log in to view notification stats.");
    } else {
      toast.error("Failed to load notification stats. Please try again later.");
    }
  }

  const handleFilterChange = (key: keyof NotificationFilterParams, value: any) => {
    setFilterParams((prev: NotificationFilterParams) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 0 })
    }));
  };

  // Filter categories for the dropdown
  const categories: Array<{ value: NotificationCategory, label: string }> = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'POST', label: 'Posts' },
    { value: 'COMMENT', label: 'Comments' },
    { value: 'GROUP', label: 'Groups' },
    { value: 'EVENT', label: 'Events' }
  ];

  // Handle selection of all notifications
  const handleSelectAll = () => {
    if (selectedNotifications.length === (notifications?.length || 0)) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications?.map(n => n.id) || []);
    }
  };

  // Handle selection of a single notification
  const handleSelectNotification = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => API.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error(error);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => API.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete notification");
      console.error(error);
    }
  });

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      // Post notifications
      case NotificationType.POST_CREATED:
        return <FaHeart className="text-red-500" />;
      case NotificationType.POST_COMMENTED:
        return <FaHeart className="text-red-500" />;
      case NotificationType.POST_REACTED:
        return <FaHeart className="text-red-500" />;
      case NotificationType.POST_DELETED_BY_ADMIN:
      case NotificationType.POST_UPDATED_BY_ADMIN:
        return <FaHeart className="text-red-500" />;

      // Comment notifications
      case NotificationType.COMMENT_REPLIED:
        return <FaComment className="text-blue-500" />;
      case NotificationType.COMMENT_REACTED:
        return <FaHeart className="text-pink-500" />;
      case NotificationType.COMMENT_DELETED_BY_ADMIN:
      case NotificationType.COMMENT_UPDATED_BY_ADMIN:
        return <FaComment className="text-red-500" />;

      // Group notifications
      case NotificationType.GROUP_CREATED:
        return <FaUsers className="text-green-500" />;
      case NotificationType.GROUP_JOIN_REQUEST:
        return <FaUsers className="text-green-500" />;
      case NotificationType.GROUP_JOIN_APPROVED:
        return <FaUsers className="text-green-500" />;
      case NotificationType.GROUP_MEMBER_JOINED:
        return <FaUsers className="text-green-500" />;
      case NotificationType.GROUP_DELETED:
      case NotificationType.GROUP_DELETED_BY_ADMIN:
        return <FaUsers className="text-green-500" />;

      // Event notifications
      case NotificationType.EVENT_CREATED:
        return <FaCalendar className="text-blue-500" />;
      case NotificationType.EVENT_INVITATION:
        return <FaCalendar className="text-blue-500" />;
      case NotificationType.EVENT_CANCELLED:
        return <FaCalendar className="text-blue-500" />;
      case NotificationType.EVENT_REMINDER:
        return <FaCalendar className="text-blue-500" />;
      case NotificationType.EVENT_DELETED:
      case NotificationType.EVENT_DELETED_BY_ADMIN:
        return <FaCalendar className="text-blue-500" />;
      case NotificationType.EVENT_UPDATED:
        return <FaCalendar className="text-blue-500" />;

      // User notifications
      case NotificationType.USER_REGISTERED:
        return <FaUserPlus className="text-orange-500" />;
      case NotificationType.USER_BANNED_BY_ADMIN:
        return <FaUserPlus className="text-orange-500" />;

      default:
        return <HiOutlineBell className="text-gray-500" />;
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (selectedNotifications.length === 0) {
      return toast.error("No notifications selected");
    }
    selectedNotifications.forEach(id => markAsReadMutation.mutate(id));
  };

  // Delete selected notifications
  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      return toast.error("No notifications selected");
    }
    selectedNotifications.forEach(id => deleteNotificationMutation.mutate(id));
  };

  return (
    <div className="w-full p-2 md:p-4">
      <div className="flex flex-col gap-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HiOutlineBell className="text-primary" /> Notifications
            </h1>
            {!statsLoading && !statsError && notificationStats && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {notificationStats.totalNotifications} total • {notificationStats.unreadNotifications} unread
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setShowStats(!showStats)}
            >
              <FaChartBar /> Statistics
            </button>
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleSelectAll}
            >
              {selectedNotifications.length === notifications.length ? "Deselect All" : "Select All"}
            </button>
            
            <button 
              className="btn btn-sm btn-success"
              disabled={selectedNotifications.length === 0}
              onClick={handleMarkAllAsRead}
            >
              <HiOutlineCheckCircle /> Mark as Read
            </button>
            
            <button 
              className="btn btn-sm btn-error"
              disabled={selectedNotifications.length === 0}
              onClick={handleDeleteSelected}
            >
              <HiOutlineTrash /> Delete
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && !statsError && notificationStats && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Notification Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="stat">
                  <div className="stat-title">Last 24 Hours</div>
                  <div className="stat-value">{notificationStats.notificationsLast24Hours}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Last 7 Days</div>
                  <div className="stat-value">{notificationStats.notificationsLast7Days}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Last 30 Days</div>
                  <div className="stat-value">{notificationStats.notificationsLast30Days}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Read Rate</div>
                  <div className="stat-value">
                    {((notificationStats.readNotifications / notificationStats.totalNotifications) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">By Type</div>
                  <div className="stat-value">
                    {Object.entries(notificationStats.notificationsByType).map(([type, count]) => (
                      <div key={type} className="text-sm">
                        {type}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <HiOutlineFunnel /> Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={filterParams.category}
                  onChange={(e) => handleFilterChange('category', e.target.value as NotificationCategory)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={filterParams.type}
                  onChange={(e) => handleFilterChange('type', e.target.value as NotificationType | "ALL")}
                >
                  <option value="ALL">All Types</option>
                  {Object.values(NotificationType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date Range</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    className="input input-bordered"
                    value={filterParams.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                  <input 
                    type="date" 
                    className="input input-bordered"
                    value={filterParams.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered"
                  placeholder="Search notifications..."
                  value={filterParams.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Unread Only</span>
                  <input 
                    type="checkbox" 
                    className="checkbox" 
                    checked={filterParams.isRead === false}
                    onChange={(e) => handleFilterChange('isRead', e.target.checked ? false : undefined)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <HiOutlineExclamationCircle className="text-xl" />
              <span>Error loading notifications: {error.message}</span>
            </div>
          ) : notifications.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="w-12">
                    <input 
                      type="checkbox" 
                      className="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="w-12">Type</th>
                  <th>Message</th>
                  <th className="w-40">Date</th>
                  <th className="w-24">Status</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className={notification.isRead ? "" : "font-semibold"}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                      />
                    </td>
                    <td>{getNotificationIcon(notification.notificationType)}</td>
                    <td>{notification.message}</td>
                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${notification.isRead ? "badge-ghost" : "badge-primary"}`}>
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button 
                            className="btn btn-xs btn-outline btn-success"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <HiOutlineCheckCircle />
                          </button>
                        )}
                        <button 
                          className="btn btn-xs btn-outline btn-error"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alert">
              <HiOutlineBell className="text-xl" />
              <span>No notifications found.</span>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!isLoading && !error && notifications && notifications.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Page {(filterParams.page || 0) + 1} • {filterParams.size || 10} per page
              </span>
              <select 
                className="select select-bordered select-sm"
                value={filterParams.size || 10}
                onChange={(e) => handleFilterChange('size', Number(e.target.value))}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-sm"
                onClick={() => handleFilterChange('page', (filterParams.page || 0) - 1)}
                disabled={(filterParams.page || 0) === 0}
              >
                Previous
              </button>
              <button 
                className="btn btn-sm"
                onClick={() => handleFilterChange('page', (filterParams.page || 0) + 1)}
                disabled={notifications.length < (filterParams.size || 10)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 