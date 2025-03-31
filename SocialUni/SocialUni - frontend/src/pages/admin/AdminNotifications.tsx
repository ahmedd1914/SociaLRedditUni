import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API } from "../../api/api";
import { DecodedToken, NotificationResponseDto, NotificationType, NotificationStatsDto } from "../../api/interfaces";
import { HiOutlineBell, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi2";
import { FaComment, FaHeart, FaUserPlus, FaAt } from "react-icons/fa";

const Notifications = () => {
  const queryClient = useQueryClient();
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<NotificationType | "ALL">("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<NotificationResponseDto[]>({
    queryKey: ["notifications"],
    queryFn: () => API.fetchAllNotifications(),
  });

  // Fetch notification stats
  const { 
    data: notificationStats, 
    isLoading: statsLoading 
  } = useQuery<NotificationStatsDto>({
    queryKey: ["notificationStats"],
    queryFn: () => API.fetchNotificationStats(),
  });

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

  // Bulk mark as read mutation
  const bulkMarkAsReadMutation = useMutation({
    mutationFn: (ids: number[]) => API.bulkMarkNotificationsAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
      setSelectedNotifications([]);
      toast.success("Notifications marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark notifications as read");
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

  // Bulk delete notifications mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => API.bulkDeleteNotifications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
      setSelectedNotifications([]);
      toast.success("Notifications deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete notifications");
      console.error(error);
    }
  });

  // Handle selection of all notifications
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n: NotificationResponseDto) => n.id));
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

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.COMMENT:
        return <FaComment className="text-blue-500" />;
      case NotificationType.LIKE:
        return <FaHeart className="text-red-500" />;
      case NotificationType.FOLLOW:
        return <FaUserPlus className="text-green-500" />;
      case NotificationType.MENTION:
        return <FaAt className="text-purple-500" />;
      default:
        return <HiOutlineBell className="text-gray-500" />;
    }
  };

  // Filter notifications based on type and read status
  const filteredNotifications = notifications.filter((notification: NotificationResponseDto) => {
    if (filterType !== "ALL" && notification.notificationType !== filterType) {
      return false;
    }
    
    if (showUnreadOnly && notification.isRead) {
      return false;
    }
    
    return true;
  });

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (selectedNotifications.length === 0) {
      return toast.error("No notifications selected");
    }
    bulkMarkAsReadMutation.mutate(selectedNotifications);
  };

  // Delete selected notifications
  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      return toast.error("No notifications selected");
    }
    bulkDeleteMutation.mutate(selectedNotifications);
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
            {!statsLoading && notificationStats && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {notificationStats.totalNotifications} total • {notificationStats.unreadCount} unread
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filters */}
            <select 
              className="select select-sm select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | "ALL")}
            >
              <option value="ALL">All Types</option>
              <option value={NotificationType.COMMENT}>Comments</option>
              <option value={NotificationType.LIKE}>Likes</option>
              <option value={NotificationType.FOLLOW}>Follows</option>
              <option value={NotificationType.MENTION}>Mentions</option>
            </select>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="checkbox checkbox-sm" 
                checked={showUnreadOnly}
                onChange={() => setShowUnreadOnly(!showUnreadOnly)}
              />
              <span className="text-sm">Unread only</span>
            </label>
            
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleSelectAll}
            >
              {selectedNotifications.length === filteredNotifications.length ? "Deselect All" : "Select All"}
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
        
        {/* Notifications list */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : isError ? (
            <div className="alert alert-error">
              <HiOutlineExclamationCircle className="text-xl" />
              <span>Error loading notifications. Please try again later.</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="alert">
              <HiOutlineBell className="text-xl" />
              <span>No notifications found.</span>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="w-12">
                    <input 
                      type="checkbox" 
                      className="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
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
                {filteredNotifications.map(notification => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 